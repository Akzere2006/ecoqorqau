import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "../components/BrandMark";
import { colors, radius, spacing, subtleShadow } from "../theme";

interface OnboardingScreenProps {
  onContinue: () => void;
}

const benefits = [
  { icon: "scan-outline" as const, text: "AI распознаёт тип и срочность сигнала" },
  { icon: "location-outline" as const, text: "Координаты и время подтверждают место" },
  { icon: "shield-checkmark-outline" as const, text: "SHA-256 паспорт защищает доказательство" },
];

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Image
        source={require("../../assets/caspian-onboarding.webp")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["rgba(4,16,35,0.08)", "rgba(4,16,35,0.42)", colors.ink]}
        locations={[0, 0.48, 0.76]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.topRow}>
          <BrandMark compact />
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>MVP ONLINE</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.eyebrow}>ЭКОЛОГИЧЕСКИЙ ИНТЕЛЛЕКТ КАСПИЯ</Text>
          <Text style={styles.title}>Заметь.{"\n"}Проверь. Защити.</Text>
          <Text style={styles.subtitle}>
            Превращаем одну фотографию в проверяемый экологический сигнал за 60 секунд.
          </Text>

          <View style={styles.benefits}>
            {benefits.map((benefit) => (
              <View key={benefit.text} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon} size={18} color={colors.sea} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Начать наблюдение</Text>
            <Ionicons name="arrow-forward" size={21} color={colors.ink} />
          </Pressable>
          <Text style={styles.privacy}>Без регистрации · данные демонстрации хранятся на устройстве</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "rgba(5, 23, 41, 0.72)",
    borderColor: "rgba(122, 241, 210, 0.28)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  liveDot: {
    backgroundColor: colors.sea,
    borderRadius: 5,
    height: 7,
    width: 7,
  },
  liveText: {
    color: colors.seaSoft,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  bottom: {
    paddingBottom: 4,
  },
  eyebrow: {
    color: colors.sea,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: colors.white,
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 47,
  },
  subtitle: {
    color: "#C0D3E4",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: 350,
  },
  benefits: {
    gap: 10,
    marginBottom: 20,
    marginTop: 22,
  },
  benefitRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  benefitIcon: {
    alignItems: "center",
    backgroundColor: "rgba(16, 215, 196, 0.12)",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  benefitText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: 20,
    ...subtleShadow,
  },
  primaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  privacy: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 12,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
});

