import { Platform } from "react-native";

export const colors = {
  ink: "#06152B",
  inkSoft: "#0B2140",
  panel: "#102A49",
  panelRaised: "#163555",
  sea: "#10D7C4",
  seaSoft: "#7AF1D2",
  blue: "#37A9FF",
  coral: "#FF7657",
  amber: "#F8C55C",
  green: "#55D69E",
  white: "#F7FBFF",
  text: "#EAF5FF",
  muted: "#8DA9C2",
  line: "rgba(142, 186, 216, 0.17)",
  overlay: "rgba(3, 14, 29, 0.72)",
  black: "#020913",
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
} as const;

export const type = {
  display: Platform.select({ ios: "System", android: "sans-serif-medium" }),
  body: Platform.select({ ios: "System", android: "sans-serif" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace" }),
} as const;

export const subtleShadow = Platform.select({
  ios: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
  default: {},
});

