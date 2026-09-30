import { DistrictInfo, Medicine, PHC, StockRecord } from '../types';
import { DISTRICTS_BY_STATE, MEDICINES, SEED_DEFAULT, STATES } from './config';
import { PRNG } from './rng';

export interface WorldData {
  phcs: PHC[];
  districts: DistrictInfo[];
  medicines: Medicine[];
  stockRecords: Record<string, StockRecord>; // key: `${phcId}_${medicineId}`
  generatedAt: string;
}

export function generateSyntheticWorld(seed = SEED_DEFAULT): WorldData {
  const prng = new PRNG(seed);
  const phcs: PHC[] = [];
  const districts: DistrictInfo[] = [];
  const stockRecords: Record<string, StockRecord> = {};

  // 1. Build Districts list
  STATES.forEach((state) => {
    const distList = DISTRICTS_BY_STATE[state.id] || [];
    distList.forEach((d, idx) => {
      districts.push({
        id: `${state.id}-dist-${idx + 1}`,
        stateId: state.id,
        name: d.name,
        lat: d.lat,
        lng: d.lng,
      });
    });
  });

  // 2. Generate ~25 PHCs per state
  STATES.forEach((state) => {
    const stateDists = districts.filter((d) => d.stateId === state.id);
    const count = state.phcCount;

    for (let i = 0; i < count; i++) {
      const dist = stateDists[i % stateDists.length];
      const phcId = `phc-${state.id}-${String(i + 1).padStart(2, '0')}`;
      
      // Jitter coordinates slightly around district center (approx ~10-20km radius)
      const latOffset = (prng.next() - 0.5) * 0.18;
      const lngOffset = (prng.next() - 0.5) * 0.18;

      // Bed capacity (10 to 30 beds typical for Indian PHC)
      const totalBeds = prng.nextInt(10, 30);
      // High bed occupancy in certain states (e.g., UP & Assam floods)
      let occupancyRate = 0.5 + prng.next() * 0.3;
      if (state.id === 'as' && (i % 3 === 0)) occupancyRate = 0.88 + prng.next() * 0.1; // flood impact
      if (state.id === 'up' && (i % 4 === 0)) occupancyRate = 0.92;
      const occupiedBeds = Math.min(totalBeds, Math.round(totalBeds * occupancyRate));

      // Staff Attendance (Sanctioned 8-15, present 60%-95%)
      const sanctionedStaff = prng.nextInt(8, 16);
      let attendanceRate = 0.7 + prng.next() * 0.25;
      if (i % 7 === 0) attendanceRate = 0.45; // Deliberate attendance gap problem PHC
      const presentStaff = Math.max(1, Math.round(sanctionedStaff * attendanceRate));

      // 90-day footfall with weekly seasonality & monsoon/flood spikes
      const footfallDaily: number[] = [];
      const historyDays = state.historyDays; // 90 or 45 for Assam
      const baseFootfall = prng.nextInt(60, 180);

      for (let day = 0; day < historyDays; day++) {
        const dayOfWeek = day % 7;
        const weekendFactor = dayOfWeek === 0 ? 0.4 : dayOfWeek === 6 ? 0.7 : 1.0;
        let trend = 1.0 + (day / historyDays) * 0.15;
        
        // Outbreak / Monsoon spike on recent days for certain problem PHCs
        if (state.id === 'as' && i < 5 && day > historyDays - 12) {
          trend *= 2.2; // Dengue / Cholera surge after floods
        }
        if (state.id === 'tn' && i % 6 === 0 && day > historyDays - 10) {
          trend *= 1.8; // Snakebite / Fever spike
        }

        const noise = prng.nextGaussian(1, 0.12);
        const dailyVal = Math.max(15, Math.round(baseFootfall * weekendFactor * trend * noise));
        footfallDaily.push(dailyVal);
      }

      const phcName = `PHC ${dist.name} ${getPhcSubName(i)}`;

      const phc: PHC = {
        id: phcId,
        districtId: dist.id,
        stateId: state.id,
        name: phcName,
        code: `${state.code}-${String(i + 1).padStart(3, '0')}`,
        lat: Number((dist.lat + latOffset).toFixed(5)),
        lng: Number((dist.lng + lngOffset).toFixed(5)),
        beds: { total: totalBeds, occupied: occupiedBeds },
        staff: { sanctioned: sanctionedStaff, presentToday: presentStaff },
        footfallDaily,
      };

      phcs.push(phc);

      // 3. Generate Stock Records per Medicine for this PHC
      MEDICINES.forEach((med) => {
        const leadTimeDays = getLeadTime(state.id, med, prng);
        // Base consumption per day depends on footfall
        const baseDailyConsumption = Math.round(baseFootfall * getConsumptionRatePerPatient(med.id));
        const safetyStock = Math.round(baseDailyConsumption * (leadTimeDays + 4));

        // Generate 90 daily consumption history records matching footfall
        const consumptionDaily: number[] = [];
        for (let day = 0; day < historyDays; day++) {
          const ratio = footfallDaily[day] / Math.max(1, baseFootfall);
          const noise = prng.nextGaussian(1, 0.1);
          const val = Math.max(0, Math.round(baseDailyConsumption * ratio * noise));
          consumptionDaily.push(val);
        }

        // Current Stock Level
        let stockDays = prng.nextInt(8, 30);

        // BAKE IN SPECIFIC DEMO PROBLEM PHCs:
        // PHC 1 in Assam (phc-as-01): Critical ORS & ASV stockout impending
        if (phcId === 'phc-as-01' && (med.id === 'ors' || med.id === 'anti_snake_venom')) {
          stockDays = 2; // Only 2 days of cover left!
        }
        // PHC 2 in UP (phc-up-02): Critical Paracetamol & Amoxicillin shortage
        if (phcId === 'phc-up-02' && (med.id === 'paracetamol' || med.id === 'amoxicillin')) {
          stockDays = 3;
        }
        // PHC 4 in TN (phc-tn-04): Critical Oxytocin & Insulin shortage
        if (phcId === 'phc-tn-04' && (med.id === 'oxytocin' || med.id === 'insulin')) {
          stockDays = 2;
        }
        // PHC 3 in RJ (phc-rj-03): Critical ORS & Zinc shortage due to heatwave
        if (phcId === 'phc-rj-03' && (med.id === 'ors' || med.id === 'zinc')) {
          stockDays = 3;
        }

        // SURPLUS PHCs in adjacent districts (to act as Donors):
        if (phcId === 'phc-as-04' && (med.id === 'ors' || med.id === 'anti_snake_venom')) {
          stockDays = 45; // High surplus donor
        }
        if (phcId === 'phc-up-05' && (med.id === 'paracetamol' || med.id === 'amoxicillin')) {
          stockDays = 50;
        }
        if (phcId === 'phc-tn-02' && (med.id === 'oxytocin' || med.id === 'insulin')) {
          stockDays = 40;
        }
        if (phcId === 'phc-rj-01' && (med.id === 'ors' || med.id === 'zinc')) {
          stockDays = 55;
        }

        const onHand = Math.round(baseDailyConsumption * stockDays);

        // Batches with expiry dates (FEFO)
        const batchCount = prng.nextInt(1, 3);
        const batches = [];
        let remainingQty = onHand;

        for (let b = 0; b < batchCount; b++) {
          const qty = b === batchCount - 1 ? remainingQty : Math.round(remainingQty * (0.4 + prng.next() * 0.4));
          remainingQty -= qty;
          
          // Expiry date in YYYY-MM-DD (between 30 days and 500 days from current date)
          const daysToExpiry = prng.nextInt(25, 450);
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + daysToExpiry);

          batches.push({
            id: `batch-${phcId}-${med.id}-${b + 1}`,
            qty: Math.max(0, qty),
            expiryDate: expDate.toISOString().split('T')[0],
          });
        }

        stockRecords[`${phcId}_${med.id}`] = {
          phcId,
          medicineId: med.id,
          onHand,
          safetyStock,
          leadTimeDays,
          batches: batches.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)), // FEFO sorted
          consumptionDaily,
        };
      });
    }
  });

  return {
    phcs,
    districts,
    medicines: MEDICINES,
    stockRecords,
    generatedAt: new Date().toISOString(),
  };
}

