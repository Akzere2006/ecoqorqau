import { useMemo, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORY_META, DEMO_SIGNALS, MAP_STYLE } from "../data/demo";
import { colors, radius, spacing, subtleShadow } from "../theme";
import { EnvironmentalSignal, RiskLevel, SignalCategory } from "../types";

interface MapScreenProps {
  reports: EnvironmentalSignal[];
}

type MapFilter = "all" | SignalCategory;

const initialRegion: Region = {
  latitude: 43.64,
  longitude: 51.165,
  latitudeDelta: 0.22,
  longitudeDelta: 0.18,
};

const filters: Array<{ id: MapFilter; label: string; icon: string }> = [
  { id: "all", label: "Все", icon: "layers-outline" },
  { id: "oil", label: "Нефть", icon: "water-outline" },
  { id: "plastic", label: "Отходы", icon: "trash-outline" },
  { id: "wildlife", label: "Животные", icon: "fish-outline" },
  { id: "water", label: "Вода", icon: "flask-outline" },
];

const riskColor: Record<RiskLevel, string> = {
  low: colors.green,
  medium: colors.amber,
  high: colors.coral,
  critical: "#FF4D6D",
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Низкий риск",
  medium: "Средний риск",
  high: "Высокий риск",
  critical: "Критический риск",
};

