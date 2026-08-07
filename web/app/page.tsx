"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMapInstance, TileLayer } from "leaflet";

type View = "overview" | "map" | "reports" | "analytics";
type Role = "citizen" | "operator";
type Priority = "critical" | "high" | "medium" | "low";
type IncidentStatus = "new" | "verified" | "in_progress" | "resolved";
type Category = "oil" | "waste" | "water" | "wildlife" | "poaching";
type StatusFilter = IncidentStatus | "all";
type MapStyle = "atlas" | "terrain" | "satellite";

type ReportDraft = {
  category: Category;
  location: string;
  description: string;
  urgency: "normal" | "high";
  fileName: string;
};

type Incident = {
  id: string;
  title: string;
  location: string;
  category: Category;
  priority: Priority;
  status: IncidentStatus;
  score: number;
  time: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  reports: number;
  team?: string;
};

const seedIncidents: Incident[] = [
  {
    id: "EQ-2418",
    title: "Масляная плёнка у береговой линии",
    location: "Актау, 4А микрорайон",
    category: "oil",
    priority: "critical",
    status: "verified",
    score: 92,
    time: "12 мин назад",
    x: 45,
    y: 38,
    lat: 43.6427,
    lng: 51.1682,
    reports: 7,
  },
  {
    id: "EQ-2416",
    title: "Скопление пластиковых отходов",
    location: "Побережье Голубой бухты",
    category: "waste",
    priority: "high",
    status: "in_progress",
    score: 78,
    time: "38 мин назад",
    x: 38,
    y: 54,
    lat: 43.4736,
    lng: 51.3214,
    reports: 4,
    team: "Таза Жағалау",
  },
  {
    id: "EQ-2412",
    title: "Необычный цвет воды",
    location: "Мангистауский залив",
    category: "water",
    priority: "high",
    status: "new",
    score: 74,
    time: "1 ч назад",
    x: 54,
    y: 49,
    lat: 43.8254,
    lng: 51.0312,
    reports: 3,
  },
  {
    id: "EQ-2409",
    title: "Ослабленный каспийский тюлень",
    location: "Прибрежная зона Форт-Шевченко",
    category: "wildlife",
    priority: "critical",
    status: "in_progress",
    score: 89,
    time: "2 ч назад",
    x: 34,
    y: 30,
    lat: 44.5076,
    lng: 50.2631,
    reports: 2,
    team: "Служба спасения животных",
  },
  {
    id: "EQ-2404",
    title: "Следы незаконного сброса",
    location: "Промышленная зона Актау",
    category: "waste",
    priority: "medium",
    status: "verified",
    score: 63,
    time: "4 ч назад",
    x: 49,
    y: 43,
    lat: 43.5932,
    lng: 51.2875,
    reports: 1,
  },
  {
    id: "EQ-2398",
    title: "Подозрение на браконьерские сети",
    location: "Севернее мыса Песчаный",
    category: "poaching",
    priority: "high",
    status: "resolved",
    score: 81,
    time: "вчера",
    x: 59,
    y: 25,
    lat: 44.886,
    lng: 50.729,
    reports: 5,
  },
];

const categoryLabels: Record<Category, string> = {
  oil: "Нефтепродукты",
  waste: "Отходы",
  water: "Качество воды",
  wildlife: "Животный мир",
  poaching: "Браконьерство",
};

const statusLabels: Record<IncidentStatus, string> = {
  new: "Новое",
  verified: "Подтверждено",
  in_progress: "В работе",
  resolved: "Устранено",
};

const categoryBaseScore: Record<Category, number> = {
  oil: 76,
  waste: 48,
  water: 62,
  wildlife: 80,
  poaching: 73,
};

const categoryCoordinates: Record<Category, { x: number; y: number; lat: number; lng: number }> = {
  oil: { x: 44, y: 41, lat: 43.6427, lng: 51.1682 },
  waste: { x: 38, y: 57, lat: 43.4736, lng: 51.3214 },
  water: { x: 53, y: 49, lat: 43.8254, lng: 51.0312 },
  wildlife: { x: 33, y: 29, lat: 44.5076, lng: 50.2631 },
  poaching: { x: 58, y: 25, lat: 44.886, lng: 50.729 },
};

const defaultDraft: ReportDraft = {
  category: "waste",
  location: "Актау, городская набережная",
  description: "",
  urgency: "normal",
  fileName: "",
};

const navItems: Array<{ id: View; label: string; icon: IconName }> = [
  { id: "overview", label: "Обзор", icon: "grid" },
  { id: "map", label: "Карта рисков", icon: "map" },
  { id: "reports", label: "Обращения", icon: "inbox" },
  { id: "analytics", label: "Аналитика", icon: "chart" },
];

type IconName =
  | "grid"
  | "map"
  | "inbox"
  | "chart"
  | "plus"
  | "bell"
  | "search"
  | "arrow"
  | "shield"
  | "layers"
  | "clock"
  | "check"
  | "users"
  | "alert"
  | "download"
  | "location"
  | "camera"
  | "spark";

