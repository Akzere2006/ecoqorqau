import { memo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, subtleShadow } from "../theme";
import { AppTab } from "../types";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabBarProps {
  active: AppTab;
  onSelect: (tab: AppTab) => void;
}

const items: Array<{ tab: AppTab; label: string; icon: IconName; activeIcon: IconName }> = [
  { tab: "home", label: "Главная", icon: "home-outline", activeIcon: "home" },
  { tab: "map", label: "Карта", icon: "map-outline", activeIcon: "map" },
  { tab: "assistant", label: "AI", icon: "chatbubble-ellipses-outline", activeIcon: "chatbubble-ellipses" },
  { tab: "impact", label: "Вклад", icon: "leaf-outline", activeIcon: "leaf" },
];

function TabBarComponent({ active, onSelect }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const select = (tab: AppTab) => {
    void Haptics.selectionAsync();
    onSelect(tab);
  };

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.row}>
        {items.slice(0, 2).map((item) => (
          <TabButton key={item.tab} item={item} active={active} onPress={select} />
        ))}

        <View style={styles.scanSlot}>
          <Pressable
            accessibilityLabel="Сканировать экологический сигнал"
            accessibilityRole="button"
            onPress={() => select("scan")}
            style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
          >
            <Ionicons name="scan" size={28} color={colors.ink} />
          </Pressable>
          <Text style={[styles.label, active === "scan" && styles.activeLabel]}>Сканер</Text>
        </View>

        {items.slice(2).map((item) => (
          <TabButton key={item.tab} item={item} active={active} onPress={select} />
        ))}
      </View>
    </View>
  );
}

interface TabButtonProps {
  item: (typeof items)[number];
  active: AppTab;
  onPress: (tab: AppTab) => void;
}

const TabButton = memo(function TabButton({ item, active, onPress }: TabButtonProps) {
  const selected = active === item.tab;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={() => onPress(item.tab)}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <Ionicons
        name={selected ? item.activeIcon : item.icon}
        size={22}
        color={selected ? colors.sea : colors.muted}
      />
      <Text style={[styles.label, selected && styles.activeLabel]}>{item.label}</Text>
    </Pressable>
  );
});

export const TabBar = memo(TabBarComponent);

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.inkSoft,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingTop: 7,
  },
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  item: {
    alignItems: "center",
    flex: 1,
    gap: 3,
    minHeight: 48,
    justifyContent: "center",
  },
  scanSlot: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    marginTop: -24,
  },
  scanButton: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderColor: "rgba(255,255,255,0.38)",
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 58,
    justifyContent: "center",
    width: 58,
    ...subtleShadow,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.seaSoft,
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.97 }],
  },
});

