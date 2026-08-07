import AsyncStorage from "@react-native-async-storage/async-storage";

import { EnvironmentalSignal } from "../types";

const REPORTS_KEY = "saqshy:reports:v1";
const ONBOARDING_KEY = "saqshy:onboarding:v1";

export async function loadReports(): Promise<EnvironmentalSignal[]> {
  try {
    const value = await AsyncStorage.getItem(REPORTS_KEY);
    return value ? (JSON.parse(value) as EnvironmentalSignal[]) : [];
  } catch {
    return [];
  }
}

export async function saveReports(reports: EnvironmentalSignal[]): Promise<void> {
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function completeOnboarding(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}

