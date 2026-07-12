// import { timeOptions } from '../constants/const';
// import { days, timeOptions } from '@/constants/const';

export const getLastSeenText = (lastSeen: string): string => {
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const differenceInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
  if (differenceInMinutes < 60) {
    return `last seen ${differenceInMinutes} minutes ago`;
  }
  const differenceInHours = Math.floor(differenceInMinutes / 60);
  if (differenceInHours < 24) {
    return `last seen ${differenceInHours} hours ago`;
  }
  const differenceInDays = Math.floor(differenceInHours / 24);
  return `last seen ${differenceInDays} days ago`;
};

// export const isOnline = (lastSeen: string): boolean => {
//   // const lastSeenHours = timeOptions.lastSeenHours;
//   const lastSeenDate = new Date(lastSeen);
//   const now = new Date();
//   const differenceInHours = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60));
//   return differenceInHours > lastSeenHours ? false : true;
// }

export const parseTimeToMinutes = (time: string): number => {
  if (typeof time !== 'string') {
    return 0;
  }
  const [hours, minutes, seconds] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }
  return hours * 60 + minutes + seconds / 60;
};


export const convertMinutesToHHMM = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hrs}:${mins < 10 ? "0" : ""}${mins}`;
};

const dayToShortMap: { [key: string]: string } = {
  sunday: 'su',
  monday: 'mo',
  tuesday: 'tu',
  wednesday: 'we',
  thursday: 'th',
  friday: 'fr',
  saturday: 'sa',
};
export const getShortDay = (fullDayName: string): string => {
  return dayToShortMap[fullDayName.toLowerCase()] || '';
};

export const formatTimeHHMM = (time: string): string => {
  if (!time) return "--";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};


// export const currentDay = () => {
//   const todayIndex = new Date().getDay();
//   return days[todayIndex].day;
// };

export const formattedTime = ({ hour, minute }: { hour: number; minute: number }) =>
  `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;


/**
 * Robustly parse a stored race-clock value into a Date.
 * Accepts ISO ("2026-07-12T14:30:05Z"), 24-hour ("14:30:05" / "14:30"),
 * and locale 12-hour ("2:30:05 PM") — the last of which older start paths
 * produced via toLocaleTimeString() and which naive parsers turned into
 * an Invalid Date (→ total time of 0).
 */
export const parseClockTime = (t: string | null | undefined): Date | null => {
  if (!t) return null;
  if (t.includes("T")) {
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }
  const ampmMatch = /\s*(AM|PM)\s*$/i.exec(t);
  const core = t.replace(/\s*(AM|PM)\s*$/i, "").trim();
  const [h0, m = 0, s = 0] = core.split(":").map(Number);
  if (isNaN(h0) || isNaN(m) || isNaN(s)) return null;
  let h = h0;
  if (ampmMatch) {
    const isPm = ampmMatch[1].toUpperCase() === "PM";
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
  }
  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
};

/**
 * The total elapsed time to display for a rider: computed live from the
 * start clock → last-lap arrival, falling back to the stored string.
 * Returns "—" when nothing usable is available.
 */
export const riderTotalTime = (rider: {
  timeStartRace: string | null;
  timeArrive: string | null;
  elapsedTimeFromStart: string | null;
}): string => {
  const start = parseClockTime(rider.timeStartRace);
  const end = rider.timeArrive ? new Date(rider.timeArrive) : null;
  if (start && end && !isNaN(end.getTime())) {
    const ms = end.getTime() - start.getTime();
    if (ms >= 0) return formatTime(ms / 1000);
  }
  const stored = rider.elapsedTimeFromStart;
  return stored && stored !== "00:00" && stored !== "00:00:00" ? stored : "—";
};

export const formatTime = (seconds: number): string => {
  // If negative or NaN, return "00:00"
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  // If hours exist, show "HH:MM:SS", else "MM:SS"
  return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}
export const formatTimeWithLeadingZeroes = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  // Always ensure each unit is zero-padded to 2 digits
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

export const startTimer = (
  startTimeString: string,
  onTick: (formattedTime: string) => void
): (() => void) => {
  const [startHours, startMinutes, startSeconds] = startTimeString.split(":").map(Number);

  const startTimeSeconds = startHours * 3600 + startMinutes * 60 + (startSeconds || 0);

  const updateTimer = () => {
    const now = new Date();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const elapsedSeconds = currentSeconds - startTimeSeconds;

    onTick(formatTimeWithLeadingZeroes(elapsedSeconds));
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
};
