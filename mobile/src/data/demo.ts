import { EnvironmentalSignal, Mission, SignalCategory } from "../types";

export const CATEGORY_META: Record<
  SignalCategory,
  { label: string; icon: string; color: string }
> = {
  plastic: { label: "Пластик", icon: "trash-outline", color: "#F8C55C" },
  oil: { label: "Нефтепродукты", icon: "water-outline", color: "#FF7657" },
  wildlife: { label: "Животные", icon: "fish-outline", color: "#7AF1D2" },
  illegal_fishing: {
    label: "Незаконный вылов",
    icon: "warning-outline",
    color: "#C39BFF",
  },
  water: { label: "Качество воды", icon: "flask-outline", color: "#37A9FF" },
};

export const DEMO_SIGNALS: EnvironmentalSignal[] = [
  {
    id: "CS-2048",
    category: "oil",
    title: "Радужная плёнка на воде",
    locationLabel: "Порт Актау",
    coordinates: { latitude: 43.6028, longitude: 51.2014 },
    risk: "critical",
    status: "verified",
    createdAt: "2026-08-05T08:30:00.000Z",
    confidence: 0.94,
    source: "community",
  },
  {
    id: "CS-2039",
    category: "plastic",
    title: "Скопление пластика",
    locationLabel: "Скальная тропа",
    coordinates: { latitude: 43.6468, longitude: 51.1562 },
    risk: "medium",
    status: "queued",
    createdAt: "2026-08-05T07:10:00.000Z",
    confidence: 0.88,
    source: "community",
  },
  {
    id: "CS-2014",
    category: "wildlife",
    title: "Тюлень нуждается в наблюдении",
    locationLabel: "Голубая бухта",
    coordinates: { latitude: 43.5527, longitude: 51.1161 },
    risk: "high",
    status: "verified",
    createdAt: "2026-08-04T16:45:00.000Z",
    confidence: 0.91,
    source: "demo",
  },
  {
    id: "CS-1997",
    category: "water",
    title: "Аномальная мутность",
    locationLabel: "Приморский, 15 мкр.",
    coordinates: { latitude: 43.6705, longitude: 51.139 },
    risk: "medium",
    status: "resolved",
    createdAt: "2026-08-03T11:15:00.000Z",
    confidence: 0.82,
    source: "sensor",
  },
  {
    id: "CS-1971",
    category: "illegal_fishing",
    title: "Подозрительные сети",
    locationLabel: "Северное побережье",
    coordinates: { latitude: 43.7289, longitude: 51.1704 },
    risk: "high",
    status: "verified",
    createdAt: "2026-08-02T21:40:00.000Z",
    confidence: 0.86,
    source: "satellite",
  },
];

export const MISSIONS: Mission[] = [
  {
    id: "coast-guardian",
    title: "Хранитель берега",
    description: "Проверьте три участка побережья на этой неделе",
    progress: 2,
    target: 3,
    reward: 180,
    icon: "shield-checkmark-outline",
  },
  {
    id: "plastic-free",
    title: "Берег без пластика",
    description: "Зафиксируйте и помогите закрыть два сигнала",
    progress: 1,
    target: 2,
    reward: 120,
    icon: "sparkles-outline",
  },
];

export const QUICK_QUESTIONS = [
  "Я увидел нефтяную плёнку. Что делать?",
  "Как безопасно помочь тюленю?",
  "Как отличить цветение воды от загрязнения?",
  "Что должно быть на фото для обращения?",
];

export const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#10253D" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8EABC2" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B1B31" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#274561" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#122E46" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1D3B54" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#06172C" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3CB8C7" }],
  },
];

