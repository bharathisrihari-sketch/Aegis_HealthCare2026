import { Alert, DistrictInfo, PHC, StockRecord, Transfer } from '../types';
import { MEDICINES } from './config';
import { ForecastResult } from './forecast';

export interface OptimizeTransfersOptions {
  phcs: PHC[];
  stockRecords: Record<string, StockRecord>;
  alerts: Alert[];
  forecasts: Record<string, ForecastResult>;
  districts?: DistrictInfo[];
}

export function generateTransferProposals(opts: OptimizeTransfersOptions): Transfer[] {
  const { phcs, stockRecords, alerts, forecasts, districts = [] } = opts;
  const transfers: Transfer[] = [];

  const phcMap = new Map<string, PHC>(phcs.map((p) => [p.id, p]));
  const medMap = new Map(MEDICINES.map((m) => [m.id, m]));
  const distMap = new Map<string, DistrictInfo>(districts.map((d) => [d.id, d]));

  // 1. Sort alerts by urgency (Critical > Warning) then daysOfCover ascending
  const sortedAlerts = [...alerts]
    .filter((a) => a.severity === 'critical' || a.severity === 'warning')
    .sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, warning: 1, watch: 2, stable: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return a.daysOfCover - b.daysOfCover;
    });

  // 2. Track cumulative surplus per donor & medicine to prevent over-allocation across run
  const availableSurplusMap: Record<string, number> = {};

  phcs.forEach((phc) => {
    MEDICINES.forEach((med) => {
      const donorKey = `${phc.id}_${med.id}`;
      const donorStock = stockRecords[donorKey];
      if (donorStock) {
        const donorForecast = forecasts[donorKey];
        const donorDailyDemand = donorForecast?.avgDailyDemand || Math.max(1, Math.round(donorStock.onHand / 15));
        const minRequiredStock = Math.max(
          donorStock.safetyStock,
          Math.round(donorDailyDemand * (donorStock.leadTimeDays + 10))
        );
        availableSurplusMap[donorKey] = Math.max(0, donorStock.onHand - minRequiredStock);
      }
    });
  });

  sortedAlerts.forEach((alert) => {
    const recipientPhc = phcMap.get(alert.phcId);
    if (!recipientPhc) return;

    const med = medMap.get(alert.medicineId);
    if (!med) return;

    const recipientStock = stockRecords[`${alert.phcId}_${alert.medicineId}`];
    if (!recipientStock) return;

    const forecast = forecasts[`${alert.phcId}_${alert.medicineId}`];
    const dailyDemand = forecast?.avgDailyDemand || Math.max(1, alert.dailyDemand);

    // Desired cover target = leadTime + 10 days
    const targetStock = Math.round(dailyDemand * (recipientStock.leadTimeDays + 10));
    const deficitQty = Math.max(0, targetStock - recipientStock.onHand);

    if (deficitQty <= 0) return;

    // Scan potential donors using remaining available surplus
    const candidates: {
      donorPhc: PHC;
      donorStock: StockRecord;
      surplusQty: number;
      distanceKm: number;
      etaDays: number;
      score: number;
    }[] = [];

    phcs.forEach((donorPhc) => {
      if (donorPhc.id === recipientPhc.id) return; // Cannot transfer to self

      const donorKey = `${donorPhc.id}_${alert.medicineId}`;
      const donorStock = stockRecords[donorKey];
      if (!donorStock) return;

      const remainingSurplus = availableSurplusMap[donorKey] || 0;

      if (remainingSurplus >= med.standardBoxQty) {
        // Calculate haversine distance with road winding multiplier (approx 1.25x for actual road route)
        const straightDistanceKm = computeHaversineDistance(
          recipientPhc.lat,
          recipientPhc.lng,
          donorPhc.lat,
          donorPhc.lng
        );
        const distanceKm = straightDistanceKm * 1.25;

        // Estimate transit ETA (1 day for < 100km, 2 days for < 350km, 3 days for >= 350km)
        let etaDays = 1;
        if (distanceKm >= 100) etaDays = 2;
        if (distanceKm >= 350) etaDays = 3;

        // Cold chain penalty for long distances
        if (med.coldChain && distanceKm > 250) {
          etaDays += 1;
        }

        // Must arrive before recipient runs out of current stock
        const daysToZero = alert.daysOfCover;
        if (isNaN(daysToZero) || etaDays <= Math.max(1, Math.floor(daysToZero))) {
          // Distance penalty prioritizes closer donors
          const distancePenalty = distanceKm * 0.5;
          const score = 100 + remainingSurplus / 20 - distancePenalty;

          candidates.push({
            donorPhc,
            donorStock,
            surplusQty: remainingSurplus,
            distanceKm,
            etaDays,
            score,
          });
        }
      }
    });

    // Sort candidates by score descending
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      const best = candidates[0];
      const donorKey = `${best.donorPhc.id}_${med.id}`;

      // Transfer quantity = minimum of deficit, donor surplus, and standard box multiple
      const rawTransferQty = Math.min(deficitQty, best.surplusQty);
      const roundedQty = Math.max(
        med.standardBoxQty,
        Math.floor(rawTransferQty / med.standardBoxQty) * med.standardBoxQty
      );

      if (roundedQty > 0) {
        // Decrement donor's available surplus map to prevent double allocation across run
        availableSurplusMap[donorKey] -= roundedQty;

        const recipientCoverGainDays = Number((roundedQty / Math.max(1, dailyDemand)).toFixed(1));
        const donorStockAfter = best.donorStock.onHand - roundedQty;

        const donorDistName = distMap.get(best.donorPhc.districtId)?.name || getDistrictName(best.donorPhc.id, best.donorPhc.name);
        const recipientDistName = distMap.get(recipientPhc.districtId)?.name || getDistrictName(recipientPhc.id, recipientPhc.name);

        transfers.push({
          id: `tr-${best.donorPhc.id}-${recipientPhc.id}-${med.id}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          fromPhcId: best.donorPhc.id,
          fromPhcName: best.donorPhc.name,
          fromDistrictName: donorDistName,
          toPhcId: recipientPhc.id,
          toPhcName: recipientPhc.name,
          toDistrictName: recipientDistName,
          medicineId: med.id,
          medicineName: med.name,
          qty: roundedQty,
          distanceKm: Number(best.distanceKm.toFixed(1)),
          etaDays: best.etaDays,
          score: Number(best.score.toFixed(1)),
          status: 'proposed',
          urgency: alert.severity === 'critical' ? 'High Urgency (Critical Stockout)' : 'Medium Urgency (Warning)',
          donorStockAfter,
          recipientCoverGainDays,
        });
      }
    }
  });

  return transfers.sort((a, b) => b.score - a.score);
}

/**
 * Applies an approved transfer to stockRecords and returns updated records
 */
export function applyApprovedTransfer(
  stockRecords: Record<string, StockRecord>,
  transfer: Transfer
): Record<string, StockRecord> {
  // Idempotency check: if transfer is already approved/applied, return unchanged
  if (transfer.status === 'approved') {
    return stockRecords;
  }

  const updated = { ...stockRecords };
  const donorKey = `${transfer.fromPhcId}_${transfer.medicineId}`;
  const recipientKey = `${transfer.toPhcId}_${transfer.medicineId}`;

  const donorStock = updated[donorKey];
  const recipientStock = updated[recipientKey];

  if (!donorStock || !recipientStock) {
    return stockRecords;
  }

  // Deduct from donor using FEFO (shortest dated batch first) and collect actual batches
  const donorBatches = donorStock.batches.map((b) => ({ ...b }));
  let remainingToDeduct = transfer.qty;
  const transferredBatches: { id: string; qty: number; expiryDate: string }[] = [];

  for (const batch of donorBatches) {
    if (remainingToDeduct <= 0) break;
    const deduct = Math.min(batch.qty, remainingToDeduct);
    batch.qty -= deduct;
    remainingToDeduct -= deduct;

    // Carry over actual batch with real expiry date
    transferredBatches.push({
      id: `${batch.id}-xfer-${transfer.toPhcId}`,
      qty: deduct,
      expiryDate: batch.expiryDate,
    });
  }

  const actualDeducted = transfer.qty - remainingToDeduct;
  if (actualDeducted <= 0) {
    return stockRecords;
  }

  updated[donorKey] = {
    ...donorStock,
    onHand: Math.max(0, donorStock.onHand - actualDeducted),
    batches: donorBatches.filter((b) => b.qty > 0),
  };

  // Add to recipient with real batch expiry dates carried over
  updated[recipientKey] = {
    ...recipientStock,
    onHand: recipientStock.onHand + actualDeducted,
    batches: [
      ...recipientStock.batches,
      ...transferredBatches,
    ].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)),
  };

  transfer.status = 'approved';
  return updated;
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates
 */
export function computeHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function getDistrictName(phcId: string, phcName: string): string {
  const parts = phcName.split(' ');
  return parts.length >= 2 ? parts[1] : phcId;
}
