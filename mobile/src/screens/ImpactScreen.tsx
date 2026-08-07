import { useMemo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProgressBar } from "../components/ProgressBar";
import { CATEGORY_META, MISSIONS } from "../data/demo";
import { colors, radius, spacing, subtleShadow } from "../theme";
import { EnvironmentalSignal, SignalStatus } from "../types";

interface ImpactScreenProps {
  reports: EnvironmentalSignal[];
  onReplayOnboarding: () => void;
}

const statusMeta: Record<SignalStatus, { label: string; color: string }> = {
  draft: { label: "Черновик", color: colors.muted },
  queued: { label: "Отправлен", color: colors.amber },
  verified: { label: "Подтверждён", color: colors.sea },
  resolved: { label: "Решён", color: colors.green },
};

const achievements = [
  { icon: "eye-outline" as const, title: "Наблюдатель", color: colors.blue },
  { icon: "shield-checkmark-outline" as const, title: "Проверенный сигнал", color: colors.green },
  { icon: "flame-outline" as const, title: "Серия 7 дней", color: colors.coral },
];

export function ImpactScreen({ reports, onReplayOnboarding }: ImpactScreenProps) {
  const insets = useSafeAreaInsets();
  const points = 640 + reports.length * 120;
  const levelProgress = Math.min(0.93, 0.58 + reports.length * 0.08);

  const reportImpact = useMemo(
    () => ({
      verified: reports.filter((report) => report.status === "verified").length + 8,
      reports: reports.length + 12,
      coastline: 18.4 + reports.length * 0.8,
    }),
    [reports],
  );

  const shareImpact = async () => {
    await Share.share({
      message: `Мой вклад в SAQSHY AI: ${reportImpact.reports} сигналов, ${reportImpact.verified} проверено, ${reportImpact.coastline.toFixed(1)} км побережья под наблюдением.`,
      title: "Мой экологический вклад",
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: 27 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ЛИЧНЫЙ ЭКО-СЛЕД</Text>
          <Text style={styles.title}>Ваш вклад</Text>
        </View>
        <Pressable
          onPress={() => void shareImpact()}
          style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <LinearGradient
        colors={["#153B5A", "#0D2947"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.profileGlow} />
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>А</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>7</Text>
            </View>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>Ахмет Жалгасбай</Text>
            <Text style={styles.profileRole}>Хранитель побережья · Актау</Text>
            <View style={styles.pointsRow}>
              <Ionicons name="flash" size={14} color={colors.amber} />
              <Text style={styles.points}>{points} eco points</Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={colors.sea} />
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>До уровня «Защитник Каспия»</Text>
          <Text style={styles.levelPercent}>{Math.round(levelProgress * 100)}%</Text>
        </View>
        <ProgressBar value={levelProgress} />
      </LinearGradient>

      <View style={styles.metricsGrid}>
        <ImpactMetric
          icon="document-text-outline"
          value={String(reportImpact.reports)}
          label="сигналов"
          color={colors.sea}
        />
        <ImpactMetric
          icon="shield-checkmark-outline"
          value={String(reportImpact.verified)}
          label="проверено"
          color={colors.green}
        />
        <ImpactMetric
          icon="navigate-outline"
          value={`${reportImpact.coastline.toFixed(1)} км`}
          label="под наблюдением"
          color={colors.blue}
        />
        <ImpactMetric
          icon="leaf-outline"
          value="12.4 кг"
          label="убрано отходов"
          color={colors.amber}
        />
      </View>

      <SectionTitle eyebrow="АКТИВНОСТЬ" title="Миссии" action="2 активны" />
      <View style={styles.missionList}>
        {MISSIONS.map((mission) => (
          <View key={mission.id} style={styles.missionCard}>
            <View style={styles.missionTop}>
              <View style={styles.missionIcon}>
                <Ionicons name={mission.icon as never} size={20} color={colors.green} />
              </View>
              <View style={styles.missionCopy}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDescription}>{mission.description}</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Ionicons name="flash" size={11} color={colors.amber} />
                <Text style={styles.rewardText}>{mission.reward}</Text>
              </View>
            </View>
            <View style={styles.missionProgressRow}>
              <View style={styles.progressFlex}>
                <ProgressBar value={mission.progress / mission.target} color={colors.green} height={6} />
              </View>
              <Text style={styles.progressCount}>
                {mission.progress}/{mission.target}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <SectionTitle eyebrow="ДОСТИЖЕНИЯ" title="Коллекция" action={`${achievements.length}/12`} />
      <View style={styles.achievementRow}>
        {achievements.map((achievement) => (
          <View key={achievement.title} style={styles.achievementCard}>
            <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}18` }]}>
              <Ionicons name={achievement.icon} size={23} color={achievement.color} />
            </View>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
          </View>
        ))}
      </View>

      <SectionTitle
        eyebrow="МОИ СИГНАЛЫ"
        title="Последние обращения"
        action={reports.length ? `${reports.length} локально` : "демо"}
      />
      <View style={styles.reportList}>
        {reports.length ? (
          reports.slice(0, 4).map((report) => <ReportRow key={report.id} report={report} />)
        ) : (
          <View style={styles.emptyReports}>
            <View style={styles.emptyIcon}>
              <Ionicons name="scan-outline" size={25} color={colors.sea} />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Ваш первый сигнал появится здесь</Text>
              <Text style={styles.emptyText}>Откройте сканер, добавьте фото и подтвердите результат AI.</Text>
            </View>
          </View>
        )}
      </View>

      <Pressable
        onPress={onReplayOnboarding}
        style={({ pressed }) => [styles.replayButton, pressed && styles.pressed]}
      >
        <Ionicons name="play-circle-outline" size={20} color={colors.seaSoft} />
        <Text style={styles.replayText}>Показать вступление заново</Text>
      </Pressable>

      <Text style={styles.version}>SAQSHY AI · Hackathon MVP 1.0 · данные хранятся локально</Text>
    </ScrollView>
  );
}

function ImpactMetric({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}16` }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

function ReportRow({ report }: { report: EnvironmentalSignal }) {
  const category = CATEGORY_META[report.category];
  const status = statusMeta[report.status];
  return (
    <View style={styles.reportRow}>
      {report.imageUri ? (
        <Image source={{ uri: report.imageUri }} style={styles.reportImage} contentFit="cover" />
      ) : (
        <View style={[styles.reportImage, styles.reportImageFallback]}>
          <Ionicons name={category.icon as never} size={19} color={category.color} />
        </View>
      )}
      <View style={styles.reportCopy}>
        <Text style={styles.reportId}>{report.id}</Text>
        <Text numberOfLines={1} style={styles.reportTitle}>
          {report.title}
        </Text>
        <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleString("ru-RU")}</Text>
      </View>
      <View style={[styles.reportStatus, { backgroundColor: `${status.color}14` }]}>
        <View style={[styles.reportStatusDot, { backgroundColor: status.color }]} />
        <Text style={[styles.reportStatusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.ink,
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 3,
  },
  shareButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  profileCard: {
    borderColor: "rgba(16,215,196,0.16)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: 18,
    overflow: "hidden",
    padding: 17,
    ...subtleShadow,
  },
  profileGlow: {
    backgroundColor: "rgba(16,215,196,0.1)",
    borderRadius: 100,
    height: 160,
    position: "absolute",
    right: -60,
    top: -80,
    width: 160,
  },
  profileTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 25,
    borderWidth: 2,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  avatarText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  levelBadge: {
    alignItems: "center",
    backgroundColor: colors.coral,
    borderColor: "#153B5A",
    borderRadius: 9,
    borderWidth: 2,
    bottom: -2,
    height: 19,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 19,
  },
  levelBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: "900",
  },
  profileCopy: {
    flex: 1,
    paddingHorizontal: 12,
  },
  profileName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  profileRole: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 3,
  },
  pointsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
  },
  points: {
    color: colors.amber,
    fontSize: 10,
    fontWeight: "800",
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
    marginTop: 18,
  },
  levelText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "600",
  },
  levelPercent: {
    color: colors.seaSoft,
    fontSize: 9,
    fontWeight: "900",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 13,
  },
  metricCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 112,
    padding: 13,
    width: "48.6%",
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  metricValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 9,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  sectionTitleRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
    marginTop: 25,
  },
  sectionEyebrow: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: 3,
  },
  sectionAction: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
  },
  missionList: {
    gap: 9,
  },
  missionCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  missionTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  missionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(85,214,158,0.1)",
    borderRadius: 13,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  missionCopy: {
    flex: 1,
    paddingHorizontal: 10,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  missionDescription: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  rewardBadge: {
    alignItems: "center",
    backgroundColor: "rgba(248,197,92,0.1)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rewardText: {
    color: colors.amber,
    fontSize: 9,
    fontWeight: "900",
  },
  missionProgressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },
  progressFlex: {
    flex: 1,
  },
  progressCount: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900",
  },
  achievementRow: {
    flexDirection: "row",
    gap: 8,
  },
  achievementCard: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 108,
    padding: 10,
  },
  achievementIcon: {
    alignItems: "center",
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  achievementTitle: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 9,
    textAlign: "center",
  },
  reportList: {
    gap: 8,
  },
  reportRow: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    padding: 10,
  },
  reportImage: {
    borderRadius: 13,
    height: 48,
    width: 48,
  },
  reportImageFallback: {
    alignItems: "center",
    backgroundColor: colors.panelRaised,
    justifyContent: "center",
  },
  reportCopy: {
    flex: 1,
    paddingHorizontal: 10,
  },
  reportId: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  reportTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  reportDate: {
    color: colors.muted,
    fontSize: 8,
    marginTop: 3,
  },
  reportStatus: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  reportStatusDot: {
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  reportStatusText: {
    fontSize: 8,
    fontWeight: "800",
  },
  emptyReports: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    padding: 14,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.1)",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyCopy: {
    flex: 1,
    paddingLeft: 11,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },
  replayButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 50,
  },
  replayText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  version: {
    color: colors.muted,
    fontSize: 8,
    marginTop: 13,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});

