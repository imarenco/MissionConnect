// mobile/services/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Request push/notification permissions (and prepare Android channel).
 */
export async function requestPermissionsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    // Create Android channel
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Convert Date to Expo CalendarTriggerInput object.
 * Note: Expo expects numeric month (1-12).
 */
function dateToCalendarTrigger(date: Date): Notifications.CalendarTriggerInput {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    repeats: false,
  };
}

/**
 * Schedule a local notification for a Date. Returns the scheduled id or null.
 * Uses a seconds trigger on Android for reliability, uses calendar trigger for iOS if possible.
 */
export async function scheduleVisitReminder(date: Date, title: string, body: string): Promise<string | null> {
  const hasPermission = await requestPermissionsAsync();
  if (!hasPermission) return null;

  const now = Date.now();
  const delay = date.getTime() - now;

  // If date is in the near past or very close, schedule with at least 1 second delay
  if (delay <= 1000) {
    const seconds = Math.max(1, Math.ceil(delay / 1000));
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { seconds } as any,
    });
    return id;
  }

  // Preferred: try calendar trigger (works well on iOS)
  const calendarTrigger = dateToCalendarTrigger(date);
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      // cast to any to satisfy TS in different SDK versions
      trigger: calendarTrigger as any,
    });
    return id;
  } catch (e) {
    // fallback to seconds-based trigger (reliable cross-platform)
    const seconds = Math.ceil(delay / 1000);
    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { seconds } as any,
    });
    return id;
  }
}
