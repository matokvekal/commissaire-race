import React, { useState } from "react";
import styles from "./info.module.css";
import { RaceProps } from "@/types/types";
import Icons from "@/constants/Icons";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import useRaceStore from "@/stores/racesStore";
import { Edit2, Check, X, ExternalLink } from "lucide-react";

interface Props {
  race: RaceProps;
  onDeleteRace?: () => Promise<void>;
}

const Info: React.FC<Props> = ({ race, onDeleteRace }) => {
  const [showDeleteRace, setShowDeleteRace] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [takanonUrl, setTakanonUrl] = useState(race.takanon ?? "");
  const updateRace = useRaceStore((s) => s.updateRace);

  const handleSave = async () => {
    await updateRace({ ...race, takanon: takanonUrl });
    setEditMode(false);
  };

  const handleCancel = () => {
    setTakanonUrl(race.takanon ?? "");
    setEditMode(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Race Details</div>
        <Row icon={Icons.calander} label="Date" value={race.date} />
        <Row icon={Icons.time} label="Start time" value={race.time} />
        <Row icon={Icons.earth} label="Location" value={race.location} />
        <Row icon={Icons.road} label="Distance" value={race.distance ? `${race.distance} km` : "—"} />
        <Row icon={Icons.setting} label="Type" value={race.type} />
        <Row icon={Icons.setting} label="Level" value={race.level} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Organisation</div>
        <Row icon={Icons.rider1} label="Organiser" value={race.orgenizer} />
        <Row icon={Icons.rider1} label="Manager" value={race.manager} />
        <Row icon={Icons.mainMsg} label="Phone" value={race.phone} />
        {race.site && <Row icon={Icons.earth} label="Website" value={race.site} />}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionTitleText}>תקנון / Rules</span>
          {!editMode ? (
            <button className={styles.editIconBtn} onClick={() => setEditMode(true)} title="Edit takanon URL">
              <Edit2 size={13} />
            </button>
          ) : (
            <div className={styles.editIconRow}>
              <button className={styles.editIconBtn} onClick={handleCancel} title="Cancel">
                <X size={13} />
              </button>
              <button className={styles.saveIconBtn} onClick={handleSave} title="Save">
                <Check size={13} />
              </button>
            </div>
          )}
        </div>
        {editMode ? (
          <div className={styles.takanonEdit}>
            <input
              type="url"
              className={styles.takanonInput}
              value={takanonUrl}
              onChange={(e) => setTakanonUrl(e.target.value)}
              placeholder="https://example.com/takanon.pdf"
            />
          </div>
        ) : race.takanon ? (
          <a
            href={race.takanon}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.takanonLink}
          >
            <ExternalLink size={14} />
            View Rules Document
          </a>
        ) : (
          <div className={styles.takanonEmpty}>No rules document — tap edit to add a link</div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Status</div>
        <div className={`${styles.statusBadge} ${styles[race.status ?? "upcoming"]}`}>
          {race.status ?? "upcoming"}
        </div>
      </div>

      {onDeleteRace && (
        <div className={styles.dangerZone}>
          <div className={styles.dangerTitle}>Danger Zone</div>
          <div className={styles.dangerBody}>
            <div className={styles.dangerText}>
              Permanently delete this race, all its riders, and all categories.
              This cannot be undone.
            </div>
            <button
              className={styles.deleteRaceBtn}
              onClick={() => setShowDeleteRace(true)}
            >
              🗑 Delete Race
            </button>
          </div>
        </div>
      )}

      {showDeleteRace && onDeleteRace && (
        <DeleteConfirmModal
          title={`Delete "${race.name}"`}
          description="This will permanently delete the race and all associated riders, categories, and data. This cannot be undone."
          onConfirm={async () => {
            await onDeleteRace();
            setShowDeleteRace(false);
          }}
          onCancel={() => setShowDeleteRace(false)}
        />
      )}
    </div>
  );
};

const Row: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className={styles.row}>
    <img src={icon} alt="" width={16} height={16} className={styles.rowIcon} />
    <span className={styles.rowLabel}>{label}</span>
    <span className={styles.rowValue}>{value || "—"}</span>
  </div>
);

export default Info;
