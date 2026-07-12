import React from "react";
import styles from "./headerRace.module.css";
import Button from "@/components/ui/Button";
import Version from "@/components/Version/Version";
import { useNavigate } from "react-router-dom";
import useUIStore from "@/stores/uiStore";
import { ArrowLeft } from "lucide-react";
import RacePhaseSwitcher from "../racePhaseSwitcher/RacePhaseSwitcher";

function HeaderRace() {
  const navigate = useNavigate();
  const isRaceMode = useUIStore((s) => s.isRaceMode);

  return (
    <div
      className={`${styles.headerRace} ${isRaceMode ? styles.raceModeActive : ""}`}
    >
      <div className={styles.left}>
        <Button
          variant="icon"
          size="md"
          iconOnly
          aria-label="Back to main"
          onClick={() => navigate("/main")}
          className={styles.backBtn}
        >
          <ArrowLeft size={18} />
        </Button>
      </div>

      <div className={styles.center}>
        {/* Single, always-visible Setup / Race / Live switcher */}
        <RacePhaseSwitcher />
      </div>

      <div className={styles.right}>
        <Version />
      </div>
    </div>
  );
}

export default HeaderRace;
