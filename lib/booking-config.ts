export const EVENT = {
  name: "Sharpen The Edge",
  title: "2026 National Convention",
  location: "Hyderabad, India",
  pickup: "Subham Convention Centre",
  drop: "The Gideons International In India",
  dates: ["2026-09-10", "2026-09-11", "2026-09-12"],
} as const;

export const SLOT_TIMES = [
  "14:30",
  "14:50",
  "15:10",
  "15:30",
  "15:50",
  "16:10",
  "16:30",
  "16:50",
  "17:10",
  "17:30",
] as const;

export const SLOT_CAPACITY = 40;

export function formatSlotTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatEventDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function getDateParts(date: string): {
  day: string;
  weekday: string;
  month: string;
} {
  const parsed = new Date(`${date}T00:00:00Z`);
  return {
    day: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      timeZone: "UTC",
    }).format(parsed),
    month: new Intl.DateTimeFormat("en-IN", {
      month: "short",
      timeZone: "UTC",
    }).format(parsed),
    weekday: new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      timeZone: "UTC",
    }).format(parsed),
  };
}
