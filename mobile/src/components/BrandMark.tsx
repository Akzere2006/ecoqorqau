import { memo } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, type } from "../theme";

interface BrandMarkProps {
  compact?: boolean;
}

function BrandMarkComponent({ compact = false }: BrandMarkProps) {
  return (
    <View style={styles.row}>
      <Image
        source={require("../../assets/saqshy-icon.png")}
        style={[styles.icon, compact && styles.iconCompact]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>SAQSHY</Text>
        {!compact && <Text style={styles.caption}>CASPIAN INTELLIGENCE</Text>}
      </View>
    </View>
  );
}

export const BrandMark = memo(BrandMarkComponent);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  icon: {
    borderRadius: 13,
    height: 44,
    width: 44,
  },
  iconCompact: {
    borderRadius: 10,
    height: 34,
    width: 34,
  },
  name: {
    color: colors.white,
    fontFamily: type.display,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  nameCompact: {
    fontSize: 15,
  },
  caption: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.25,
    marginTop: 1,
  },
});

