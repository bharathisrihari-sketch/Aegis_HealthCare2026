/**
 * AegisHealth India — Domain Data Models and Interfaces
 */

export type UserRole = 'phc' | 'district' | 'state' | 'national';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn' | 'as' | 'mr';

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  historyDays: number;
  regionType: string;
  phcCount: number;
}

export interface DistrictInfo {
  id: string;
  stateId: string;
  name: string;
  lat: number;
  lng: number;
}

export interface BedInfo {
  total: number;
  occupied: number;
}

export interface StaffInfo {
  sanctioned: number;
  presentToday: number;
}

export interface PHC {
  id: string;
  districtId: string;
  stateId: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  beds: BedInfo;
  staff: StaffInfo;
  footfallDaily: number[]; // trailing daily footfall
}

export interface Medicine {
  id: string;
  name: string;
  unit: string;
  category: string;
  coldChain: boolean;
  minDaysOfCover: number;
  standardBoxQty: number;
}

export interface BatchInfo {
  id: string;
  qty: number;
  expiryDate: string; // ISO format YYYY-MM-DD
}

export interface StockRecord {
  phcId: string;
  medicineId: string;
  onHand: number;
  safetyStock: number;
  leadTimeDays: number;
  batches: BatchInfo[];
  consumptionDaily: number[]; // 90 days of daily consumption
}

export type AlertSeverity = 'critical' | 'warning' | 'watch' | 'stable';

export interface Alert {
  id: string;
  phcId: string;
  phcName: string;
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  medicineId: string;
  medicineName: string;
  severity: AlertSeverity;
  daysOfCover: number;
  onHand: number;
  dailyDemand: number;
  leadTimeDays: number;
  projectedStockoutDate: string;
  drivers: string[];
  explanation?: {
    lang: LanguageCode;
    text: string;
    action: string;
  };
}

export type TransferStatus = 'proposed' | 'approved' | 'rejected';

export interface Transfer {
  id: string;
  fromPhcId: string;
  fromPhcName: string;
  fromDistrictName: string;
  toPhcId: string;
  toPhcName: string;
  toDistrictName: string;
  medicineId: string;
  medicineName: string;
  qty: number;
  distanceKm: number;
  etaDays: number;
  score: number;
  status: TransferStatus;
  urgency: string;
  justification?: {
    lang: LanguageCode;
    text: string;
    dispatchOrder: string;
  };
  decidedByRole?: UserRole;
  decidedAt?: string;
  donorStockAfter: number;
  recipientCoverGainDays: number;
}

export interface FedStateNode {
  stateId: string;
  stateName: string;
  sampleCount: number;
  localWape: number;
  federatedWape: number;
  parameters: {
    levelWeight: number;
    trendWeight: number;
    seasonalityWeights: number[];
  };
}

export interface FedRound {
  round: number;
  globalWape: number;
  nodes: FedStateNode[];
  timestamp: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  severity: number;
  affectedStates: string[];
  multipliers: Record<string, number>; // medicineId -> demand multiplier
  iconName: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  role: UserRole;
  action: string;
  details: string;
  payloadSummary: Record<string, any>;
}

export interface ReportEntry {
  id: string;
  phcId: string;
  type: 'voice' | 'vision';
  rawTranscript?: string;
  mediaUrl?: string;
  extracted: {
    medicineName?: string;
    medicineId?: string;
    quantity?: number;
    unit?: string;
    bedsOccupied?: number;
    staffPresent?: number;
    confidence: number;
    items?: { name: string; count: number; matchedId?: string }[];
  };
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
}

export interface ImpactEstimate {
  stockoutDaysPrevented: number;
  patientVisitsProtected: number;
  phcsCovered: number;
  approxPopulationServed: number;
  transfersCount: number;
  formulaDetails: string;
}

export interface GeminiApiEnvelope<T> {
  ok: boolean;
  mode: 'live' | 'cache' | 'fallback';
  data: T;
  latencyMs: number;
  enforcedModel?: string;
  error?: string;
}
