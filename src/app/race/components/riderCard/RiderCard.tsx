import React from "react";
import { RiderProps } from "@/types/types";
import styles from "./riderCard.module.css";

const RiderCard: React.FC<RiderProps> = (rider) => {
  const isRacing =
    rider.raceStatus === "running" || rider.raceStatus === "finished";

  const fullName = rider.lastName || rider.firstName
    ? `${rider.lastName ?? ""} ${rider.firstName ?? ""}`.trim()
    : "—";

  return (
    <div
      className={styles.riderCard}
      style={{ borderLeft: `4px solid ${rider.color ?? "#c6d9fb"}` }}
    >
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
              {rider.elapsedTimeFromStart && (
                <span className={styles.infoChip}>{rider.elapsedTimeFromStart}</span>
              )}
            </>
          ) : (
            <>
              {rider.team && (
                <span className={styles.infoChip} dir="auto">{rider.team}</span>
              )}
              {rider.heat ? (
                <span className={styles.infoChip}>Wave {rider.heat}</span>
              ) : null}
              {rider.startTime && (
                <span className={styles.infoChip}>{rider.startTime}</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.right}>
        {isRacing ? (
          <>
            <span className={styles.statusBadge}>{rider.raceStatus}</span>
            <span className={styles.pos}>
              {rider.raceStatus === "finished"
                ? `P${rider.position_category ?? "—"}`
                : `#${rider.position_start ?? "—"}`}
            </span>
          </>
        ) : rider.gender ? (
          <span className={styles.genderChip}>{rider.gender}</span>
        ) : null}
      </div>
    </div>
  );
};

export default RiderCard;
