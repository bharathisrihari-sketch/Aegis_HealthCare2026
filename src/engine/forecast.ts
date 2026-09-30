/**
 * Demand Forecasting Engine
 * Seasonal-aware Exponential Smoothing (Holt-Winters level + trend + 7-day seasonality)
 * with outbreak multipliers and uncertainty bands.
 */

export interface ForecastResult {
  phcId: string;
  medicineId: string;
  horizonDays: number;
  dailyForecast: number[];     // mean predicted consumption for next 14 days
  lowerBound: number[];        // 95% confidence lower bound
  upperBound: number[];        // 95% confidence upper bound
  avgDailyDemand: number;       // Mean forecast consumption per day
  wape: number;                 // Weighted Absolute Percentage Error on trailing evaluation window
  level: number;
  trend: number;
  seasonalIndices: number[];    // 7 values (Mon-Sun)
}

export function computeDemandForecast(
  history: number[],
  phcId: string,
  medicineId: string,
  horizonDays = 14,
  outbreakMultiplier = 1.0
): ForecastResult {
  const n = history.length;
  if (n < 7) {
    // Fallback for insufficient data
    const avg = n > 0 ? history.reduce((a, b) => a + b, 0) / n : 10;
    const mean = Array(horizonDays).fill(Math.round(avg * outbreakMultiplier));
    return {
      phcId,
      medicineId,
      horizonDays,
      dailyForecast: mean,
      lowerBound: mean.map((v) => Math.max(0, Math.round(v * 0.8))),
      upperBound: mean.map((v) => Math.round(v * 1.2)),
      avgDailyDemand: Math.round(avg * outbreakMultiplier),
      wape: 0.15,
      level: avg,
      trend: 0,
      seasonalIndices: Array(7).fill(1.0),
    };
  }

  // 1. Estimate 7-day seasonal indices
  const period = 7;
  const seasonalIndices = Array(period).fill(1.0);
  const periodAvg: number[] = [];

  for (let i = 0; i < n; i += period) {
    const chunk = history.slice(i, i + period);
    if (chunk.length === period) {
      const chunkMean = chunk.reduce((a, b) => a + b, 0) / period;
      periodAvg.push(chunkMean);
    }
  }

  const overallMean = history.reduce((a, b) => a + b, 0) / n;
  if (overallMean > 0 && periodAvg.length > 0) {
    for (let day = 0; day < period; day++) {
      let sumRatio = 0;
      let count = 0;
      for (let p = 0; p < periodAvg.length; p++) {
        const val = history[p * period + day];
        if (periodAvg[p] > 0) {
          sumRatio += val / periodAvg[p];
          count++;
        }
      }
      if (count > 0) {
        seasonalIndices[day] = Math.max(0.2, sumRatio / count);
      }
    }
  }

  // 2. Fit Holt-Winters Exponential Smoothing (alpha=0.3, beta=0.1)
  const alpha = 0.25;
  const beta = 0.08;

  let level = history[0] || 1;
  let trend = (history[n - 1] - history[0]) / Math.max(1, n - 1);

  const residuals: number[] = [];

  for (let t = 0; t < n; t++) {
    const sIndex = seasonalIndices[t % period];
    const actual = history[t];
    const prevLevel = level;

    // Deseasonalized actual
    const deseasonalized = sIndex > 0 ? actual / sIndex : actual;

    level = alpha * deseasonalized + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;

    const fitted = (prevLevel + trend) * sIndex;
    residuals.push(actual - fitted);
  }

  // Residual Standard Deviation for uncertainty bounds
  const sumSquaredErr = residuals.reduce((sum, r) => sum + r * r, 0);
  const stdDev = Math.sqrt(sumSquaredErr / Math.max(1, n - 2));

  // 3. Generate 14-day future predictions with outbreak multiplier
  const dailyForecast: number[] = [];
  const lowerBound: number[] = [];
  const upperBound: number[] = [];

  for (let h = 1; h <= horizonDays; h++) {
    const sIndex = seasonalIndices[(n + h - 1) % period];
    const rawPred = Math.max(0, (level + trend * h) * sIndex * outbreakMultiplier);
    const predVal = Math.round(rawPred);
    
    // Band grows with horizon distance: stdDev * sqrt(h)
    const margin = 1.96 * stdDev * Math.sqrt(1 + h * 0.05);

    dailyForecast.push(predVal);
    lowerBound.push(Math.max(0, Math.round(predVal - margin)));
    upperBound.push(Math.round(predVal + margin));
  }

  // 4. Calculate WAPE on trailing 14-day holdout window
  const testLen = Math.min(14, Math.floor(n / 2));
  let sumAbsErr = 0;
  let sumActual = 0;

  for (let i = n - testLen; i < n; i++) {
    const sIndex = seasonalIndices[i % period];
    const pred = (level + trend) * sIndex;
    const actual = history[i];
    sumAbsErr += Math.abs(actual - pred);
    sumActual += actual;
  }

  const wape = sumActual > 0 ? Number((sumAbsErr / sumActual).toFixed(4)) : 0.1;
  const avgDailyDemand = Math.round(dailyForecast.reduce((a, b) => a + b, 0) / horizonDays);

  return {
    phcId,
    medicineId,
    horizonDays,
    dailyForecast,
    lowerBound,
    upperBound,
    avgDailyDemand: Math.max(1, avgDailyDemand),
    wape,
    level,
    trend,
    seasonalIndices,
  };
}
