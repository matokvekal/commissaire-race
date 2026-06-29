import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icons from "@/constants/Icons";
import styles from "./headerHeat.module.css";
import useRaceStore from "@/stores/racesStore";
import { Settings } from "lucide-react";

function HeaderHeat({ raceId, onSettingsClick }: { raceId: string; onSettingsClick?: () => void }) {
  const navigate = useNavigate();
  const params = useParams();
  const heatId = params?.heatId ? parseInt(params.heatId as string, 10) : null;
  const [currentTime, setCurrentTime] = useState<string>("");
  const races = useRaceStore((s) => s.races);

  const race = useMemo(
    () => races.find((r) => r.uuid === raceId),
    [races, raceId]
  );

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-GB", { hour12: false });
      setCurrentTime(formattedTime);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate(`/race/${raceId}`);
  };

  return (
    <div className={styles.headerRace}>
      <div className={styles.leftSection}>
        <button className={styles.backBtn} onClick={handleBack} title="Back to race">
          <img src={Icons.arrowBackBlack} alt="back" width={16} height={16} />
        </button>
        <div className={styles.raceInfo}>
          <div className={styles.raceLiveLabel}>
            <span className={styles.liveDot}>●</span>
            RACE LIVE
          </div>
          <div className={styles.raceName}>{race?.name || "Race"}</div>
          {heatId && <div className={styles.waveLabel}>Wave {heatId}</div>}
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.timeDisplay}>
          <div className={styles.timeLabel}>Clock</div>
          <div className={styles.time}>{currentTime}</div>
        </div>
        <button className={styles.settingsBtn} onClick={onSettingsClick} title="Voice settings">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}

export default HeaderHeat;
