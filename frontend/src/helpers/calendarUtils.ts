import type { CourseSchema, MeetingSchema, SectionSchema } from "../api-client";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const START_HOUR = 8;
const END_HOUR = 21;
export const TIME_SLOTS = Array.from(
  { length: (END_HOUR - START_HOUR) * 2 },
  (_, i) => {
    const hour = START_HOUR + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  }
);

export interface CalendarEvent {
  id: string;
  subject_code: string;
  catalog_number: string;
  day: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export function generateAllSchedules(classes: CourseSchema[]) {
  if (!classes.length) return [];
  // For each course, get its sections (or empty array)
  const sectionLists = classes.map((c) =>
    c.sections && c.sections.length ? c.sections : []
  );
  // If any course has no sections, no valid schedule
  if (sectionLists.some((list) => list.length === 0)) return [];
  // Cartesian product: each schedule is an array of sections, one per course
  function cartesian<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
      [[]]
    );
  }
  // Helper to check if two meetings overlap
  function meetingsOverlap(m1: MeetingSchema, m2: MeetingSchema): boolean {
    if (!m1.days_of_week || !m2.days_of_week) return false;
    // Check if any day overlaps
    const daysOverlap = m1.days_of_week.some((d: string) =>
      m2.days_of_week.includes(d)
    );
    if (!daysOverlap) return false;
    // Check time overlap
    const [s1, e1] = [m1.time_start, m1.time_end];
    const [s2, e2] = [m2.time_start, m2.time_end];
    if (!s1 || !e1 || !s2 || !e2) return false;
    // Convert to minutes since midnight
    function toMin(t: string): number {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
    return toMin(s1) < toMin(e2) && toMin(s2) < toMin(e1);
  }
  // Check if a schedule (array of sections) has any meeting conflicts
  function hasConflict(sections: SectionSchema[]): boolean {
    const meetings: MeetingSchema[] = sections.flatMap((s) => s.meetings || []);
    for (let i = 0; i < meetings.length; i++) {
      for (let j = i + 1; j < meetings.length; j++) {
        if (meetingsOverlap(meetings[i], meetings[j])) return true;
      }
    }
    return false;
  }
  // Only return schedules with no conflicts
  return cartesian(sectionLists).filter((sched) => !hasConflict(sched));
}

export function formatTimeAMPM(time: string) {
  // "HH:MM" (24h) to "h:MM AM/PM"
  if (!time) return "";
  let [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Parse events from a list of sections (one per course)
export function parseEventsFromSections(
  sections: any[],
  classes: CourseSchema[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const c = classes[i];
    if (!section || !section.meetings) continue;
    for (const meeting of section.meetings) {
      if (!meeting.days_of_week || !meeting.time_start || !meeting.time_end)
        continue;
      for (const day of meeting.days_of_week) {
        if (
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day)
        ) {
          events.push({
            id: `${c.subject_code}-${c.catalog_number}-${section.id}-${day}-${meeting.time_start}`,
            subject_code: c.subject_code,
            catalog_number: c.catalog_number,
            day,
            start: meeting.time_start,
            end: meeting.time_end,
          });
        }
      }
    }
  }
  return events;
}

export function timeToIndex(time: string) {
  // "HH:MM" to row index
  const [h, m] = time.split(":").map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

export function getRandomColor(subject_code: string, catalog_number: string) {
  // Deterministic color for each course (subject+catalog)
  const seed = `${subject_code}-${catalog_number}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 75%)`;
  return color;
}

export function getDayIndex(day: string) {
  // Accepts full day names
  switch (day) {
    case "Monday":
      return 0;
    case "Tuesday":
      return 1;
    case "Wednesday":
      return 2;
    case "Thursday":
      return 3;
    case "Friday":
      return 4;
    default:
      return -1;
  }
}
