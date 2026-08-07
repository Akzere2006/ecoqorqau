import { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../components/ScreenHeader";
import { CATEGORY_META } from "../data/demo";
import { analyzeEvidence } from "../services/ai";
import { colors, radius, spacing, subtleShadow } from "../theme";
import { AnalysisResult, Coordinates, EnvironmentalSignal, RiskLevel } from "../types";

interface ScanScreenProps {
  onSubmitted: (signal: EnvironmentalSignal) => void;
}

const fallbackCoordinates: Coordinates = { latitude: 43.641, longitude: 51.166 };

const riskMeta: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: "Низкий риск", color: colors.green },
  medium: { label: "Средний риск", color: colors.amber },
  high: { label: "Высокий риск", color: colors.coral },
  critical: { label: "Критический риск", color: "#FF4D6D" },
};

export function ScanScreen({ onSubmitted }: ScanScreenProps) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(fallbackCoordinates);
  const [locationVerified, setLocationVerified] = useState(false);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!analyzing) {
      scanProgress.stopAnimation();
      scanProgress.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanProgress, {
          duration: 1_100,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scanProgress, {
          duration: 1_100,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [analyzing, scanProgress]);

  const reset = () => {
    setImageUri(null);
    setAnalysis(null);
    setEvidenceHash(null);
    setCapturedAt(null);
    setError(null);
    setAnalyzing(false);
  };

  const resolveCoordinates = async (): Promise<{
    coordinates: Coordinates;
    verified: boolean;
  }> => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        return { coordinates: fallbackCoordinates, verified: false };
      }

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 10 * 60 * 1_000,
        requiredAccuracy: 500,
      });
      const position =
        lastKnown ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      return {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        verified: true,
      };
    } catch {
      return { coordinates: fallbackCoordinates, verified: false };
    }
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setAnalysis(null);
    setEvidenceHash(null);
    setError(null);
    setAnalyzing(true);

    try {
      const captured = new Date().toISOString();
      const location = await resolveCoordinates();
      setCoordinates(location.coordinates);
      setLocationVerified(location.verified);
      setCapturedAt(captured);

      const [result, hash] = await Promise.all([
        analyzeEvidence(uri, location.coordinates),
        Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `${uri}|${captured}|${location.coordinates.latitude}|${location.coordinates.longitude}`,
        ),
      ]);
      setAnalysis(result);
      setEvidenceHash(hash);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Не удалось завершить анализ. Попробуйте другую фотографию.");
    } finally {
      setAnalyzing(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Разрешите доступ к камере в настройках телефона.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      exif: false,
      mediaTypes: ["images"],
      quality: 0.72,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Разрешите доступ к фотографиям в настройках телефона.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      exif: false,
      mediaTypes: ["images"],
      quality: 0.72,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await processImage(result.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!analysis || !imageUri || !evidenceHash || !capturedAt) return;

    const signal: EnvironmentalSignal = {
      id: `SQ-${Date.now().toString(36).toUpperCase()}`,
      category: analysis.category,
      title: analysis.title,
      locationLabel: locationVerified ? "Текущая геопозиция" : "Демо-зона: Актау",
      coordinates,
      risk: analysis.risk,
      status: "queued",
      createdAt: capturedAt,
      confidence: analysis.confidence,
      imageUri,
      evidenceHash,
      description: analysis.summary,
      source: "community",
    };

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmitted(signal);
    reset();
  };

  const scanTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 226],
  });

  if (!imageUri) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: 25 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader eyebrow="AI VISION" title="Экосканер" actionIcon="help-circle-outline" />

        <Text style={styles.intro}>
          Наведите камеру на загрязнение, животное или аномалию воды. SAQSHY соберёт
          доказательство и предложит безопасное действие.
        </Text>

        <LinearGradient
          colors={["#102E4B", "#081D37"]}
          style={styles.cameraStage}
        >
          <View style={styles.gridHorizontalOne} />
          <View style={styles.gridHorizontalTwo} />
          <View style={styles.gridVerticalOne} />
          <View style={styles.gridVerticalTwo} />
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />

          <View style={styles.cameraCenter}>
            <View style={styles.cameraIconRing}>
              <Ionicons name="scan" size={42} color={colors.sea} />
            </View>
            <Text style={styles.cameraTitle}>Объект в рамке</Text>
            <Text style={styles.cameraHint}>Снимайте при хорошем освещении и с безопасного расстояния</Text>
          </View>

          <View style={styles.sensorBadge}>
            <View style={styles.sensorDot} />
            <Text style={styles.sensorText}>VISION READY</Text>
          </View>
        </LinearGradient>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.coral} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => void takePhoto()}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Ionicons name="camera" size={22} color={colors.ink} />
          <Text style={styles.primaryButtonText}>Сделать фотографию</Text>
        </Pressable>

        <Pressable
          onPress={() => void pickPhoto()}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Ionicons name="images-outline" size={20} color={colors.seaSoft} />
          <Text style={styles.secondaryButtonText}>Выбрать из галереи</Text>
        </Pressable>

        <View style={styles.safetyCard}>
          <View style={styles.safetyIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.green} />
          </View>
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>Сначала — ваша безопасность</Text>
            <Text style={styles.safetyText}>
              Не трогайте неизвестные вещества, сети и диких животных. При прямой угрозе
              отойдите и звоните 112.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const categoryMeta = analysis ? CATEGORY_META[analysis.category] : null;
  const currentRisk = analysis ? riskMeta[analysis.risk] : null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 12), paddingBottom: 25 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader eyebrow="ПАСПОРТ СИГНАЛА" title="AI-анализ" actionIcon="close" onAction={reset} />

      <View style={styles.previewCard}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" transition={120} />
        <LinearGradient
          colors={["transparent", "rgba(4,16,35,0.72)"]}
          style={StyleSheet.absoluteFill}
        />
        {analyzing ? (
          <>
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslate }] }]} />
            <View style={styles.analysisBadge}>
              <View style={styles.analysisDot} />
              <Text style={styles.analysisBadgeText}>АНАЛИЗ ИЗОБРАЖЕНИЯ</Text>
            </View>
          </>
        ) : null}
        <View style={styles.previewFooter}>
          <View style={styles.previewMeta}>
            <Ionicons
              name={locationVerified ? "location" : "navigate-outline"}
              size={15}
              color={locationVerified ? colors.sea : colors.amber}
            />
            <Text style={styles.previewMetaText}>
              {locationVerified ? "Геопозиция подтверждена" : "Используется демо-точка Актау"}
            </Text>
          </View>
          <Text style={styles.previewCoordinates}>
            {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      {analyzing ? (
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Ionicons name="sparkles" size={23} color={colors.sea} />
          </View>
          <View style={styles.loadingCopy}>
            <Text style={styles.loadingTitle}>SAQSHY исследует кадр</Text>
            <Text style={styles.loadingText}>Классифицируем объект и оцениваем уровень риска…</Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.coral} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {analysis && categoryMeta && currentRisk ? (
        <>
          <View style={styles.resultCard}>
            <View style={styles.resultTop}>
              <View style={[styles.resultIcon, { backgroundColor: `${categoryMeta.color}1C` }]}>
                <Ionicons name={categoryMeta.icon as never} size={24} color={categoryMeta.color} />
              </View>
              <View style={styles.resultCopy}>
                <Text style={styles.resultLabel}>{categoryMeta.label.toUpperCase()}</Text>
                <Text style={styles.resultTitle}>{analysis.title}</Text>
              </View>
              <View style={[styles.confidenceBadge, { borderColor: `${categoryMeta.color}55` }]}>
                <Text style={[styles.confidenceValue, { color: categoryMeta.color }]}>
                  {Math.round(analysis.confidence * 100)}%
                </Text>
                <Text style={styles.confidenceLabel}>AI</Text>
              </View>
            </View>

            <Text style={styles.resultSummary}>{analysis.summary}</Text>

            <View style={styles.detectedRow}>
              {analysis.detected.map((item) => (
                <View key={item} style={styles.detectedPill}>
                  <Text style={styles.detectedText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.riskPanel, { backgroundColor: `${currentRisk.color}10` }]}>
              <View style={[styles.riskIcon, { backgroundColor: `${currentRisk.color}1F` }]}>
                <Ionicons name="warning" size={19} color={currentRisk.color} />
              </View>
              <View style={styles.riskCopy}>
                <Text style={[styles.riskTitle, { color: currentRisk.color }]}>{currentRisk.label}</Text>
                <Text style={styles.riskGuidance}>{analysis.nextStep}</Text>
              </View>
            </View>
          </View>

          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <View>
                <Text style={styles.evidenceEyebrow}>ЦИФРОВОЙ ПАСПОРТ</Text>
                <Text style={styles.evidenceTitle}>Доказательство сформировано</Text>
              </View>
              <Ionicons name="shield-checkmark" size={25} color={colors.green} />
            </View>

            <View style={styles.evidenceRows}>
              <EvidenceRow icon="time-outline" label="Время" value={capturedAt ? new Date(capturedAt).toLocaleString("ru-RU") : "—"} />
              <EvidenceRow
                icon="location-outline"
                label="Координаты"
                value={`${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`}
              />
              <EvidenceRow
                icon="finger-print-outline"
                label="SHA-256"
                value={evidenceHash ? `${evidenceHash.slice(0, 12)}…${evidenceHash.slice(-8)}` : "—"}
                mono
              />
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={17} color={colors.blue} />
            <Text style={styles.disclaimerText}>
              AI даёт предварительную оценку. Финальное решение принимает экологический специалист.
            </Text>
          </View>

          <Pressable
            onPress={() => void submit()}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <View>
              <Text style={styles.submitTitle}>Отправить сигнал</Text>
              <Text style={styles.submitSubtitle}>Сохранится локально и появится на карте</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color={colors.ink} />
          </Pressable>

          <Pressable onPress={reset} style={({ pressed }) => [styles.retakeButton, pressed && styles.pressed]}>
            <Ionicons name="camera-reverse-outline" size={18} color={colors.muted} />
            <Text style={styles.retakeText}>Снять заново</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

function EvidenceRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.evidenceRow}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <Text style={styles.evidenceLabel}>{label}</Text>
      <Text numberOfLines={1} style={[styles.evidenceValue, mono && styles.mono]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.ink,
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  intro: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 11,
    maxWidth: 360,
  },
  cameraStage: {
    aspectRatio: 0.84,
    borderColor: "rgba(16,215,196,0.26)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: 20,
    overflow: "hidden",
    position: "relative",
  },
  gridHorizontalOne: {
    backgroundColor: "rgba(122,241,210,0.075)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: "33%",
  },
  gridHorizontalTwo: {
    backgroundColor: "rgba(122,241,210,0.075)",
    bottom: "33%",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  gridVerticalOne: {
    backgroundColor: "rgba(122,241,210,0.075)",
    bottom: 0,
    left: "33%",
    position: "absolute",
    top: 0,
    width: 1,
  },
  gridVerticalTwo: {
    backgroundColor: "rgba(122,241,210,0.075)",
    bottom: 0,
    position: "absolute",
    right: "33%",
    top: 0,
    width: 1,
  },
  cornerTopLeft: {
    borderLeftColor: colors.sea,
    borderLeftWidth: 3,
    borderTopColor: colors.sea,
    borderTopLeftRadius: 6,
    borderTopWidth: 3,
    height: 36,
    left: 20,
    position: "absolute",
    top: 20,
    width: 36,
  },
  cornerTopRight: {
    borderRightColor: colors.sea,
    borderRightWidth: 3,
    borderTopColor: colors.sea,
    borderTopRightRadius: 6,
    borderTopWidth: 3,
    height: 36,
    position: "absolute",
    right: 20,
    top: 20,
    width: 36,
  },
  cornerBottomLeft: {
    borderBottomColor: colors.sea,
    borderBottomLeftRadius: 6,
    borderBottomWidth: 3,
    borderLeftColor: colors.sea,
    borderLeftWidth: 3,
    bottom: 20,
    height: 36,
    left: 20,
    position: "absolute",
    width: 36,
  },
  cornerBottomRight: {
    borderBottomColor: colors.sea,
    borderBottomRightRadius: 6,
    borderBottomWidth: 3,
    borderRightColor: colors.sea,
    borderRightWidth: 3,
    bottom: 20,
    height: 36,
    position: "absolute",
    right: 20,
    width: 36,
  },
  cameraCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  cameraIconRing: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.1)",
    borderColor: "rgba(16,215,196,0.25)",
    borderRadius: 45,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    width: 86,
  },
  cameraTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 17,
  },
  cameraHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: "center",
  },
  sensorBadge: {
    alignItems: "center",
    backgroundColor: "rgba(4,16,35,0.55)",
    borderRadius: radius.pill,
    bottom: 18,
    flexDirection: "row",
    gap: 6,
    left: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: "absolute",
  },
  sensorDot: {
    backgroundColor: colors.sea,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  sensorText: {
    color: colors.seaSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,118,87,0.08)",
    borderColor: "rgba(255,118,87,0.22)",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
    padding: 12,
  },
  errorText: {
    color: "#FFC1B2",
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 15,
    minHeight: 58,
    ...subtleShadow,
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 9,
    minHeight: 52,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  safetyCard: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
    marginTop: 19,
    paddingHorizontal: 3,
  },
  safetyIcon: {
    alignItems: "center",
    backgroundColor: "rgba(85,214,158,0.1)",
    borderRadius: 13,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  safetyCopy: {
    flex: 1,
  },
  safetyTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  safetyText: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  previewCard: {
    aspectRatio: 1.15,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: 17,
    overflow: "hidden",
  },
  previewImage: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  scanLine: {
    backgroundColor: colors.sea,
    height: 2,
    left: 18,
    opacity: 0.9,
    position: "absolute",
    right: 18,
    top: 12,
  },
  analysisBadge: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(4,16,35,0.72)",
    borderColor: "rgba(16,215,196,0.35)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: "absolute",
    top: 14,
  },
  analysisDot: {
    backgroundColor: colors.sea,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  analysisBadgeText: {
    color: colors.seaSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.75,
  },
  previewFooter: {
    bottom: 13,
    left: 14,
    position: "absolute",
    right: 14,
  },
  previewMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  previewMetaText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  previewCoordinates: {
    color: "#BED0DF",
    fontFamily: "monospace",
    fontSize: 9,
    marginTop: 4,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 13,
    padding: 14,
  },
  loadingIcon: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.1)",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  loadingCopy: {
    flex: 1,
    paddingLeft: 11,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  loadingText: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },
  resultCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: 13,
    padding: 16,
  },
  resultTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  resultIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  resultCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  resultLabel: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  resultTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 3,
  },
  confidenceBadge: {
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    minWidth: 51,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  confidenceLabel: {
    color: colors.muted,
    fontSize: 7,
    fontWeight: "700",
  },
  resultSummary: {
    color: "#B8CBDC",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },
  detectedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 13,
  },
  detectedPill: {
    backgroundColor: "rgba(142,186,216,0.1)",
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  detectedText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "600",
  },
  riskPanel: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    flexDirection: "row",
    marginTop: 15,
    padding: 12,
  },
  riskIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 37,
    justifyContent: "center",
    width: 37,
  },
  riskCopy: {
    flex: 1,
    paddingLeft: 10,
  },
  riskTitle: {
    fontSize: 11,
    fontWeight: "900",
  },
  riskGuidance: {
    color: colors.text,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  evidenceCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: 11,
    padding: 15,
  },
  evidenceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  evidenceEyebrow: {
    color: colors.green,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  evidenceTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },
  evidenceRows: {
    gap: 9,
    marginTop: 14,
  },
  evidenceRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  evidenceLabel: {
    color: colors.muted,
    fontSize: 10,
    marginLeft: 7,
    width: 76,
  },
  evidenceValue: {
    color: colors.text,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
  },
  mono: {
    fontFamily: "monospace",
  },
  disclaimer: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    color: colors.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.sea,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    minHeight: 62,
    paddingHorizontal: 17,
    ...subtleShadow,
  },
  submitTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  submitSubtitle: {
    color: "rgba(6,21,43,0.66)",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 3,
  },
  retakeButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 48,
  },
  retakeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});
