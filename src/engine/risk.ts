import { Alert, AlertSeverity, PHC, StockRecord } from '../types';
import { MEDICINES, STATES } from './config';
import { ForecastResult } from './forecast';

export interface ComputeAlertsOptions {
  phcs: PHC[];
  stockRecords: Record<string, StockRecord>;
  forecasts: Record<string, ForecastResult>; // key: `${phcId}_${medicineId}`
  scenarioName?: string;
}

export function computeAlerts(opts: ComputeAlertsOptions): Alert[] {
  const { phcs, stockRecords, forecasts, scenarioName } = opts;
  const alerts: Alert[] = [];

  const phcMap = new Map<string, PHC>(phcs.map((p) => [p.id, p]));
  const medMap = new Map(MEDICINES.map((m) => [m.id, m]));
  const stateMap = new Map(STATES.map((s) => [s.id, s]));

  Object.values(stockRecords).forEach((stock) => {
    const phc = phcMap.get(stock.phcId);
    if (!phc) return;

    const med = medMap.get(stock.medicineId);
    if (!med) return;

    const state = stateMap.get(phc.stateId);
    const stateName = state?.name || phc.stateId;

    const forecast = forecasts[`${stock.phcId}_${stock.medicineId}`];
    const dailyDemand = forecast?.avgDailyDemand || Math.max(1, Math.round(stock.onHand / 15));

    // Days of Cover = usable stock on hand / forecast daily demand
    const daysOfCover = Number((stock.onHand / Math.max(0.1, dailyDemand)).toFixed(1));

    // Alert Tiers logic based on Lead Time
    // Critical: daysOfCover < leadTime
    // Warning:  daysOfCover < leadTime + 4
    // Watch:    daysOfCover < leadTime + 10
    let severity: AlertSeverity = 'stable';

    if (daysOfCover <= stock.leadTimeDays) {
      severity = 'critical';
    } else if (daysOfCover <= stock.leadTimeDays + 4) {
      severity = 'warning';
    } else if (daysOfCover <= stock.leadTimeDays + 10) {
      severity = 'watch';
    }

    if (severity !== 'stable') {
      // Calculate projected stockout date
      const daysToZero = Math.max(1, Math.floor(daysOfCover));
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysToZero);
      const projectedStockoutDate = targetDate.toISOString().split('T')[0];

      // Identify Drivers
      const drivers: string[] = [];
      
      // Check footfall anomaly
      const footfallZ = computeFootfallZScore(phc.footfallDaily);
      if (footfallZ > 2.0) {
        drivers.push(`Footfall surge (z-score: +${footfallZ.toFixed(1)})`);
      }
      if (stock.onHand < stock.safetyStock) {
        drivers.push(`Stock below safety buffer (${stock.safetyStock} ${med.unit})`);
      }
      if (med.coldChain) {
        drivers.push('Cold-chain handling required');
      }
      if (scenarioName) {
        drivers.push(`Active Emergency: ${scenarioName}`);
      }

      alerts.push({
        id: `alert-${phc.id}-${med.id}`,
        phcId: phc.id,
        phcName: phc.name,
        districtId: phc.districtId,
        districtName: phc.name.split(' ')[1] || phc.districtId,
        stateId: phc.stateId,
        stateName,
        medicineId: med.id,
        medicineName: med.name,
        severity,
        daysOfCover,
        onHand: stock.onHand,
        dailyDemand,
        leadTimeDays: stock.leadTimeDays,
        projectedStockoutDate,
        drivers,
      });
    }
  });

  // Sort alerts by severity (critical > warning > watch) then daysOfCover ascending
  const severityRank: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    watch: 2,
    stable: 3,
  };

  return alerts.sort((a, b) => {
    if (severityRank[a.severity] !== severityRank[b.severity]) {
      return severityRank[a.severity] - severityRank[b.severity];
    }
    return a.daysOfCover - b.daysOfCover;
  });
}

/**
 * Computes rolling z-score of the most recent day's footfall compared to historical window
 */
export function computeFootfallZScore(series: number[], window = 14): number {
  if (series.length < window + 1) return 0;
  const recent = series[series.length - 1];
  const hist = series.slice(series.length - 1 - window, series.length - 1);

  const mean = hist.reduce((a, b) => a + b, 0) / hist.length;
  const variance = hist.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hist.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 0.1) return 0;
  return (recent - mean) / stdDev;
}