export function MapScreen({ reports }: MapScreenProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [selected, setSelected] = useState<EnvironmentalSignal | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const signals = useMemo(() => {
    const all = [...reports, ...DEMO_SIGNALS];
    return filter === "all" ? all : all.filter((signal) => signal.category === filter);
  }, [filter, reports]);

  const selectFilter = (nextFilter: MapFilter) => {
    void Haptics.selectionAsync();
    setFilter(nextFilter);
    setSelected(null);
  };

  const centerOnUser = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setLocationMessage("Геопозиция отключена — показываем демо-зону Актау");
      return;
    }

    setLocationEnabled(true);
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    mapRef.current?.animateToRegion(
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.05,
      },
      420,
    );
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        customMapStyle={MAP_STYLE}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={locationEnabled}
        toolbarEnabled={false}
        onPress={() => setSelected(null)}
      >
        {signals.map((signal) => {
          const meta = CATEGORY_META[signal.category];
          return (
            <Marker
              key={signal.id}
              coordinate={signal.coordinates}
              tracksViewChanges={false}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelected(signal);
              }}
            >
              <View style={[styles.markerHalo, { borderColor: `${meta.color}55` }]}>
                <View style={[styles.marker, { backgroundColor: meta.color }]}>
                  <Ionicons name={meta.icon as never} size={14} color={colors.ink} />
                </View>
              </View>
            </Marker>
          );
        })}

        {signals
          .filter((signal) => signal.risk === "critical" || signal.risk === "high")
          .map((signal) => (
            <Circle
              key={`${signal.id}-area`}
              center={signal.coordinates}
              radius={signal.risk === "critical" ? 980 : 620}
              fillColor={`${riskColor[signal.risk]}16`}
              strokeColor={`${riskColor[signal.risk]}55`}
              strokeWidth={1}
            />
          ))}
      </MapView>

      <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top, 10) }]} pointerEvents="box-none">
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>CASPIAN LIVE MAP</Text>
            <Text style={styles.title}>Карта угроз</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{signals.length} сигналов</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => selectFilter(item.id)}
                style={({ pressed }) => [
                  styles.filter,
                  active && styles.filterActive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={item.icon as never}
                  size={14}
                  color={active ? colors.ink : colors.text}
                />
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.mapTools}>
        <Pressable
          accessibilityLabel="Моё местоположение"
          onPress={() => void centerOnUser()}
          style={({ pressed }) => [styles.mapTool, pressed && styles.pressed]}
        >
          <Ionicons name="locate" size={21} color={colors.sea} />
        </Pressable>
        <Pressable
          accessibilityLabel="Вернуться к Актау"
          onPress={() => mapRef.current?.animateToRegion(initialRegion, 420)}
          style={({ pressed }) => [styles.mapTool, pressed && styles.pressed]}
        >
          <Ionicons name="compass-outline" size={21} color={colors.text} />
        </Pressable>
      </View>

      {locationMessage ? (
        <Pressable style={styles.locationMessage} onPress={() => setLocationMessage(null)}>
          <Ionicons name="information-circle" size={17} color={colors.blue} />
          <Text style={styles.locationMessageText}>{locationMessage}</Text>
        </Pressable>
      ) : null}

      {selected ? (
        <View style={[styles.detailCard, { bottom: 14 + Math.max(insets.bottom, 0) }]}>
          <View style={styles.detailTop}>
            <View
              style={[
                styles.detailIcon,
                { backgroundColor: `${CATEGORY_META[selected.category].color}20` },
              ]}
            >
              <Ionicons
                name={CATEGORY_META[selected.category].icon as never}
                size={22}
                color={CATEGORY_META[selected.category].color}
              />
            </View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailId}>{selected.id}</Text>
              <Text numberOfLines={1} style={styles.detailTitle}>
                {selected.title}
              </Text>
            </View>
            <Pressable onPress={() => setSelected(null)} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.detailMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={15} color={colors.muted} />
              <Text style={styles.metaText}>{selected.locationLabel}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: `${riskColor[selected.risk]}18` }]}>
              <View style={[styles.riskDot, { backgroundColor: riskColor[selected.risk] }]} />
              <Text style={[styles.riskText, { color: riskColor[selected.risk] }]}>
                {riskLabel[selected.risk]}
              </Text>
            </View>
          </View>

          <View style={styles.detailFooter}>
            <View>
              <Text style={styles.detailFooterLabel}>AI уверенность</Text>
              <Text style={styles.detailFooterValue}>{Math.round(selected.confidence * 100)}%</Text>
            </View>
            <View>
              <Text style={styles.detailFooterLabel}>Источник</Text>
              <Text style={styles.detailFooterValue}>{selected.source.toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.detailFooterLabel}>Статус</Text>
              <Text style={[styles.detailFooterValue, { color: colors.green }]}>ПРОВЕРЯЕТСЯ</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.mapSummary, { bottom: 14 + Math.max(insets.bottom, 0) }]}>
          <View style={styles.summaryPulse}>
            <Ionicons name="pulse" size={20} color={colors.sea} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Мониторинг активен</Text>
            <Text style={styles.summaryText}>Коснитесь маркера, чтобы открыть паспорт сигнала</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  markerHalo: {
    alignItems: "center",
    backgroundColor: "rgba(6,21,43,0.82)",
    borderRadius: 22,
    borderWidth: 5,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  marker: {
    alignItems: "center",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  topOverlay: {
    left: 0,
    paddingHorizontal: spacing.md,
    position: "absolute",
    right: 0,
    top: 0,
  },
  titleRow: {
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
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "rgba(6,21,43,0.88)",
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  liveDot: {
    backgroundColor: colors.sea,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  liveText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
  },
  filterRow: {
    gap: 7,
    paddingRight: 18,
    paddingTop: 13,
  },
  filter: {
    alignItems: "center",
    backgroundColor: "rgba(6,21,43,0.88)",
    borderColor: colors.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterActive: {
    backgroundColor: colors.sea,
    borderColor: colors.sea,
  },
  filterText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  filterTextActive: {
    color: colors.ink,
  },
  mapTools: {
    gap: 9,
    position: "absolute",
    right: spacing.md,
    top: 154,
  },
  mapTool: {
    alignItems: "center",
    backgroundColor: "rgba(6,21,43,0.92)",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 45,
    justifyContent: "center",
    width: 45,
    ...subtleShadow,
  },
  locationMessage: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(6,21,43,0.95)",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    maxWidth: "88%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute",
    top: 212,
  },
  locationMessageText: {
    color: colors.text,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  detailCard: {
    backgroundColor: "rgba(8,27,48,0.97)",
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    left: spacing.md,
    padding: 16,
    position: "absolute",
    right: spacing.md,
    ...subtleShadow,
  },
  detailTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  detailIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  detailCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  detailId: {
    color: colors.sea,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  detailTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 3,
  },
  closeButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  detailMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
  metaItem: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },
  metaText: {
    color: colors.muted,
    flex: 1,
    fontSize: 10,
  },
  riskBadge: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  riskDot: {
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  riskText: {
    fontSize: 9,
    fontWeight: "800",
  },
  detailFooter: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
  },
  detailFooterLabel: {
    color: colors.muted,
    fontSize: 8,
  },
  detailFooterValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  mapSummary: {
    alignItems: "center",
    backgroundColor: "rgba(8,27,48,0.95)",
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    left: spacing.md,
    padding: 13,
    position: "absolute",
    right: spacing.md,
    ...subtleShadow,
  },
  summaryPulse: {
    alignItems: "center",
    backgroundColor: "rgba(16,215,196,0.12)",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  summaryCopy: {
    flex: 1,
    paddingHorizontal: 11,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryText: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});

