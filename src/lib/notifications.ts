let activeNotification: Notification | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showTimerNotification(): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  clearTimerNotification();
  activeNotification = new Notification("GO!", {
    body: "Time to unrack",
    tag: "rest-timer",
  });
}

export function clearTimerNotification(): void {
  if (activeNotification) {
    activeNotification.close();
    activeNotification = null;
  }
}
