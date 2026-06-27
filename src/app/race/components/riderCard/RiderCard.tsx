import React from "react";
import { RiderProps } from "@/types/types";
import styles from "./riderCard.module.css";

const RiderCard: React.FC<RiderProps> = (rider) => {
  const isRacing = rider.raceStatus === "running" || rider.raceStatus === "finished";
  const isOut = ["DNS", "DNF", "DSQ"].includes(rider.status);

  const fullName = rider.lastName || rider.firstName
    ? `${rider.lastName ?? ""} ${rider.firstName ?? ""}`.trim()
    : "—";

  const laps = rider.lapsDetails ?? [];

  const formatStartTime = (t: string | null | undefined) => {
    if (!t) return null;
    // "HH:MM:SS" → "HH:MM"
    return t.includes("T") ? new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : t.slice(0, 5);
  };

  return (
    <div
      className={`${styles.riderCard} ${isOut ? styles.cardOut : ""}`}
      style={{ borderLeft: `4px solid ${rider.color ?? "#c6d9fb"}` }}
    >
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.bibBlock}>
          <span className={styles.bib}>#{rider.bibNumber || "—"}</span>
        </div>

        <div className={styles.middle}>
          <div className={styles.name} dir="auto">{fullName}</div>

          <div className={styles.metaRow}>
            {rider.category && (
              <span className={styles.catBadge} style={{ background: rider.color ? `${rider.color}22` : "#eef2fc", color: rider.color ?? "#3a5080" }}>
                {rider.category}
                {rider.subCategory && <span className={styles.subCat}> · {rider.subCategory}</span>}
              </span>
            )}
          </div>

          <div className={styles.infoRow}>
            {isRacing ? (
              <>
                <span className={styles.infoChip}>
                  {rider.lapsCounter ?? 0}/{rider.totalLaps ?? 0} laps
                </span>
                {rider.timeStartRace && (
                  <span className={styles.infoChip}>Start {formatStartTime(rider.timeStartRace)}</span>
                )}
                {rider.elapsedTimeFromStart && (
                  <span className={styles.infoChip}>{rider.elapsedTimeFromStart}</span>
                )}
              </>
            ) : (
              <>
                {rider.team && <span className={styles.infoChip} dir="auto">{rider.team}</span>}
                {rider.heat ? <span className={styles.infoChip}>Wave {rider.heat}</span> : null}
              </>
            )}
          </div>
        </div>

        <div className={styles.right}>
          {isOut ? (
            <span className={`${styles.statusBadge} ${styles.statusOut}`}>{rider.status}</span>
          ) : isRacing ? (
            <>
              <span className={styles.statusBadge}>{rider.raceStatus}</span>
              <span className={styles.pos}>
                {rider.raceStatus === "finished"
                  ? `P${rider.position_category ?? "—"}`
                  : `P${rider.position_category ?? "—"}`}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Lap table — only when racing and has lap history */}
      {isRacing && laps.length > 0 && (
        <div className={styles.lapTable}>
          <div className={styles.lapTableHead}>
            <span>Lap</span>
            <span>Time</span>
            <span>Pos</span>
            {laps.some((l) => l.speed_kph != null) && <span>km/h</span>}
          </div>
          {laps.map((l) => (
            <div key={l.lap} className={styles.lapRow}>
              <span className={styles.lapNum}>{l.lap}</span>
              <span className={styles.lapTime}>{l.lapTime}</span>
              <span className={styles.lapPos}>{l.position != null ? `P${l.position}` : "—"}</span>
              {laps.some((x) => x.speed_kph != null) && (
                <span className={styles.lapSpeed}>{l.speed_kph != null ? `${l.speed_kph}` : "—"}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderCard;
