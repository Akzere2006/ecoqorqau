import { memo, useMemo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "../components/BrandMark";
import { ProgressBar } from "../components/ProgressBar";
import { CATEGORY_META, DEMO_SIGNALS, MISSIONS } from "../data/demo";
import { colors, radius, spacing, subtleShadow } from "../theme";
import { AppTab, EnvironmentalSignal, RiskLevel } from "../types";

interface HomeScreenProps {
  reports: EnvironmentalSignal[];
  onNavigate: (tab: AppTab) => void;
}

const riskLabel: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",
};

function SignalCard({ signal }: { signal: EnvironmentalSignal }) {
  const meta = CATEGORY_META[signal.category];
  return (
    <View style={styles.signalCard}>
      <View style={styles.signalTop}>
        <View style={[styles.signalIcon, { backgroundColor: `${meta.color}1F` }]}>
          <Ionicons name={meta.icon as never} size={19} color={meta.color} />
        </View>
        <View style={[styles.riskPill, { borderColor: `${meta.color}55` }]}>
          <Text style={[styles.riskText, { color: meta.color }]}>{riskLabel[signal.risk]}</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.signalTitle}>
        {signal.title}
      </Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color={colors.muted} />
        <Text numberOfLines={1} style={styles.locationText}>
          {signal.locationLabel}
        </Text>
      </View>
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>AI уверенность</Text>
        <Text style={styles.confidenceValue}>{Math.round(signal.confidence * 100)}%</Text>
      </View>
    </View>
  );
}

const MemoSignalCard = memo(SignalCard);

