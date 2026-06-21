import React, { useState, useMemo } from "react";
import styles from "./raceMode.module.css";
import { CategoryProps } from "@/types/types";
import StartManager from "./StartManager";
import CheckIn from "./CheckIn";
import LiveBoard from "./LiveBoard";
import { buildSchedule, DEFAULT_WAVE_GAP_MINUTES } from "../schedule/Schedule";

interface Props {
  raceUuid: string;
  categories: CategoryProps[];
}

type SubTab = "start" | "checkin" | "board";

const RaceMode: React.FC<Props> = ({ raceUuid, categories }) => {
  // Group categories by time gap (same logic as Schedule view)
  const schedule = useMemo(
    () => buildSchedule(categories, DEFAULT_WAVE_GAP_MINUTES),
    [categories]
  );
  const waveNums = useMemo(() => [...schedule.keys()], [schedule]);
  const [selectedWave, setSelectedWave] = useState<number>(waveNums[0] ?? 1);
  const [subTab, setSubTab] = useState<SubTab>("start");

  // All categories in the selected time-based wave (all start slots combined)
  const waveCategories = useMemo(() => {
    const startMap = schedule.get(selectedWave);
    if (!startMap) return [];
    return [...startMap.values()].flat();
  }, [schedule, selectedWave]);

  return (
    <div className={styles.container}>
      {/* Wave selector */}
      <div className={styles.waveBar}>
        <span className={styles.waveBarLabel}>Wave:</span>
        <div className={styles.wavePills}>
          {waveNums.map((w) => {
            const startMap = schedule.get(w);
            const firstTime = startMap ? [...startMap.keys()][0] : null;
            return (
              <button
                key={w}
                className={`${styles.wavePill} ${selectedWave === w ? styles.wavePillActive : ""}`}
                onClick={() => setSelectedWave(w)}
              >
                {w}{firstTime && firstTime !== "TBD" ? ` · ${firstTime}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className={styles.subTabs}>
        <button className={`${styles.subTab} ${subTab === "start" ? styles.subTabActive : ""}`} onClick={() => setSubTab("start")}>
          Start Manager
        </button>
        <button className={`${styles.subTab} ${subTab === "checkin" ? styles.subTabActive : ""}`} onClick={() => setSubTab("checkin")}>
          Check-In
        </button>
        <button className={`${styles.subTab} ${subTab === "board" ? styles.subTabActive : ""}`} onClick={() => setSubTab("board")}>
          Live Board
        </button>
      </div>

      <div className={styles.content}>
        {subTab === "start"   && <StartManager raceUuid={raceUuid} waveNum={selectedWave} categories={waveCategories} />}
        {subTab === "checkin" && <CheckIn raceUuid={raceUuid} waveNum={selectedWave} categories={waveCategories} />}
        {subTab === "board"   && <LiveBoard raceUuid={raceUuid} waveNum={selectedWave} categories={waveCategories} />}
      </div>
    </div>
  );
};

export default RaceMode;
