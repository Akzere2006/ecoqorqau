import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius } from "../theme";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
}

function ProgressBarComponent({ value, color = colors.sea, height = 7 }: ProgressBarProps) {
  const progress = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { backgroundColor: color, width: `${progress * 100}%` }]} />
    </View>
  );
}

export const ProgressBar = memo(ProgressBarComponent);

const styles = StyleSheet.create({
  track: {
    backgroundColor: "rgba(142, 186, 216, 0.15)",
    borderRadius: radius.pill,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: radius.pill,
    height: "100%",
  },
});