const Icon = memo(function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>;
    case "map":
      return <svg {...common}><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15M16 6v15"/></svg>;
    case "inbox":
      return <svg {...common}><path d="M4 4h16v16H4z"/><path d="M4 14h4l2 3h4l2-3h4"/></svg>;
    case "chart":
      return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "bell":
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-5"/></svg>;
    case "layers":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
    case "users":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "alert":
      return <svg {...common}><path d="M12 3 2.8 20h18.4Z"/><path d="M12 9v4M12 17h.01"/></svg>;
    case "download":
      return <svg {...common}><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>;
    case "location":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
    case "camera":
      return <svg {...common}><path d="M4 7h3l2-3h6l2 3h3v12H4Z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "spark":
      return <svg {...common}><path d="m12 3 1.3 4.2L18 9l-4.7 1.8L12 15l-1.3-4.2L6 9l4.7-1.8Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/></svg>;
  }
});

const CaspianMap = memo(function CaspianMap({
  data,
  selected,
  onSelect,
  large = false,
  mapStyle = "atlas",
}: {
  data: Incident[];
  selected?: string;
  onSelect: (incident: Incident) => void;
  large?: boolean;
  mapStyle?: MapStyle;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: large,
        preferCanvas: true,
        minZoom: 4,
        maxZoom: 18,
        zoomSnap: 0.25,
      });
      map.setView(large ? [42.2, 51.45] : [43.78, 51.05], large ? 5.5 : 6.25);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      if (large) L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
      frame = window.requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
      tileRef.current = null;
      leafletRef.current = null;
    };
  }, [large]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const styles: Record<MapStyle, { url: string; attribution: string; maxZoom: number }> = {
      atlas: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        maxZoom: 20,
      },
      terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap",
        maxZoom: 17,
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      },
    };
    tileRef.current?.remove();
    const config = styles[mapStyle];
    tileRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      crossOrigin: true,
    }).addTo(mapRef.current);
  }, [mapReady, mapStyle]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !markersRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    markersRef.current.clearLayers();
    data.forEach((incident) => {
      const isSelected = selected === incident.id;
      const marker = L.marker([incident.lat, incident.lng], {
        zIndexOffset: isSelected ? 1000 : incident.priority === "critical" ? 500 : 0,
        icon: L.divIcon({
          className: "incident-marker-shell",
          html: `<span class="geo-marker geo-marker--${incident.priority}${isSelected ? " is-selected" : ""}"><i></i><b>${incident.score}</b></span>`,
          iconSize: isSelected ? [56, 56] : [46, 46],
          iconAnchor: isSelected ? [28, 28] : [23, 23],
        }),
      });
      marker.bindTooltip(
        `<strong>${escapeMapText(incident.title)}</strong><span>${escapeMapText(incident.location)}</span>`,
        { direction: "top", offset: [0, -18], className: "eco-map-tooltip" },
      );
      marker.on("click", () => onSelectRef.current(incident));
      marker.addTo(markersRef.current!);
    });

    const active = data.find((incident) => incident.id === selected);
    if (active && large) {
      mapRef.current.panTo([active.lat, active.lng], { animate: true, duration: 0.45 });
    }
  }, [data, large, mapReady, selected]);

  return (
    <div className={`caspian-map ${large ? "caspian-map--large" : ""}`}>
      <div ref={containerRef} className="leaflet-caspian" aria-label="Интерактивная карта экологических наблюдений Каспийского моря" />
      <div className="map-atmosphere" aria-hidden="true" />
      <svg className="map-current-lines" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
        <path d="M90 505 C235 425 315 485 430 405 C560 315 620 352 770 247" />
        <path d="M190 565 C330 505 390 545 520 470 C650 395 735 410 910 305" />
        <path d="M50 215 C210 150 345 185 455 122 C575 55 710 105 915 48" />
      </svg>
      <div className="map-legend">
        <span><i className="legend-dot legend-dot--critical" />Критично</span>
        <span><i className="legend-dot legend-dot--high" />Высокий риск</span>
        <span><i className="legend-dot legend-dot--medium" />Наблюдение</span>
      </div>
      <div className="map-source">Живая геокарта · WGS84</div>
    </div>
  );
});

function escapeMapText(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char] ?? char);
}

