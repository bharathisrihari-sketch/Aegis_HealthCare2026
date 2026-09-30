# AegisHealth India — Visual Design System & Anti-Slop Discipline

## 1. Aesthetic Direction
- **Name**: National Command Room — High-Contrast Operational
- **Character**: Information-dense, calm under pressure, institutional, readable at a glance.
- **Palette**: Warm off-white / cool slate surfaces, near-black text (`#0f172a`), deep teal accent (`#0d9488` / `#0f766e`), semantic risk colors only (Red `#dc2626`, Amber `#d97706`, Watch `#2563eb`). No purple gradients, no glassmorphism, no neon glows.
- **Surfaces**: Crisp borders (`border-slate-800` in dark, `border-slate-200` in light), restrained padding, zero unnecessary card nesting.

## 2. Typography
- **Body & UI**: IBM Plex Sans / clean grotesk
- **Display**: IBM Plex Sans Bold
- **Numbers / Data**: JetBrains Mono (`font-mono tabular-nums`)
- **Type scale**: Display (20–28px), Section (16–18px), Body (14–15px), Small (12–13px).

## 3. Risk Semantics & Accessibility
- **Critical**: Red (`#ef4444` / `#dc2626`) + Triangle Alert Icon + "CRITICAL" text label.
- **Warning**: Amber (`#f59e0b` / `#d97706`) + Circle Exclamation Icon + "WARNING" text label.
- **Watch**: Blue (`#3b82f6` / `#2563eb`) + Shield/Eye Icon + "WATCH" text label.
- **Normal**: Teal/Green (`#10b981` / `#0d9488`) + Check Icon + "STABLE" text label.
- Risk is NEVER communicated by color alone.

## 4. Density & Navigation
- Role Switcher in header scoping the view:
  1. PHC Pharmacist / Medical Officer (Mobile-first, voice entry prominent)
  2. District Health Officer (District map, alerts, transfer approvals)
  3. State Health Mission Director (State dashboard, model performance, cross-district plans)
  4. National Command Centre (Cross-state map, emergency mode, federated monitor, impact)
