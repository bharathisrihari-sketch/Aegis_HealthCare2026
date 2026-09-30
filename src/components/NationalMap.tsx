import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  AlertTriangle,
  BedDouble,
  Users,
  Search,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Alert, AlertSeverity, LanguageCode, PHC } from '../types';
import { MEDICINES, STATES } from '../engine/config';
import { TRANSLATIONS } from '../i18n/translations';

interface NationalMapProps {
  phcs: PHC[];
  alerts: Alert[];
  selectedPhc: PHC | null;
  onSelectPhc: (phc: PHC) => void;
  lang: LanguageCode;
}

export const NationalMap: React.FC<NationalMapProps> = ({
  phcs,
  alerts,
  selectedPhc,
  onSelectPhc,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Custom Leaflet Layer Groups for Floating Layer Control
  const layerGroupsRef = useRef<{
    risk: L.LayerGroup | null;
    stock: L.LayerGroup | null;
    beds: L.LayerGroup | null;
    staff: L.LayerGroup | null;
  }>({
    risk: null,
    stock: null,
    beds: null,
    staff: null,
  });

  const [visibleLayers, setVisibleLayers] = useState<{
    risk: boolean;
    stock: boolean;
    beds: boolean;
    staff: boolean;
  }>({
    risk: true,
    stock: false,
    beds: false,
    staff: false,
  });

  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('all');
  const [activeLayer, setActiveLayer] = useState<'stock' | 'beds' | 'staff' | 'footfall'>('stock');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Map PHC ID to worst alert severity
  const phcRiskMap = new Map<string, AlertSeverity>();
  alerts.forEach((a) => {
    const existing = phcRiskMap.get(a.phcId);
    if (!existing || getSeverityRank(a.severity) < getSeverityRank(existing)) {
      phcRiskMap.set(a.phcId, a.severity);
    }
  });

  function getSeverityRank(s: AlertSeverity): number {
    switch (s) {
      case 'critical':
        return 0;
      case 'warning':
        return 1;
      case 'watch':
        return 2;
      default:
        return 3;
    }
  }

  // Filter PHCs
  const filteredPhcs = phcs.filter((p) => {
    if (selectedState !== 'all' && p.stateId !== selectedState) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Initialize Leaflet Map and Custom Layer Groups
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of India lat 20.5937, lng 78.9629, zoom 5
      const map = L.map(mapContainerRef.current, {
        center: [22.5, 80.0],
        zoom: 5,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add public keyless OpenStreetMap dark canvas tiles
      const primaryTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      const fallbackTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      });

      primaryTiles.on('tileerror', () => {
        if (map.hasLayer(primaryTiles)) {
          map.removeLayer(primaryTiles);
          fallbackTiles.addTo(map);
        }
      });

      primaryTiles.addTo(map);

      // Create Custom Leaflet Layer Groups for floating controls
      const riskGroup = L.layerGroup().addTo(map);
      const stockGroup = L.layerGroup().addTo(map);
      const bedGroup = L.layerGroup().addTo(map);
      const staffGroup = L.layerGroup().addTo(map);

      layerGroupsRef.current = {
        risk: riskGroup,
        stock: stockGroup,
        beds: bedGroup,
        staff: staffGroup,
      };

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    return () => {
      // Keep map instance alive across rerenders
    };
  }, []);

  // Update Markers inside Leaflet Layer Groups
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layerGroupsRef.current;
    if (!map || !mapLoaded || !groups.risk || !groups.stock || !groups.beds || !groups.staff) return;

    const gRisk = groups.risk;
    const gStock = groups.stock;
    const gBeds = groups.beds;
    const gStaff = groups.staff;

    // Clear existing layer contents
    gRisk.clearLayers();
    gStock.clearLayers();
    gBeds.clearLayers();
    gStaff.clearLayers();

    filteredPhcs.forEach((phc) => {
      const severity = phcRiskMap.get(phc.id) || 'stable';

      // 1) Risk Status Layer Marker
      const riskHtml = createCustomMarkerHtml(severity, phc.name, activeLayer, phc);
      const riskIcon = L.divIcon({
        html: riskHtml,
        className: 'custom-leaflet-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const riskMarker = L.marker([phc.lat, phc.lng], { icon: riskIcon });
      riskMarker.on('click', () => onSelectPhc(phc));
      gRisk.addLayer(riskMarker);

      // 2) Stock Levels Layer Marker (offset top-right badge)
      const stockHtml = createBadgeMarkerHtml('stock', phc);
      const stockIcon = L.divIcon({
        html: stockHtml,
        className: 'custom-leaflet-marker-stock',
        iconSize: [60, 20],
        iconAnchor: [-5, 20],
      });
      const stockMarker = L.marker([phc.lat, phc.lng], { icon: stockIcon });
      stockMarker.on('click', () => onSelectPhc(phc));
      gStock.addLayer(stockMarker);

      // 3) Bed Occupancy Layer Marker (offset bottom-right badge)
      const bedHtml = createBadgeMarkerHtml('beds', phc);
      const bedIcon = L.divIcon({
        html: bedHtml,
        className: 'custom-leaflet-marker-beds',
        iconSize: [60, 20],
        iconAnchor: [-5, -5],
      });
      const bedMarker = L.marker([phc.lat, phc.lng], { icon: bedIcon });
      bedMarker.on('click', () => onSelectPhc(phc));
      gBeds.addLayer(bedMarker);

      // 4) Staff Attendance Layer Marker (offset bottom-left badge)
      const staffHtml = createBadgeMarkerHtml('staff', phc);
      const staffIcon = L.divIcon({
        html: staffHtml,
        className: 'custom-leaflet-marker-staff',
        iconSize: [60, 20],
        iconAnchor: [65, -5],
      });
      const staffMarker = L.marker([phc.lat, phc.lng], { icon: staffIcon });
      staffMarker.on('click', () => onSelectPhc(phc));
      gStaff.addLayer(staffMarker);
    });

    // Adjust view if state selected
    if (selectedState !== 'all') {
      const statePhcs = filteredPhcs;
      if (statePhcs.length > 0) {
        const bounds = L.latLngBounds(statePhcs.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [filteredPhcs, activeLayer, selectedMedicine, mapLoaded]);

  // Toggle Custom Layer Group Visibility
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layerGroupsRef.current;
    if (!map || !mapLoaded || !groups.risk || !groups.stock || !groups.beds || !groups.staff) return;

    if (visibleLayers.risk) {
      if (!map.hasLayer(groups.risk)) map.addLayer(groups.risk);
    } else {
      if (map.hasLayer(groups.risk)) map.removeLayer(groups.risk);
    }

    if (visibleLayers.stock) {
      if (!map.hasLayer(groups.stock)) map.addLayer(groups.stock);
    } else {
      if (map.hasLayer(groups.stock)) map.removeLayer(groups.stock);
    }

    if (visibleLayers.beds) {
      if (!map.hasLayer(groups.beds)) map.addLayer(groups.beds);
    } else {
      if (map.hasLayer(groups.beds)) map.removeLayer(groups.beds);
    }

    if (visibleLayers.staff) {
      if (!map.hasLayer(groups.staff)) map.addLayer(groups.staff);
    } else {
      if (map.hasLayer(groups.staff)) map.removeLayer(groups.staff);
    }
  }, [visibleLayers, mapLoaded]);

  // Handle Section Map Zooming
  const handleSectionSelect = (rawStateId: string) => {
    // Normalize stateId (e.g. 'state-tn' -> 'tn')
    const stateId = rawStateId.startsWith('state-') ? rawStateId.replace('state-', '') : rawStateId;
    setSelectedState(stateId);

    const map = mapInstanceRef.current;
    if (!map) return;

    switch (stateId) {
      case 'tn':
        map.flyTo([11.1271, 78.6569], 7, { duration: 1.2 });
        break;
      case 'up':
        map.flyTo([26.8467, 80.9462], 7, { duration: 1.2 });
        break;
      case 'as':
        map.flyTo([26.2006, 92.9376], 7, { duration: 1.2 });
        break;
      case 'rj':
        map.flyTo([27.0238, 74.2179], 7, { duration: 1.2 });
        break;
      default:
        map.flyTo([22.5, 80.0], 5, { duration: 1.2 });
        break;
    }
  };

  // Calculate Section Telemetry Stats
  const activeSectionPhcs = filteredPhcs;
  const activeSectionCriticalCount = alerts.filter(
    (a) => (selectedState === 'all' || a.stateId === selectedState) && a.severity === 'critical'
  ).length;

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Section Map Quick Region Strip */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs relative z-30">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold">
              Region View:
            </span>

            <button
              onClick={() => handleSectionSelect('all')}
              className={`px-2.5 py-1 rounded-md border font-semibold transition-all ${
                selectedState === 'all'
                  ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              All India (National)
            </button>

            <button
              onClick={() => handleSectionSelect('tn')}
              className={`px-2.5 py-1 rounded-md border font-semibold transition-all ${
                selectedState === 'tn'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Tamil Nadu
            </button>

            <button
              onClick={() => handleSectionSelect('up')}
              className={`px-2.5 py-1 rounded-md border font-semibold transition-all ${
                selectedState === 'up'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Uttar Pradesh
            </button>

            <button
              onClick={() => handleSectionSelect('as')}
              className={`px-2.5 py-1 rounded-md border font-semibold transition-all ${
                selectedState === 'as'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Assam
            </button>

            <button
              onClick={() => handleSectionSelect('rj')}
              className={`px-2.5 py-1 rounded-md border font-semibold transition-all ${
                selectedState === 'rj'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              Rajasthan
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Active Nodes: <span className="text-white font-bold">{activeSectionPhcs.length} PHCs</span>
          </div>
        </div>

        {/* Primary Filter Control Bar (State, Medicine, Search) */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs relative z-30">
          <div className="flex items-center gap-3 flex-wrap">
            {/* State Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 shadow-inner">
              <Filter className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-400 font-medium">State:</span>
              <select
                value={selectedState}
                onChange={(e) => handleSectionSelect(e.target.value)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-900">All 4 States (~100 PHCs)</option>
                {STATES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.name} ({s.phcCount} PHCs)
                  </option>
                ))}
              </select>
            </div>

            {/* Medicine Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 shadow-inner">
              <span className="text-slate-400 font-medium">Medicine:</span>
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="bg-transparent text-slate-100 font-semibold focus:outline-none cursor-pointer max-w-[170px] truncate"
              >
                <option value="all" className="bg-slate-900">All Essential Medicines</option>
                {MEDICINES.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Box */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search PHC name/code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-36 text-xs"
              />
            </div>
          </div>

          {/* Quick Stats Indicator */}
          <div className="text-[11px] font-mono text-slate-400 hidden lg:block">
            Map Visibility: <span className="text-teal-300 font-bold">Keyless OpenStreetMap GIS</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[460px] md:h-[480px] w-full bg-slate-950">
          <div ref={mapContainerRef} className="h-full w-full z-10" />

        {/* Floating Control Panel for Leaflet Layer Groups */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl space-y-2.5 max-w-[210px] text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Layer Groups</span>
            </div>
            <span className="text-[9px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-1 py-0.5 rounded">
              Leaflet
            </span>
          </div>

          <div className="space-y-1">
            {/* Toggle Risk Status */}
            <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer transition-colors text-slate-200">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span className="font-medium text-[11px]">Risk Status</span>
              </div>
              <input
                type="checkbox"
                checked={visibleLayers.risk}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, risk: e.target.checked })}
                className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle Stock Levels */}
            <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer transition-colors text-slate-200">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium text-[11px]">Stock Levels</span>
              </div>
              <input
                type="checkbox"
                checked={visibleLayers.stock}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, stock: e.target.checked })}
                className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle Bed Occupancy */}
            <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer transition-colors text-slate-200">
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-[11px]">Bed Occupancy</span>
              </div>
              <input
                type="checkbox"
                checked={visibleLayers.beds}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, beds: e.target.checked })}
                className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle Staff Attendance */}
            <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer transition-colors text-slate-200">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-medium text-[11px]">Staff Attendance</span>
              </div>
              <input
                type="checkbox"
                checked={visibleLayers.staff}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, staff: e.target.checked })}
                className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section Telemetry Overlay Card (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-xs shadow-xl space-y-2 max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              {selectedState === 'all'
                ? 'National Health Overview'
                : STATES.find((s) => s.id === selectedState)?.name + ' Section'}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-950 text-teal-300 text-[10px] font-mono rounded border border-slate-800">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">PHC Nodes</div>
              <div className="text-white font-bold text-sm">{activeSectionPhcs.length}</div>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Critical Alerts</div>
              <div className="text-red-400 font-bold text-sm">{activeSectionCriticalCount}</div>
            </div>
          </div>

          {activeSectionCriticalCount > 0 && (
            <div className="p-2 bg-red-950/60 border border-red-800/80 rounded text-[11px] text-red-200 flex items-start gap-1.5 font-sans">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>
                {activeSectionCriticalCount} PHCs in this section need immediate stock dispatch.
              </span>
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-xs shadow-xl space-y-1.5">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" /> Risk Legend (Non-Color Encoded)
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-3 h-3 bg-red-600 rounded-sm transform rotate-45 flex items-center justify-center text-[9px] font-bold text-white">▲</span>
              <span>Critical Risk</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-950">●</span>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 bg-blue-600 rounded-sm flex items-center justify-center text-[9px] font-bold text-white">■</span>
              <span>Watch</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 bg-teal-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white">✓</span>
              <span>Stable Cover</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

function createCustomMarkerHtml(
  severity: AlertSeverity,
  phcName: string,
  activeLayer: string,
  phc: PHC
): string {
  let mainBg = 'bg-teal-500';
  let ringBg = 'bg-teal-500/40';
  let pingBg = 'bg-teal-400/30';
  let symbol = '✓';
  let glowColor = 'shadow-teal-500/50';

  if (severity === 'critical') {
    mainBg = 'bg-red-600';
    ringBg = 'bg-red-500/40';
    pingBg = 'bg-red-500/40';
    symbol = '▲';
    glowColor = 'shadow-red-500/60';
  } else if (severity === 'warning') {
    mainBg = 'bg-amber-500';
    ringBg = 'bg-amber-500/40';
    pingBg = 'bg-amber-400/30';
    symbol = '●';
    glowColor = 'shadow-amber-500/50';
  } else if (severity === 'watch') {
    mainBg = 'bg-sky-500';
    ringBg = 'bg-sky-500/40';
    pingBg = 'bg-sky-400/30';
    symbol = '■';
    glowColor = 'shadow-sky-500/50';
  }

  const bedOcc = phc.beds.total > 0 ? Math.round((phc.beds.occupied / phc.beds.total) * 100) : 0;

  return `
    <div class="relative group cursor-pointer flex items-center justify-center">
      <!-- Outer Resonating Radar Ping Ring -->
      <div class="absolute -inset-2.5 rounded-full ${pingBg} animate-ping pointer-events-none"></div>
      <!-- Middle Glow Ring -->
      <div class="absolute -inset-1 rounded-full ${ringBg} blur-sm pointer-events-none"></div>
      
      <!-- Core Round Resonating Icon -->
      <div class="relative w-7 h-7 ${mainBg} text-white rounded-full flex items-center justify-center text-[10px] font-bold font-mono shadow-xl ${glowColor} border-2 border-white/90 hover:scale-125 transition-all duration-300">
        <span class="leading-none drop-shadow-sm">${symbol}</span>
      </div>

      <!-- Clean Hover Tooltip Popup Card -->
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 bg-slate-900/95 text-white text-xs p-2.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap z-50 backdrop-blur-md min-w-[160px]">
        <div class="font-bold text-teal-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
          <span>${phc.name}</span>
          <span class="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-300">${phc.code}</span>
        </div>
        <div class="text-[10px] font-mono text-slate-300 space-y-0.5 pt-0.5">
          <div class="flex justify-between"><span>Risk Status:</span> <span class="font-bold ${severity === 'critical' ? 'text-red-400' : 'text-emerald-400'}">${severity.toUpperCase()}</span></div>
          <div class="flex justify-between"><span>Bed Occupancy:</span> <span class="text-white font-bold">${bedOcc}%</span></div>
          <div class="flex justify-between"><span>Staff Duty:</span> <span class="text-white font-bold">${phc.staff.presentToday}/${phc.staff.sanctioned}</span></div>
        </div>
      </div>
    </div>
  `;
}

function createBadgeMarkerHtml(type: 'stock' | 'beds' | 'staff', phc: PHC): string {
  let badgeColor = 'bg-sky-950/90 text-sky-300 border-sky-700';
  let content = '';

  if (type === 'stock') {
    badgeColor = 'bg-sky-950/90 text-sky-300 border-sky-700';
    content = `💊 Stock OK`;
  } else if (type === 'beds') {
    const occ = phc.beds.total > 0 ? Math.round((phc.beds.occupied / phc.beds.total) * 100) : 0;
    badgeColor = occ > 80 ? 'bg-amber-950/90 text-amber-300 border-amber-700' : 'bg-emerald-950/90 text-emerald-300 border-emerald-700';
    content = `🛏️ ${occ}% beds`;
  } else if (type === 'staff') {
    badgeColor = phc.staff.presentToday < 3 ? 'bg-red-950/90 text-red-300 border-red-700' : 'bg-purple-950/90 text-purple-300 border-purple-700';
    content = `👨‍⚕️ ${phc.staff.presentToday}/${phc.staff.sanctioned}`;
  }

  return `
    <div class="px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold shadow-md ${badgeColor} whitespace-nowrap hover:scale-110 transition-transform cursor-pointer">
      ${content}
    </div>
  `;
}
