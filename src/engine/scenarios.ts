import { ScenarioPreset } from '../types';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'dengue_flood',
    name: 'Monsoon Flood & Dengue Surge',
    description: 'Post-monsoon waterlogging causes rapid spike in Dengue, Malaria, and dehydration across flood plains.',
    severity: 0.8,
    affectedStates: ['as', 'up'],
    multipliers: {
      ors: 2.2,
      paracetamol: 2.0,
      zinc: 1.8,
      amoxicillin: 1.5,
    },
    iconName: 'CloudRain',
  },
  {
    id: 'cholera_outbreak',
    name: 'Acute Diarrhoeal / Cholera Outbreak',
    description: 'Contaminated water supply triggers severe acute gastroenteritis spike in high-density districts.',
    severity: 0.9,
    affectedStates: ['up', 'as', 'tn'],
    multipliers: {
      ors: 3.2,
      zinc: 2.5,
      cotrimoxazole: 2.0,
      amoxicillin: 1.8,
    },
    iconName: 'Biohazard',
  },
  {
    id: 'heatwave_season',
    name: 'Severe Arid Heatwave Wave',
    description: 'Extreme ambient temperatures (>45°C) trigger heatstroke, dehydration, and cardiovascular strain.',
    severity: 0.75,
    affectedStates: ['rj', 'up'],
    multipliers: {
      ors: 2.8,
      amlodipine: 1.4,
      paracetamol: 1.3,
      insulin: 1.25,
    },
    iconName: 'SunMedium',
  },
  {
    id: 'snakebite_season',
    name: 'Harvest & Rainy Snakebite Season',
    description: 'High agricultural activity during rains leads to surge in venomous snake envenomation.',
    severity: 0.85,
    affectedStates: ['tn', 'as', 'rj'],
    multipliers: {
      anti_snake_venom: 4.0,
      paracetamol: 1.5,
      oxytocin: 1.2,
    },
    iconName: 'Zap',
  },
];
