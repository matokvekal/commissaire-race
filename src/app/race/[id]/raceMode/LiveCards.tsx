import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./liveCards.module.css";
import { CategoryProps, RiderProps } from "@/types/types";
import useRiderStore from "@/stores/ridersStore";
import RacingRider from "../categories/racingRider/RacingRider";
import FinishRider from "../categories/finishRider/FinishRider";
import calculatePositions from "@/utils/calculatePosition";
import { formatTime } from "@/utils/timeUtils";
import { toast } from "react-toastify";

const MIN_LAP_MS = 60 * 1000;

function parseTimeStr(t: string | null | undefined): Date | null {
  if (!t) return null;
  if (t.includes("T")) return new Date(t);
  const today = new Date();
  const [h, m, s = 0] = t.split(":").map(Number);
  today.setHours(h, m, s, 0);
  return today;
}

interface Props {
  raceUuid: string;
  waveNum: number;
  categories: CategoryProps[];
}

const LiveCards: React.FC<Props> = ({ raceUuid, waveNum, categories }) => {
  const navigate = useNavigate();
  const { riders, getRiders, updateRider, updateAllRiders } = useRiderStore();

  useEffect(() => { getRiders(raceUuid); }, [raceUuid, getRiders]);

  const isRaceStarted = categories.some(
    (c) => c.status === "running" || c.status === "finished"
  );

  const catNames = new Set(categories.map((c) => c.name));
  const waveRiders = riders.filter(
    (r) => r.raceUuid === raceUuid && catNames.has(r.category) && r.checked
  );

  const positioned = calculatePositions([...waveRiders]);

  const getCatColor = (rider: RiderProps) => {
    const cat = categories.find((c) => c.name === rider.category);
    return cat?.color ?? rider.color ?? "#ccc";
  };

  const handleRiderClick = (rider: RiderProps) => {
    if (!isRaceStarted) return;
    if ((rider.totalLaps > 0 && rider.lapsCounter >= rider.totalLaps) || rider.raceStatus === "finished") return;

    const clickTime = new Date();
    if (rider.timeArrive) {
      const msSinceLast = clickTime.getTime() - new Date(rider.timeArrive).getTime();
      if (msSinceLast < MIN_LAP_MS) {
        const remaining = Math.ceil((MIN_LAP_MS - msSinceLast) / 1000);
        toast.info(`Wait ${remaining}s before next lap`);
        return;
      }
    }

    const lapsCounter = (rider.lapsCounter || 0) + 1;
    const raceStart = parseTimeStr(rider.timeStartRace) ?? clickTime;
    const lastLapStart = rider.timeArrive ? new Date(rider.timeArrive) : raceStart;
    const lapMs = clickTime.getTime() - lastLapStart.getTime();
    const lapTime = formatTime(lapMs / 1000);
    const isFinished = rider.totalLaps > 0 && lapsCounter >= rider.totalLaps;

    const intermediateRider: RiderProps = {
      ...rider,
      lapsCounter,
      elapsedLastLap: lapTime,
      elapsedTimeFromStart: formatTime((clickTime.getTime() - raceStart.getTime()) / 1000),
      timeArrive: clickTime.toISOString(),
      raceStatus: isFinished ? "finished" : rider.raceStatus,
    };

    const allWithUpdated = riders.map((r) => (r.id === intermediateRider.id ? intermediateRider : r));
    const sorted = calculatePositions(allWithUpdated);
    const positionAtLap = sorted.find((r) => r.id === rider.id)?.position_category ?? rider.position_category;

    const updatedRider: RiderProps = {
      ...intermediateRider,
      position_category: positionAtLap,
      lapsDetails: [
        ...(rider.lapsDetails ?? []),
        { lap: lapsCounter, startTime: lastLapStart, endTime: clickTime, lapTime, position: positionAtLap },
      ],
    };

    updateRider(updatedRider);
    updateAllRiders(sorted.map((r) => (r.id === updatedRider.id ? updatedRider : r)));
  };

  return (
    <div className={styles.container}>
      {!isRaceStarted && (
        <div className={styles.notStartedBanner}>
          Race hasn't started yet
        </div>
      )}
      <button
        className={styles.goLiveBtn}
        onClick={() => navigate(`/race/${raceUuid}/heat/${waveNum}`)}
      >
        Go Live →
      </button>

      {categories.map((cat) => {
        const catRiders = positioned.filter((r) => r.category === cat.name);
        if (catRiders.length === 0) return null;

        const isOut = (r: RiderProps) => ["DNS", "DNF", "DSQ"].includes(r.status);

        const activeRiders = catRiders
          .filter((r) => !isOut(r) && r.raceStatus !== "finished")
          .sort((a, b) =>
            (a.position_category ?? 999) - (b.position_category ?? 999) ||
            a.bibNumber - b.bibNumber
          );

        const finishedRiders = catRiders
          .filter((r) => !isOut(r) && r.raceStatus === "finished")
          .sort((a, b) => (a.position_category ?? 999) - (b.position_category ?? 999));

        const outRiders = catRiders.filter(isOut);

        return (
          <div key={cat.id} className={styles.catSection}>
            <div className={styles.catHeader}>
              <span className={styles.catDot} style={{ background: cat.color ?? "#ccc" }} />
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.catCount}>{catRiders.length}</span>
            </div>

            {(cat.laps ?? 0) > 0 && (() => {
              const maxLaps = catRiders.length > 0
                ? Math.max(0, ...catRiders.map((r) => r.lapsCounter || 0))
                : 0;
              return (
                <div className={styles.lapBar}>
                  {Array.from({ length: cat.laps! }, (_, i) => (
                    <div key={i} className={`${styles.lapSegment} ${i < maxLaps ? styles.lapSegmentDone : ""}`} />
                  ))}
                </div>
              );
            })()}

          <div className={styles.cardGrid}>
              {activeRiders.map((rider) => (
                <RacingRider
                  key={rider.id}
                  rider={rider}
                  color={getCatColor(rider)}
                  onClick={() => handleRiderClick(rider)}
                  onDoubleClick={() => {}}
                />
              ))}
              {finishedRiders.map((rider) => (
                <FinishRider
                  key={rider.id}
                  rider={rider}
                  color={getCatColor(rider)}
                  onDoubleClick={() => {}}
                />
              ))}
              {outRiders.map((rider) => (
                <FinishRider
                  key={rider.id}
                  rider={rider}
                  color={getCatColor(rider)}
                  onDoubleClick={() => {}}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveCards;
