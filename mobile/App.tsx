import { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBar } from "./src/components/TabBar";
import { completeOnboarding, hasCompletedOnboarding, loadReports, resetOnboarding, saveReports } from "./src/services/storage";
import { AssistantScreen } from "./src/screens/AssistantScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ImpactScreen } from "./src/screens/ImpactScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ScanScreen } from "./src/screens/ScanScreen";
import { colors, radius, subtleShadow } from "./src/theme";
import { AppTab, EnvironmentalSignal } from "./src/types";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SaqshyApp />
    </SafeAreaProvider>
  );
}

function SaqshyApp() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts(Ionicons.font);
  const [booted, setBooted] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [reports, setReports] = useState<EnvironmentalSignal[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([hasCompletedOnboarding(), loadReports()]).then(
      ([completed, storedReports]) => {
        if (!mounted) return;
        setOnboarded(completed);
        setReports(storedReports);
        setBooted(true);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3_300);
    return () => clearTimeout(timeout);
  }, [toast]);

  if (!booted || !fontsLoaded) {
    return (
      <View style={styles.loadingRoot}>
        <Image
          source={require("./assets/saqshy-icon.png")}
          style={styles.loadingIcon}
          contentFit="cover"
        />
        <Text style={styles.loadingName}>SAQSHY AI</Text>
        <Text style={styles.loadingCaption}>CASPIAN ENVIRONMENTAL INTELLIGENCE</Text>
      </View>
    );
  }

  const finishOnboarding = async () => {
    setOnboarded(true);
    await completeOnboarding();
  };

  const replayOnboarding = async () => {
    setOnboarded(false);
    await resetOnboarding();
  };

  const submitSignal = (signal: EnvironmentalSignal) => {
    setReports((current) => {
      const next = [signal, ...current];
      void saveReports(next);
      return next;
    });
    setToast(`Сигнал ${signal.id} сохранён и добавлен на карту`);
    setActiveTab("map");
  };

  if (!onboarded) {
    return <OnboardingScreen onContinue={() => void finishOnboarding()} />;
  }

  return (
    <View style={styles.appRoot}>
      <View style={styles.screen}>{renderScreen(activeTab, reports, setActiveTab, submitSignal, replayOnboarding)}</View>
      <TabBar active={activeTab} onSelect={setActiveTab} />

      {toast ? (
        <View style={[styles.toast, { top: Math.max(insets.top, 12) }]}>
          <View style={styles.toastIcon}>
            <Ionicons name="checkmark" size={17} color={colors.ink} />
          </View>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

function renderScreen(
  activeTab: AppTab,
  reports: EnvironmentalSignal[],
  onNavigate: (tab: AppTab) => void,
  onSubmitted: (signal: EnvironmentalSignal) => void,
  onReplayOnboarding: () => Promise<void>,
) {
  switch (activeTab) {
    case "map":
      return <MapScreen reports={reports} />;
    case "scan":
      return <ScanScreen onSubmitted={onSubmitted} />;
    case "assistant":
      return <AssistantScreen />;
    case "impact":
      return (
        <ImpactScreen reports={reports} onReplayOnboarding={() => void onReplayOnboarding()} />
      );
    case "home":
    default:
      return <HomeScreen reports={reports} onNavigate={onNavigate} />;
  }
}

const styles = StyleSheet.create({
  appRoot: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  loadingRoot: {
    alignItems: "center",
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: "center",
  },
  loadingIcon: {
    borderRadius: 28,
    height: 92,
    width: 92,
  },
  loadingName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2.2,
    marginTop: 18,
  },
  loadingCaption: {
    color: colors.sea,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.25,
    marginTop: 5,
  },
  toast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(9, 34, 55, 0.98)",
    borderColor: "rgba(85,214,158,0.28)",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    maxWidth: "90%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute",
    zIndex: 20,
    ...subtleShadow,
  },
  toastIcon: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: 12,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  toastText: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
  },
});