const StatusPill = memo(function StatusPill({ status }: { status: IncidentStatus }) {
  return <span className={`status-pill status-pill--${status}`}>{statusLabels[status]}</span>;
});

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [role, setRole] = useState<Role>("operator");
  const [incidentData, setIncidentData] = useState<Incident[]>(seedIncidents);
  const [selected, setSelected] = useState<Incident>(seedIncidents[0]);
  const [mapFilter, setMapFilter] = useState<Category | "all">("all");
  const [mapStyle, setMapStyle] = useState<MapStyle>("atlas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [online, setOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportStep, setReportStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<ReportDraft>(defaultDraft);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem("ecoqorgau-incidents-v1");
        if (saved) {
          const parsed = JSON.parse(saved) as Incident[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated = parsed.map((item) => ({
              ...item,
              lat: Number.isFinite(item.lat) ? item.lat : categoryCoordinates[item.category].lat,
              lng: Number.isFinite(item.lng) ? item.lng : categoryCoordinates[item.category].lng,
            }));
            setIncidentData(migrated);
            setSelected(migrated[0]);
          }
        }
      } catch {
        window.localStorage.removeItem("ecoqorgau-incidents-v1");
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("ecoqorgau-incidents-v1", JSON.stringify(incidentData));
    }
  }, [hydrated, incidentData]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const registerTimer = window.setTimeout(() => {
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      }
    }, 1200);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(registerTimer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!reportOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReportOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [reportOpen]);

  const filtered = useMemo(
    () => mapFilter === "all" ? incidentData : incidentData.filter((item) => item.category === mapFilter),
    [incidentData, mapFilter],
  );

  const visibleReports = useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase("ru");
    return incidentData.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesText = !normalized || `${item.id} ${item.title} ${item.location}`.toLocaleLowerCase("ru").includes(normalized);
      return matchesStatus && matchesText;
    });
  }, [incidentData, searchQuery, statusFilter]);

  const riskScore = useMemo(() => {
    const evidenceBonus = draft.fileName ? 7 : 0;
    const descriptionBonus = draft.description.trim().length >= 80 ? 6 : draft.description.trim().length >= 30 ? 3 : 0;
    const urgencyBonus = draft.urgency === "high" ? 10 : 0;
    return Math.min(98, categoryBaseScore[draft.category] + evidenceBonus + descriptionBonus + urgencyBonus);
  }, [draft]);

  const openCount = incidentData.filter((item) => item.status !== "resolved").length;
  const criticalCount = incidentData.filter((item) => item.priority === "critical" && item.status !== "resolved").length;
  const resolvedCount = incidentData.filter((item) => item.status === "resolved").length;

  const selectIncident = useCallback((incident: Incident) => {
    setSelected(incident);
  }, []);

  const applyMapFilter = (category: Category | "all") => {
    setMapFilter(category);
    if (category !== "all") {
      const firstMatch = incidentData.find((item) => item.category === category);
      if (firstMatch) setSelected(firstMatch);
    }
  };

  const openReport = () => {
    setReportStep(1);
    setDraft(defaultDraft);
    setReportOpen(true);
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setToast("Геолокация не поддерживается этим устройством");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDraft((current) => ({
          ...current,
          location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        }));
        setLocating(false);
        setToast("Координаты добавлены к обращению");
      },
      () => {
        setLocating(false);
        setToast("Не удалось получить геопозицию — выберите место вручную");
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60_000 },
    );
  };

  const submitReport = () => {
    const priority: Priority = riskScore >= 86 ? "critical" : riskScore >= 70 ? "high" : riskScore >= 50 ? "medium" : "low";
    const coords = categoryCoordinates[draft.category];
    const coordinateMatch = draft.location.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    const parsedLat = coordinateMatch ? Number(coordinateMatch[1]) : Number.NaN;
    const parsedLng = coordinateMatch ? Number(coordinateMatch[2]) : Number.NaN;
    const detectedLat = Number.isFinite(parsedLat) && Math.abs(parsedLat) <= 90 ? parsedLat : coords.lat;
    const detectedLng = Number.isFinite(parsedLng) && Math.abs(parsedLng) <= 180 ? parsedLng : coords.lng;
    const newIncident: Incident = {
      id: `EQ-${String(2420 + incidentData.length).padStart(4, "0")}`,
      title: draft.description.trim().slice(0, 74) || `${categoryLabels[draft.category]} — новое наблюдение`,
      location: draft.location,
      category: draft.category,
      priority,
      status: "new",
      score: riskScore,
      time: "только что",
      x: coords.x + (incidentData.length % 3) * 2,
      y: coords.y + (incidentData.length % 2) * 3,
      lat: detectedLat,
      lng: detectedLng,
      reports: 1,
    };
    setIncidentData((current) => [newIncident, ...current]);
    setSelected(newIncident);
    setReportOpen(false);
    setView("reports");
    setStatusFilter("all");
    setToast(`Обращение ${newIncident.id} зарегистрировано`);
  };

  const updateIncident = (patch: Partial<Incident>) => {
    setIncidentData((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item));
    setSelected((current) => ({ ...current, ...patch }));
    setToast("Карточка обращения обновлена");
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Категория", "Описание", "Локация", "Риск", "Статус", "Исполнитель"],
      ...incidentData.map((item) => [item.id, categoryLabels[item.category], item.title, item.location, item.score, statusLabels[item.status], item.team ?? ""]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ecoqorgau-incidents.csv";
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setToast("CSV-отчёт сформирован");
  };

  const changeView = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => changeView("overview")} aria-label="EcoQorgau — на главную">
          <span className="brand-emblem" aria-hidden="true" />
          <span><strong>EcoQorgau</strong><small>Живая защита Каспия</small></span>
        </button>

        <nav className="side-nav" aria-label="Основная навигация">
          <p className="nav-caption">Рабочее пространство</p>
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "is-active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => changeView(item.id)}>
              <Icon name={item.icon}/><span>{item.label}</span>
              {item.id === "reports" && <em>{openCount}</em>}
            </button>
          ))}
        </nav>

        <div className="side-card">
          <div className="side-card-icon"><Icon name="shield"/></div>
          <strong>Контур доверия</strong>
          <p>Каждое действие сохраняется в публичной истории обращения.</p>
          <span>100% прозрачно</span>
        </div>

        <div className="sidebar-footer">
          <div className="avatar">AZ</div>
          <div><strong>Демо-оператор</strong><small>Мангистауская область</small></div>
          <button aria-label="Настройки профиля" onClick={() => setToast("Демо-профиль оператора активен")}>•••</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Экологическая обсерватория</p>
            <h1>{view === "overview" ? "Каспий сегодня" : view === "map" ? "Живая карта Каспия" : view === "reports" ? "Журнал береговых сигналов" : "Панорама Каспия"}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`connection ${online ? "is-online" : ""}`}><i />{online ? "Система онлайн" : "Офлайн-режим"}</span>
            <div className="role-switch" role="group" aria-label="Режим интерфейса">
              <button className={role === "citizen" ? "is-active" : ""} aria-pressed={role === "citizen"} onClick={() => setRole("citizen")}>Житель</button>
              <button className={role === "operator" ? "is-active" : ""} aria-pressed={role === "operator"} onClick={() => setRole("operator")}>Оператор</button>
            </div>
            <button className="icon-button" aria-label="Поиск" onClick={() => changeView("reports")}><Icon name="search"/></button>
            <button className="icon-button has-alert" aria-label="Уведомления" onClick={() => setToast(`${criticalCount} критических обращения требуют внимания`)}><Icon name="bell"/></button>
            <button className="primary-button" onClick={openReport}><Icon name="plus"/>Сообщить</button>
          </div>
        </header>

        {view === "overview" && (
          <div className="page-content overview-page">
            <section className="living-map-hero">
              <CaspianMap data={incidentData} selected={selected.id} onSelect={selectIncident} large mapStyle={mapStyle}/>
              <div className="hero-map-shade" aria-hidden="true" />

              <div className="hero-narrative">
                <span className="live-label"><i /> Живая обстановка · обновлено сейчас</span>
                <div className="hero-brand-lockup"><span className="brand-emblem brand-emblem--hero" aria-hidden="true"/><span>EcoQorgau<small>голос Каспия в действии</small></span></div>
                <h2>Каспий говорит.<br/><em>Мы превращаем сигнал в защиту.</em></h2>
                <p>Не ещё один реестр. Пространство, где жители, природа и службы видят одну береговую линию — от первого наблюдения до подтверждённого результата.</p>
                <div className="hero-actions">
                  <button className="hero-primary" onClick={openReport}><Icon name="plus"/>Сообщить с берега</button>
                  <button className="hero-secondary" onClick={() => changeView("map")}>Исследовать Каспий <Icon name="arrow"/></button>
                </div>
              </div>

              <div className="hero-layer-switch" role="group" aria-label="Стиль карты">
                <span><Icon name="layers" size={15}/> Вид карты</span>
                {(["atlas", "terrain", "satellite"] as MapStyle[]).map((style) => (
                  <button key={style} className={mapStyle === style ? "is-active" : ""} aria-pressed={mapStyle === style} onClick={() => setMapStyle(style)}>
                    {style === "atlas" ? "Атлас" : style === "terrain" ? "Рельеф" : "Спутник"}
                  </button>
                ))}
              </div>

              <aside className="signal-card">
                <header><span className={`signal-orbit signal-orbit--${selected.priority}`}><i/><b>{selected.score}</b></span><div><small>Выбранный сигнал</small><strong>{selected.id}</strong></div><StatusPill status={selected.status}/></header>
                <span className="signal-category">{categoryLabels[selected.category]}</span>
                <h3>{selected.title}</h3>
                <p><Icon name="location" size={14}/>{selected.location}</p>
                <div className="signal-evidence"><span><strong>{selected.reports}</strong><small>свидетельств</small></span><span><strong>{selected.time}</strong><small>обнаружено</small></span><span><strong>{selected.team ? "назначен" : "ожидает"}</strong><small>исполнитель</small></span></div>
                <button onClick={() => changeView("reports")}>Проследить путь сигнала <Icon name="arrow" size={17}/></button>
              </aside>

              <div className="coastline-pulse" aria-label="Ключевые показатели">
                <article><span className="pulse-number">{criticalCount}</span><span><strong>горячих точки</strong><small>нужна реакция сейчас</small></span></article>
                <article><span className="pulse-number">{openCount}</span><span><strong>живых сигналов</strong><small>в едином контуре</small></span></article>
                <article><span className="pulse-number">4:12</span><span><strong>средняя реакция</strong><small>цель — до 6 часов</small></span></article>
                <article><span className="pulse-number">347</span><span><strong>наблюдателей</strong><small>помогают побережью</small></span></article>
              </div>
            </section>

            <section className="story-section">
              <header className="editorial-heading"><div><span>СИГНАЛЫ БЕРЕГОВОЙ ЛИНИИ</span><h2>Не строки в таблице.<br/>Истории мест, которым нужна защита.</h2></div><p>Каждая карточка связана с точкой на карте, доказательствами и прозрачной историей действий.</p></header>
              <div className="story-card-grid">
                {incidentData.slice(0, 3).map((item, index) => (
                  <button key={item.id} className={`shore-story shore-story--${item.category}`} onClick={() => { setSelected(item); changeView("map"); }}>
                    <span className="story-index">0{index + 1}</span>
                    <span className="story-glow" aria-hidden="true"/>
                    <span className={`incident-symbol incident-symbol--${item.category}`}><Icon name={item.priority === "critical" ? "alert" : "layers"}/></span>
                    <span className="story-copy"><small>{categoryLabels[item.category]} · {item.location}</small><strong>{item.title}</strong><span>Риск {item.score}/100 <Icon name="arrow" size={16}/></span></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="protection-journey">
              <div className="journey-intro"><span className="section-kicker">Контур доверия</span><h2>От человеческого наблюдения — к измеримому результату</h2><p>EcoQorgau не заменяет эколога. Платформа сохраняет контекст, объясняет приоритет и не даёт сигналу исчезнуть между ведомствами.</p><button onClick={() => setRole("citizen")}>Посмотреть глазами жителя <Icon name="arrow" size={17}/></button></div>
              <ol className="journey-steps">
                <li><i>01</i><div><strong>Увидеть</strong><span>Фото, место, категория и срочность с любого телефона.</span></div></li>
                <li><i>02</i><div><strong>Понять</strong><span>Объяснимый скоринг показывает, почему сигнал важен.</span></div></li>
                <li><i>03</i><div><strong>Действовать</strong><span>Оператор назначает команду и ведёт задачу по SLA.</span></div></li>
                <li><i>04</i><div><strong>Подтвердить</strong><span>Житель видит результат и всю историю решений.</span></div></li>
              </ol>
              <aside className="field-note"><span className="brand-emblem" aria-hidden="true"/><div><small>Миссия пилота</small><strong>Один участок побережья Актау</strong><p>Одна общественная команда + один госорган + проверяемый эффект до декабря 2026.</p></div></aside>
            </section>
          </div>
        )}

        {view === "map" && (
          <div className="page-content map-page">
            <div className="map-toolbar">
              <div className="filter-row" role="group" aria-label="Фильтр карты">
                <button className={mapFilter === "all" ? "is-active" : ""} aria-pressed={mapFilter === "all"} onClick={() => applyMapFilter("all")}>Все риски <span>{incidentData.length}</span></button>
                {(Object.keys(categoryLabels) as Category[]).map((category) => <button key={category} className={mapFilter === category ? "is-active" : ""} aria-pressed={mapFilter === category} onClick={() => applyMapFilter(category)}>{categoryLabels[category]}</button>)}
              </div>
              <div className="map-status"><span><i className="pulse-dot"/>Обновлено сейчас</span><div className="map-style-tabs" role="group" aria-label="Подложка карты">{(["atlas", "terrain", "satellite"] as MapStyle[]).map((style) => <button key={style} className={mapStyle === style ? "is-active" : ""} aria-pressed={mapStyle === style} onClick={() => setMapStyle(style)}>{style === "atlas" ? "Атлас" : style === "terrain" ? "Рельеф" : "Спутник"}</button>)}</div></div>
            </div>
            <div className="map-layout">
              <article className="panel map-full-panel"><CaspianMap data={filtered} selected={selected.id} onSelect={selectIncident} large mapStyle={mapStyle}/></article>
              <aside className="panel map-detail">
                <div className="detail-score"><div><span>Риск</span><strong>{selected.score}</strong></div><StatusPill status={selected.status}/></div>
                <span className="detail-id">{selected.id} · {categoryLabels[selected.category]}</span>
                <h2>{selected.title}</h2>
                <p>{selected.location}</p>
                <div className="detail-facts">
                  <div><Icon name="users"/><span><small>Подтверждения</small><strong>{selected.reports} сообщений</strong></span></div>
                  <div><Icon name="clock"/><span><small>Обнаружено</small><strong>{selected.time}</strong></span></div>
                  <div><Icon name="shield"/><span><small>Исполнитель</small><strong>{selected.team ?? "Ожидает назначения"}</strong></span></div>
                </div>
                <button className="primary-button detail-button" onClick={() => changeView("reports")}>Перейти к обращению <Icon name="arrow"/></button>
              </aside>
            </div>
          </div>
        )}

        {view === "reports" && (
          <div className="page-content reports-page">
            <section className="reports-summary" aria-label="Сводка по обращениям">
              <article><span className="summary-dot summary-dot--red"/><div><small>Ожидают проверки</small><strong>{incidentData.filter((item) => item.status === "new").length}</strong></div><em>оператор</em></article>
              <article><span className="summary-dot summary-dot--amber"/><div><small>В работе</small><strong>{incidentData.filter((item) => item.status === "in_progress").length}</strong></div><em>SLA 6 ч</em></article>
              <article><span className="summary-dot summary-dot--green"/><div><small>Завершено</small><strong>{resolvedCount}</strong></div><em>проверено</em></article>
              <article><span className="summary-dot summary-dot--blue"/><div><small>Публичность данных</small><strong>96%</strong></div><em>индекс</em></article>
            </section>

            <section className="reports-toolbar">
              <label className="report-search"><Icon name="search" size={18}/><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Поиск по ID, месту или описанию" aria-label="Поиск обращений"/></label>
              <div className="status-filters" role="group" aria-label="Фильтр по статусу">
                {(["all", "new", "verified", "in_progress", "resolved"] as StatusFilter[]).map((status) => (
                  <button key={status} className={statusFilter === status ? "is-active" : ""} aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)}>{status === "all" ? "Все" : statusLabels[status]}</button>
                ))}
              </div>
              <button className="primary-button" onClick={openReport}><Icon name="plus"/>Новое сообщение</button>
            </section>

            <section className="reports-layout">
              <article className="panel reports-list-panel">
                <div className="reports-table-head"><span>Обращение</span><span>Риск</span><span>Статус</span></div>
                <div className="reports-list">
                  {visibleReports.map((item) => (
                    <button key={item.id} className={`report-item ${selected.id === item.id ? "is-selected" : ""}`} onClick={() => setSelected(item)}>
                      <span className={`incident-symbol incident-symbol--${item.category}`}><Icon name={item.priority === "critical" ? "alert" : "layers"} size={18}/></span>
                      <span className="report-item-copy"><span><b>{item.id}</b> · {categoryLabels[item.category]}</span><strong>{item.title}</strong><small><Icon name="location" size={12}/>{item.location} · {item.time}</small></span>
                      <span className={`risk-number risk-number--${item.priority}`}>{item.score}</span>
                      <StatusPill status={item.status}/>
                    </button>
                  ))}
                  {visibleReports.length === 0 && <div className="empty-state"><Icon name="search" size={26}/><strong>Ничего не найдено</strong><span>Измените поиск или фильтр статуса.</span></div>}
                </div>
              </article>

              <aside className="panel case-panel">
                <header className="case-header">
                  <div><span className="detail-id">{selected.id} · {categoryLabels[selected.category]}</span><StatusPill status={selected.status}/></div>
                  <h2>{selected.title}</h2>
                  <p><Icon name="location" size={15}/>{selected.location}</p>
                </header>
                <div className="case-risk">
                  <div className={`case-risk-score case-risk-score--${selected.priority}`}><strong>{selected.score}</strong><small>риск / 100</small></div>
                  <div><span className="section-kicker">Объяснимый скоринг</span><p>Категория, срочность, подтверждения и полнота доказательств формируют приоритет очереди.</p></div>
                </div>
                <div className="case-timeline">
                  <h3>История обработки</h3>
                  <ol>
                    <li className="is-done"><i><Icon name="check" size={13}/></i><div><strong>Сообщение зарегистрировано</strong><small>{selected.time} · публичный ID присвоен</small></div></li>
                    <li className="is-done"><i><Icon name="spark" size={13}/></i><div><strong>Автоскоринг завершён</strong><small>Приоритет {selected.score}/100 · правила MVP</small></div></li>
                    <li className={selected.status !== "new" ? "is-done" : ""}><i><Icon name="shield" size={13}/></i><div><strong>Проверка оператора</strong><small>{selected.status === "new" ? "Ожидает подтверждения" : "Факт подтверждён"}</small></div></li>
                    <li className={["in_progress", "resolved"].includes(selected.status) ? "is-done" : ""}><i><Icon name="users" size={13}/></i><div><strong>Выездная команда</strong><small>{selected.team ?? "Исполнитель ещё не назначен"}</small></div></li>
                    <li className={selected.status === "resolved" ? "is-done" : ""}><i><Icon name="check" size={13}/></i><div><strong>Публичное подтверждение</strong><small>{selected.status === "resolved" ? "Устранение зафиксировано" : "Следующий этап"}</small></div></li>
                  </ol>
                </div>

                {role === "operator" ? (
                  <div className="operator-actions">
                    <label>Ответственная команда
                      <select value={selected.team ?? ""} onChange={(event) => updateIncident({ team: event.target.value || undefined })}>
                        <option value="">Не назначена</option>
                        <option value="Таза Жағалау">Таза Жағалау</option>
                        <option value="Эко-патруль №2">Эко-патруль №2</option>
                        <option value="Служба спасения животных">Служба спасения животных</option>
                        <option value="Департамент экологии">Департамент экологии</option>
                      </select>
                    </label>
                    <div>
                      <button onClick={() => updateIncident({ status: "verified" })}>Подтвердить</button>
                      <button onClick={() => updateIncident({ status: "in_progress" })}>В работу</button>
                      <button className="complete-action" onClick={() => updateIncident({ status: "resolved" })}><Icon name="check" size={16}/>Закрыть</button>
                    </div>
                  </div>
                ) : (
                  <div className="citizen-trust"><Icon name="shield"/><div><strong>Статус нельзя скрыть</strong><p>Житель видит все ключевые этапы и может подтвердить результат после устранения.</p></div></div>
                )}
              </aside>
            </section>
          </div>
        )}

        {view === "analytics" && (
          <div className="page-content analytics-page">
            <section className="analytics-hero">
              <div><span className="live-label"><i/> Демо-аналитика за 30 дней</span><h2>Данные превращаются<br/>в <em>решения до ущерба</em></h2><p>Панель показывает динамику риска, нагрузку служб и прозрачность обработки обращений.</p></div>
              <button onClick={exportCsv}><Icon name="download"/>Скачать CSV-отчёт</button>
            </section>

            <section className="analytics-kpis">
              <article><small>Всего наблюдений</small><strong>{incidentData.length + 341}</strong><span>+18% к прошлому месяцу</span></article>
              <article><small>Средний риск</small><strong>{Math.round(incidentData.reduce((sum, item) => sum + item.score, 0) / incidentData.length)}</strong><span>из 100 баллов</span></article>
              <article><small>Успешно закрыто</small><strong>{Math.round((resolvedCount / incidentData.length) * 100)}%</strong><span>демо-набор MVP</span></article>
              <article><small>Вовлечённость</small><strong>347</strong><span>активных наблюдателей</span></article>
            </section>

            <section className="analytics-grid">
              <article className="panel trend-panel">
                <div className="panel-heading"><div><span className="section-kicker">Динамика</span><h3>Индекс экологического риска</h3></div><span className="trend-legend"><i/>Текущий период</span></div>
                <div className="line-chart" aria-label="Динамика индекса риска по дням">
                  <div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                  <svg viewBox="0 0 700 240" preserveAspectRatio="none" role="img" aria-label="Линейный график риска">
                    <defs><linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#79c9ad" stopOpacity=".36"/><stop offset="100%" stopColor="#79c9ad" stopOpacity="0"/></linearGradient></defs>
                    <path className="area" d="M0 179 L116 150 L233 164 L350 106 L466 127 L583 72 L700 95 L700 240 L0 240 Z"/>
                    <path className="line" d="M0 179 L116 150 L233 164 L350 106 L466 127 L583 72 L700 95"/>
                    {[{x:0,y:179},{x:116,y:150},{x:233,y:164},{x:350,y:106},{x:466,y:127},{x:583,y:72},{x:700,y:95}].map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5"/>)}
                  </svg>
                  <div className="chart-x">{["30 июл","31 июл","1 авг","2 авг","3 авг","4 авг","5 авг"].map((day) => <span key={day}>{day}</span>)}</div>
                </div>
              </article>

              <article className="panel category-panel">
                <div className="panel-heading"><div><span className="section-kicker">Структура рисков</span><h3>По категориям</h3></div></div>
                <div className="category-bars">
                  {(Object.keys(categoryLabels) as Category[]).map((category) => {
                    const count = incidentData.filter((item) => item.category === category).length;
                    const percent = Math.round((count / incidentData.length) * 100);
                    return <div key={category}><header><span>{categoryLabels[category]}</span><strong>{percent}%</strong></header><div><span style={{ width: `${Math.max(percent, 8)}%` }}/></div><small>{count} активных сигнала</small></div>;
                  })}
                </div>
              </article>

              <article className="panel transparency-panel">
                <div className="transparency-score" style={{ background: "conic-gradient(#c8ef81 0 96%, rgba(255,255,255,.14) 96% 100%)" }}><span><strong>96</strong><small>/100</small></span></div>
                <div><span className="section-kicker">Индекс прозрачности</span><h3>Каждый сигнал оставляет проверяемый цифровой след</h3><p>Публичный ID, история статусов, исполнитель и подтверждение результата доступны жителю.</p></div>
              </article>

              <article className="panel effect-panel">
                <span className="section-kicker">Ожидаемый эффект пилота</span>
                <h3>Реагировать быстрее, видеть больше</h3>
                <div><span><strong>−30%</strong><small>время первичной проверки</small></span><span><strong>×2</strong><small>охват береговой линии</small></span><span><strong>100%</strong><small>история решений</small></span></div>
                <p>* Целевые показатели пилота, а не достигнутые результаты.</p>
              </article>
            </section>
          </div>
        )}

        {reportOpen && (
          <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportOpen(false); }}>
            <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
              <header>
                <div><span className="section-kicker">Общественный контроль</span><h2 id="report-title">Сообщить об экологической проблеме</h2></div>
                <button onClick={() => setReportOpen(false)} aria-label="Закрыть">×</button>
              </header>
              <div className="stepper"><span className="is-active"><i>1</i>Наблюдение</span><b/><span className={reportStep === 2 ? "is-active" : ""}><i>2</i>Проверка</span></div>

              {reportStep === 1 ? (
                <div className="report-form">
                  <fieldset><legend>Что вы обнаружили?</legend><div className="category-picker">{(Object.keys(categoryLabels) as Category[]).map((category) => <button type="button" key={category} className={draft.category === category ? "is-active" : ""} aria-pressed={draft.category === category} onClick={() => setDraft((current) => ({ ...current, category }))}><span className={`incident-symbol incident-symbol--${category}`}><Icon name={category === "wildlife" ? "users" : category === "oil" ? "alert" : "layers"} size={18}/></span>{categoryLabels[category]}</button>)}</div></fieldset>
                  <label className="form-label">Место наблюдения<div className="location-field"><Icon name="location" size={18}/><input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}/><button type="button" onClick={requestLocation} disabled={locating}>{locating ? "Определяем…" : "Моя геопозиция"}</button></div></label>
                  <label className="form-label">Опишите, что произошло<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Например: у кромки воды видна масляная плёнка длиной около 20 метров…" maxLength={360}/><small>{draft.description.length}/360</small></label>
                  <div className="evidence-row"><label className="upload-box"><input type="file" accept="image/*" onChange={(event) => setDraft((current) => ({ ...current, fileName: event.target.files?.[0]?.name ?? "" }))}/><Icon name="camera"/><span><strong>{draft.fileName || "Добавить фото"}</strong><small>JPG, PNG · доказательство повышает точность</small></span></label><fieldset className="urgency-field"><legend>Срочность</legend><label><input type="radio" name="urgency" checked={draft.urgency === "normal"} onChange={() => setDraft((current) => ({ ...current, urgency: "normal" }))}/>Обычная</label><label><input type="radio" name="urgency" checked={draft.urgency === "high"} onChange={() => setDraft((current) => ({ ...current, urgency: "high" }))}/>Есть непосредственная угроза</label></fieldset></div>
                  <footer><span><Icon name="shield" size={17}/>Точные координаты доступны только ответственным службам.</span><button className="primary-button" disabled={draft.description.trim().length < 10 || !draft.location.trim()} onClick={() => setReportStep(2)}>Проверить сообщение <Icon name="arrow"/></button></footer>
                </div>
              ) : (
                <div className="report-review">
                  <div className="review-score"><div className={`case-risk-score case-risk-score--${riskScore >= 86 ? "critical" : riskScore >= 70 ? "high" : "medium"}`}><strong>{riskScore}</strong><small>приоритет</small></div><div><span className="section-kicker"><Icon name="spark" size={15}/> Объяснимый скоринг MVP</span><h3>{riskScore >= 86 ? "Критический сигнал" : riskScore >= 70 ? "Высокий приоритет" : "Требует проверки"}</h3><p>Система не выносит решение вместо эксперта — она сортирует очередь и показывает причины оценки.</p></div></div>
                  <div className="score-reasons"><span className="is-done"><Icon name="check"/>Категория риска: {categoryLabels[draft.category]}</span><span className={draft.fileName ? "is-done" : ""}><Icon name={draft.fileName ? "check" : "camera"}/>Фото-доказательство {draft.fileName ? "добавлено" : "не добавлено"}</span><span className={draft.urgency === "high" ? "is-done" : ""}><Icon name="alert"/>Срочность: {draft.urgency === "high" ? "непосредственная угроза" : "обычная"}</span></div>
                  <div className="review-card"><span>{categoryLabels[draft.category]}</span><h4>{draft.description}</h4><p><Icon name="location" size={14}/>{draft.location}</p>{draft.fileName && <small><Icon name="camera" size={13}/>{draft.fileName}</small>}</div>
                  <footer><button className="secondary-button" onClick={() => setReportStep(1)}>Назад и исправить</button><button className="primary-button" onClick={submitReport}><Icon name="check"/>Отправить обращение</button></footer>
                </div>
              )}
            </section>
          </div>
        )}

        {toast && <div className="toast" role="status"><Icon name="check" size={17}/>{toast}</div>}

        <nav className="mobile-nav" aria-label="Мобильная навигация">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? "is-active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => changeView(item.id)}><Icon name={item.icon}/><span>{item.label.split(" ")[0]}</span></button>)}
        </nav>
      </section>
    </main>
  );
}
