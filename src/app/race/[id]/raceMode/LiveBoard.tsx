import React, { useEffect } from "react";
import styles from "./liveBoard.module.css";
import { CategoryProps, RiderProps } from "@/types/types";
import useRiderStore from "@/stores/ridersStore";
import calculatePositions from "@/utils/calculatePosition";

interface Props {
  raceUuid: string;
  waveNum: number;
  categories: CategoryProps[];
}

function parseTimeStr(t: string | null | undefined): Date | null {
  if (!t) return null;
  if (t.includes("T")) return new Date(t);
  const today = new Date();
  const [h, m, s = 0] = t.split(":").map(Number);
  today.setHours(h, m, s, 0);
  return today;
}

function elapsed(rider: RiderProps): string {
  const start = parseTimeStr(rider.timeStartRace);
  if (!start) return "—";
  const end = rider.timeArrive ? new Date(rider.timeArrive) : new Date();
  const s = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

const LiveBoard: React.FC<Props> = ({ raceUuid, waveNum, categories }) => {
  const { riders, getRiders } = useRiderStore();

  useEffect(() => { getRiders(raceUuid); }, [raceUuid, getRiders]);

  const catNames = new Set(categories.map((c) => c.name));
  const waveRiders = riders.filter((r) => r.raceUuid === raceUuid && catNames.has(r.category));
  const positioned = calculatePositions([...waveRiders]);

  if (!categories.length) {
    return <div className={styles.empty}>No categories in this wave.</div>;
  }

  // Finished categories: most recently finished first (top of list)
  // Running / upcoming: below, in original order
  const sortedCategories = [...categories].sort((a, b) => {
    const aFinished = a.status === "finished";
    const bFinished = b.status === "finished";
    if (aFinished && bFinished) {
      // Both done — most recently finished goes first (higher finishedAt = more recent)
      return (b.finishedAt ?? 0) - (a.finishedAt ?? 0);
    }
    if (aFinished) return -1; // a finished → goes to top
    if (bFinished) return 1;  // b finished → b goes to top, a stays below
    return 0;
  });

  return (
    <div className={styles.container}>
      {sortedCategories.map((cat) => {
        const catRiders = positioned.filter((r) => r.category === cat.name);
        const activeRiders = catRiders.filter((r) => !["DNF","DSQ","DNS"].includes(r.status));
        const finished = activeRiders.filter((r) => r.raceStatus === "finished").length;
        const onTrack  = activeRiders.filter((r) => r.raceStatus === "running").length;
        const allDone  = cat.status === "finished" || (activeRiders.length > 0 && onTrack === 0 && finished > 0);

        const top5 = [...activeRiders]
          .filter((r) => r.raceStatus === "running" || r.raceStatus === "finished")
          .sort((a, b) => (b.lapsCounter ?? 0) - (a.lapsCounter ?? 0) || (a.position_category ?? 999) - (b.position_category ?? 999))
          .slice(0, 5);

        return (
          <div key={cat.id} className={`${styles.catBlock} ${allDone ? styles.catBlockDone : ""}`}>
            <div className={`${styles.catHeader} ${allDone ? styles.catHeaderDone : ""}`}>
              <span className={styles.catDot} style={{ background: cat.color ?? "#ccc" }} />
              <span className={styles.catName}>
                {allDone && <span className={styles.flagIcon}>🏁</span>}
                {cat.name}
              </span>
              <div className={styles.catStats}>
                {finished > 0 && <span className={styles.stat}>{allDone ? `${finished} fin` : `🏁 ${finished}`}</span>}
                {onTrack  > 0 && <span className={styles.stat}>⚡ {onTrack}</span>}
              </div>
            </div>

            {top5.length === 0 ? (
              <div className={styles.noData}>{allDone ? "Race complete" : "Race not started"}</div>
            ) : (
              top5.map((rider, i) => (
                <div key={rider.id} className={`${styles.row} ${rider.raceStatus === "finished" ? styles.finRow : styles.running}`}>
                  <span className={styles.pos}>P{i + 1}</span>
                  <span className={styles.bib}>#{rider.bibNumber}</span>
                  <span className={styles.name}>{rider.lastName} {rider.firstName}</span>
                  <span className={styles.laps}>{rider.lapsCounter ?? 0}/{rider.totalLaps ?? "?"}</span>
                  <span className={styles.time}>{elapsed(rider)}</span>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LiveBoard;