export function HomeScreen({ reports, onNavigate }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const signals = useMemo(() => [...reports, ...DEMO_SIGNALS].slice(0, 5), [reports]);
  const mission = MISSIONS[0];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: 28 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <BrandMark />
        <Pressable
          accessibilityLabel="Уведомления"
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
        >
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>Добрый вечер, Ахмет</Text>
          <Text style={styles.weather}>Актау · +29° · ветер 7 м/с</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <LinearGradient
        colors={["#153B5A", "#0D2B49", "#0A213C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>ИНДЕКС РИСКА ПОБЕРЕЖЬЯ</Text>
            <Text style={styles.heroTitle}>Требуется внимание</Text>
            <Text style={styles.heroSubtitle}>3 сигнала высокого риска в радиусе 12 км</Text>
          </View>
          <View style={styles.scoreRing}>
            <Text style={styles.score}>63</Text>
            <Text style={styles.scoreUnit}>/100</Text>
          </View>
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Ionicons name="pulse" size={17} color={colors.sea} />
            <View>
              <Text style={styles.heroMetricValue}>24</Text>
              <Text style={styles.heroMetricLabel}>сигнала сегодня</Text>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetric}>
            <Ionicons name="shield-checkmark" size={17} color={colors.green} />
            <View>
              <Text style={styles.heroMetricValue}>78%</Text>
              <Text style={styles.heroMetricLabel}>уже проверено</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => onNavigate("scan")}
          style={({ pressed }) => [styles.scanAction, pressed && styles.pressed]}
        >
          <View style={styles.scanActionIcon}>
            <Ionicons name="scan" size={23} color={colors.ink} />
          </View>
          <View style={styles.scanActionCopy}>
            <Text style={styles.scanActionTitle}>Сканировать берег</Text>
            <Text style={styles.scanActionSubtitle}>Фото → AI-анализ → обращение</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.ink} />
        </Pressable>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>СИТУАЦИЯ РЯДОМ</Text>
          <Text style={styles.sectionTitle}>Карта живых сигналов</Text>
        </View>
        <Pressable onPress={() => onNavigate("map")}>
          <Text style={styles.sectionLink}>Открыть карту</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.signalList}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
      >
        {signals.map((signal) => (
          <MemoSignalCard key={signal.id} signal={signal} />
        ))}
      </ScrollView>

      <Pressable
        onPress={() => onNavigate("assistant")}
        style={({ pressed }) => [styles.aiCard, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={["rgba(16,215,196,0.16)", "rgba(55,169,255,0.08)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.aiIcon}>
          <Ionicons name="sparkles" size={22} color={colors.sea} />
        </View>
        <View style={styles.aiCopy}>
          <Text style={styles.aiLabel}>SAQSHY AI</Text>
          <Text style={styles.aiQuestion}>Не уверены, опасно ли это?</Text>
          <Text style={styles.aiHint}>Опишите ситуацию — ассистент подскажет безопасные действия.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.seaSoft} />
      </Pressable>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>ВАШ ВКЛАД</Text>
          <Text style={styles.sectionTitle}>Миссия недели</Text>
        </View>
        <View style={styles.rewardPill}>
          <Ionicons name="flash" size={13} color={colors.amber} />
          <Text style={styles.rewardText}>+{mission.reward}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => onNavigate("impact")}
        style={({ pressed }) => [styles.missionCard, pressed && styles.pressed]}
      >
        <View style={styles.missionTop}>
          <View style={styles.missionIcon}>
            <Ionicons name={mission.icon as never} size={22} color={colors.green} />
          </View>
          <View style={styles.missionCopy}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionDescription}>{mission.description}</Text>
          </View>
          <Text style={styles.missionCount}>
            {mission.progress}/{mission.target}
          </Text>
        </View>
        <ProgressBar value={mission.progress / mission.target} color={colors.green} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerAction: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  notificationDot: {
    backgroundColor: colors.coral,
    borderColor: colors.panel,
    borderRadius: 4,
    borderWidth: 2,
    height: 9,
    position: "absolute",
    right: 8,
    top: 8,
    width: 9,
  },
  greetingRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 21,
  },
  greeting: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  weather: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  livePill: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.09)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  liveDot: {
    backgroundColor: colors.sea,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  liveText: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  hero: {
    borderColor: "rgba(122,241,210,0.15)",
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    ...subtleShadow,
  },
  heroGlow: {
    backgroundColor: "rgba(16,215,196,0.12)",
    borderRadius: 120,
    height: 180,
    position: "absolute",
    right: -70,
    top: -85,
    width: 180,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  heroEyebrow: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.05,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 7,
  },
  heroSubtitle: {
    color: "#B4CADC",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  scoreRing: {
    alignItems: "center",
    borderColor: colors.amber,
    borderRadius: 42,
    borderRightColor: "rgba(248,197,92,0.2)",
    borderWidth: 5,
    height: 74,
    justifyContent: "center",
    width: 74,
  },
  score: {
    color: colors.white,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 24,
  },
  scoreUnit: {
    color: colors.muted,
    fontSize: 9,
  },
  heroMetrics: {
    alignItems: "center",
    backgroundColor: "rgba(4,16,35,0.28)",
    borderRadius: radius.md,
    flexDirection: "row",
    marginTop: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  heroMetric: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 9,
  },
  heroMetricValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  heroMetricLabel: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 1,
  },
  heroDivider: {
    backgroundColor: colors.line,
    height: 29,
    marginHorizontal: 8,
    width: 1,
  },
  scanAction: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderRadius: radius.lg,
    flexDirection: "row",
    marginTop: 13,
    minHeight: 62,
    paddingHorizontal: 13,
  },
  scanActionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(6,21,43,0.11)",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  scanActionCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  scanActionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  scanActionSubtitle: {
    color: "rgba(6,21,43,0.69)",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 25,
  },
  sectionEyebrow: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.35,
    marginTop: 4,
  },
  sectionLink: {
    color: colors.seaSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  signalList: {
    gap: 10,
    paddingRight: 10,
  },
  signalCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 164,
    padding: 14,
    width: 190,
  },
  signalTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signalIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  riskPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskText: {
    fontSize: 9,
    fontWeight: "800",
  },
  signalTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 11,
    minHeight: 36,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 7,
  },
  locationText: {
    color: colors.muted,
    flex: 1,
    fontSize: 10,
  },
  confidenceRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
    paddingTop: 9,
  },
  confidenceLabel: {
    color: colors.muted,
    fontSize: 9,
  },
  confidenceValue: {
    color: colors.seaSoft,
    fontSize: 10,
    fontWeight: "800",
  },
  aiCard: {
    alignItems: "center",
    borderColor: "rgba(16,215,196,0.28)",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 18,
    overflow: "hidden",
    padding: 15,
  },
  aiIcon: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.12)",
    borderRadius: 15,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  aiCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  aiLabel: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  aiQuestion: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  aiHint: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  rewardPill: {
    alignItems: "center",
    backgroundColor: "rgba(248,197,92,0.1)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  rewardText: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "800",
  },
  missionCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 15,
  },
  missionTop: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 13,
  },
  missionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(85,214,158,0.12)",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  missionCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  missionDescription: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  missionCount: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.987 }],
  },
});
