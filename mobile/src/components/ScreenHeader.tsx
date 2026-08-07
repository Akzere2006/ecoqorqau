import { memo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius } from "../theme";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  actionIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onAction?: () => void;
}

function ScreenHeaderComponent({ eyebrow, title, actionIcon, onAction }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Ionicons name={actionIcon} size={21} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

export const ScreenHeader = memo(ScreenHeaderComponent);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.sea,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.25,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  action: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }],
  },
});