function getPhcSubName(index: number): string {
  const sectors = [
    'North Sector',
    'South Sector',
    'East Block',
    'West Block',
    'Central Mandi',
    'Riverbank Colony',
    'Bypass Junction',
    'Hilltop Post',
    'Market Ward',
    'Industrial Belt',
    'Rural Extension',
    'Coastal Reach',
  ];
  return sectors[index % sectors.length];
}

function getLeadTime(stateId: string, med: Medicine, prng: PRNG): number {
  let baseLead = 5;
  if (stateId === 'as') baseLead = 9; // Assam remote terrain
  if (stateId === 'rj') baseLead = 7; // Rajasthan desert distance
  if (med.coldChain) baseLead += 2; // Cold chain logistics buffer
  return baseLead + prng.nextInt(0, 3);
}

function getConsumptionRatePerPatient(medicineId: string): number {
  const rates: Record<string, number> = {
    paracetamol: 2.5,
    ors: 1.8,
    amoxicillin: 1.2,
    metformin: 1.0,
    amlodipine: 0.9,
    iron_folic: 1.5,
    zinc: 0.8,
    anti_snake_venom: 0.05,
    oxytocin: 0.08,
    cotrimoxazole: 0.7,
    salbutamol: 0.2,
    insulin: 0.15,
  };
  return rates[medicineId] || 1.0;
}
