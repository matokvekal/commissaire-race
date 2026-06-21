import React, { useState, useEffect, useRef } from "react";
import styles from "./startManager.module.css";
import { CategoryProps } from "@/types/types";
import useCategoryStore from "@/stores/categoryStore";
import useRiderStore from "@/stores/ridersStore";
import useRaceStore from "@/stores/racesStore";
import { useNavigate } from "react-router-dom";
import Icons from "@/constants/Icons";
import Button from "@/components/ui/Button";
import { Plus, Edit2, GripVertical, X, Trash2 } from "lucide-react";

interface Props {
  raceUuid: string;
  waveNum: number;
  categories: CategoryProps[];
}

interface StartGroup {
  id: string;
  time: string;
  categoryIds: number[];
}

/** Normalize any time string to "HH:MM" for consistent grouping */
function normStartTime(t: string | null | undefined): string | null {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

/** Group categories by startTime within a wave */
function groupByStart(cats: CategoryProps[]) {
  const map = new Map<string, CategoryProps[]>();
  for (const cat of [...cats].sort((a, b) => {
    const ta = normStartTime(a.startTime) ?? "";
    const tb = normStartTime(b.startTime) ?? "";
    return ta.localeCompare(tb);
  })) {
    const key = normStartTime(cat.startTime) ?? "TBD";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(cat);
  }
  return map;
}

const Countdown: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [count, setCount] = useState(60);
  useEffect(() => {
    if (count <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className={styles.countdownOverlay}>
      <div className={styles.countdownNum}>{count}</div>
      <div className={styles.countdownLabel}>seconds to start</div>
      <button className={styles.countdownCancel} onClick={onDone}>
        Cancel
      </button>
    </div>
  );
};

interface ManageCategoriesModalProps {
  startGroup: StartGroup;
  allCategories: CategoryProps[];
  assignedCategoryIds: Set<number>;
  onClose: () => void;
  onSave: (categoryIds: number[]) => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  startGroup,
  allCategories,
  assignedCategoryIds,
  onClose,
  onSave
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([
    ...startGroup.categoryIds
  ]);
  const [draggedCategory, setDraggedCategory] = useState<CategoryProps | null>(
    null
  );

  // Available categories: not assigned elsewhere OR already in this start group
  const availableCategories = allCategories.filter(
    (cat) =>
      !assignedCategoryIds.has(cat.id) ||
      startGroup.categoryIds.includes(cat.id)
  );

  const selectedCategories = selectedIds
    .map((id) => allCategories.find((c) => c.id === id))
    .filter(Boolean) as CategoryProps[];

  const unselectedCategories = availableCategories.filter(
    (cat) => !selectedIds.includes(cat.id)
  );

  const toggleCategory = (catId: number) => {
    setSelectedIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const handleDragStart = (e: React.DragEvent, cat: CategoryProps) => {
    setDraggedCategory(cat);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnSelected = () => {
    if (!draggedCategory) return;
    if (!selectedIds.includes(draggedCategory.id)) {
      setSelectedIds([...selectedIds, draggedCategory.id]);
    }
    setDraggedCategory(null);
  };

  const handleDropOnAvailable = () => {
    if (!draggedCategory) return;
    setSelectedIds(selectedIds.filter((id) => id !== draggedCategory.id));
    setDraggedCategory(null);
  };

  const removeCategory = (catId: number) => {
    setSelectedIds(selectedIds.filter((id) => id !== catId));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Manage Categories</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.categoriesPanel}>
            <div className={styles.panelHeader}>
              <span>Available Categories</span>
              <span className={styles.count}>
                {unselectedCategories.length}
              </span>
            </div>
            <div
              className={styles.categoryList}
              onDragOver={handleDragOver}
              onDrop={handleDropOnAvailable}
            >
              {unselectedCategories.length === 0 ? (
                <div className={styles.emptyMessage}>
                  All categories assigned
                </div>
              ) : (
                unselectedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={styles.categoryItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat)}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <GripVertical size={14} className={styles.dragHandle} />
                    <div
                      className={styles.colorDot}
                      style={{ background: cat.color ?? "#ccc" }}
                    />
                    <span className={styles.catName}>{cat.name}</span>
                    {cat.subCategory && (
                      <span className={styles.subCategory}>
                        {" "}
                        · {cat.subCategory}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.categoriesPanel}>
            <div className={styles.panelHeader}>
              <span>Selected for This Start</span>
              <span className={styles.count}>{selectedIds.length}</span>
            </div>
            <div
              className={styles.categoryList}
              onDragOver={handleDragOver}
              onDrop={handleDropOnSelected}
            >
              {selectedCategories.length === 0 ? (
                <div className={styles.emptyMessage}>
                  Drag categories here or click to add
                </div>
              ) : (
                selectedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`${styles.categoryItem} ${styles.selected}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat)}
                  >
                    <GripVertical size={14} className={styles.dragHandle} />
                    <div
                      className={styles.colorDot}
                      style={{ background: cat.color ?? "#ccc" }}
                    />
                    <span className={styles.catName}>{cat.name}</span>
                    {cat.subCategory && (
                      <span className={styles.subCategory}>
                        {" "}
                        · {cat.subCategory}
                      </span>
                    )}
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeCategory(cat.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={() => {
              onSave(selectedIds);
              onClose();
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const StartManager: React.FC<Props> = ({ raceUuid, waveNum, categories }) => {
  const navigate = useNavigate();
  const { updateCategory } = useCategoryStore();
  const { riders, updateAllRiders } = useRiderStore();
  const { races, updateRace } = useRaceStore();
  const [countdown, setCountdown] = useState<string | null>(null);
  const [editingStartId, setEditingStartId] = useState<string | null>(null);
  const [startGroups, setStartGroups] = useState<StartGroup[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [waveBaseTime, setWaveBaseTime] = useState<string>("");

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize start groups from categories and calculate wave base time
  useEffect(() => {
    const grouped = groupByStart(categories);
    const groups: StartGroup[] = [];
    let idx = 0;
    let firstTime: string | null = null;

    grouped.forEach((cats, time) => {
      const timeStr = time === "TBD" ? "" : time;
      if (!firstTime && timeStr) firstTime = timeStr;

      groups.push({
        id: `start-${idx}`,
        time: timeStr,
        categoryIds: cats.map((c) => c.id)
      });
      idx++;
    });

    setStartGroups(groups);
    if (firstTime) {
      setWaveBaseTime(firstTime);
    } else {
      // Default to current time if no times set
      const now = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      setWaveBaseTime(now);
    }
  }, [categories]);

  // Parse time string to Date object
  const parseTime = (timeStr: string): Date => {
    const [hours, minutes, secs = 0] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, secs, 0);
    return date;
  };

  // Calculate offset in seconds between two time strings
  const getTimeOffset = (baseTime: string, targetTime: string): number => {
    if (!baseTime || !targetTime) return 0;
    const base = parseTime(baseTime);
    const target = parseTime(targetTime);
    return Math.floor((target.getTime() - base.getTime()) / 1000);
  };

  // Apply offset to a time
  const applyOffset = (baseTime: string, offsetSeconds: number): string => {
    const date = parseTime(baseTime);
    date.setSeconds(date.getSeconds() + offsetSeconds);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Adjust wave time and cascade to all starts
  const adjustWaveTime = (seconds: number) => {
    // Calculate offsets for all starts relative to current wave time
    const offsets = startGroups.map((g) => ({
      id: g.id,
      offset: g.time ? getTimeOffset(waveBaseTime, g.time) : 0
    }));

    // Adjust wave base time
    const newWaveTime = applyOffset(waveBaseTime, seconds);
    setWaveBaseTime(newWaveTime);

    // Apply offsets to new wave time for all starts
    setStartGroups((prev) =>
      prev.map((g) => {
        const offset = offsets.find((o) => o.id === g.id)?.offset || 0;
        return {
          ...g,
          time: applyOffset(newWaveTime, offset)
        };
      })
    );
  };

  // Set wave time to now and cascade
  const setWaveTimeToNow = () => {
    const offsets = startGroups.map((g) => ({
      id: g.id,
      offset: g.time ? getTimeOffset(waveBaseTime, g.time) : 0
    }));

    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setWaveBaseTime(now);

    setStartGroups((prev) =>
      prev.map((g) => {
        const offset = offsets.find((o) => o.id === g.id)?.offset || 0;
        return {
          ...g,
          time: applyOffset(now, offset)
        };
      })
    );
  };

  // Update wave numbers in categories when wave time changes
  const updateWaveNumbersInCategories = async (newWaveTime: string) => {
    // Get all waves from all categories
    const allCats = await useCategoryStore.getState().getCategories(raceUuid);
    const waves = [...new Set(allCats.map((c) => c.heat ?? 0))].sort(
      (a, b) => a - b
    );

    // Get the first start time for each wave
    const waveTimesMap = new Map<number, string>();
    waves.forEach((waveNum) => {
      const waveCats = allCats.filter((c) => (c.heat ?? 0) === waveNum);
      const times = waveCats
        .map((c) => c.startTime)
        .filter(Boolean) as string[];
      if (times.length > 0) {
        // Get earliest time for this wave
        const sortedTimes = times.sort();
        waveTimesMap.set(waveNum, sortedTimes[0]);
      }
    });

    // If current wave time changed, check if reordering is needed
    waveTimesMap.set(waveNum, newWaveTime);

    // Sort waves by their start times
    const sortedWaves = Array.from(waveTimesMap.entries())
      .sort((a, b) => {
        if (!a[1]) return 1;
        if (!b[1]) return -1;
        return a[1].localeCompare(b[1]);
      })
      .map(([num]) => num);

    // Create mapping of old wave numbers to new wave numbers
    const waveMapping = new Map<number, number>();
    sortedWaves.forEach((oldNum, index) => {
      waveMapping.set(oldNum, index + 1);
    });

    // Check if current wave number needs to change
    const newWaveNum = waveMapping.get(waveNum);
    if (newWaveNum && newWaveNum !== waveNum) {
      // Update all categories in this wave with new wave number
      const waveCats = allCats.filter((c) => (c.heat ?? 0) === waveNum);
      for (const cat of waveCats) {
        await updateCategory({ ...cat, heat: newWaveNum });
      }
    }
  };

  const startGroup = async (group: StartGroup) => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    const race = races.find((r) => r.uuid === raceUuid);
    if (race) await updateRace({ ...race, status: "running" });

    const cats = group.categoryIds
      .map((id) => categories.find((c) => c.id === id))
      .filter(Boolean) as CategoryProps[];

    for (const cat of cats) {
      if (cat.status !== "upcoming") continue;
      const catRiders = riders.filter(
        (r) =>
          r.category === cat.name &&
          r.raceUuid === raceUuid &&
          r.status !== "DNS"
      );
      const updatedCat = {
        ...cat,
        status: "running" as const,
        startTime: now,
        lapsCounter: 0,
        riders: catRiders.length
      };
      await updateCategory(updatedCat);
      const updatedRiders = catRiders.map((r, i) => ({
        ...r,
        raceStatus: "running" as const,
        timeStartRace: now,
        lapsCounter: 0,
        viewOrder: r.position_start ?? i + 1
      }));
      await updateAllRiders(updatedRiders);
    }
  };

  const adjustTime = (groupId: string, seconds: number) => {
    setStartGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;

        // Parse current time or use current time if empty
        let timeDate: Date;
        if (g.time) {
          const [hours, minutes, secs = 0] = g.time.split(":").map(Number);
          timeDate = new Date();
          timeDate.setHours(hours, minutes, secs, 0);
        } else {
          timeDate = new Date();
        }

        // Add/subtract seconds
        timeDate.setSeconds(timeDate.getSeconds() + seconds);

        // Format back to HH:MM:SS
        const newTime = timeDate.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        return { ...g, time: newTime };
      })
    );
  };

  const setTimeToNow = (groupId: string) => {
    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    setStartGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, time: now } : g))
    );
  };

  const saveStartGroupCategories = async (
    groupId: string,
    categoryIds: number[]
  ) => {
    // Update categories with the new start time
    const group = startGroups.find((g) => g.id === groupId);
    if (!group) return;

    for (const catId of categoryIds) {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        await updateCategory({
          ...cat,
          startTime: group.time || null
        });
      }
    }

    // Update local state
    setStartGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, categoryIds } : g))
    );
  };

  const addNewStart = () => {
    const newStart: StartGroup = {
      id: `start-${Date.now()}`,
      time: "",
      categoryIds: []
    };
    setStartGroups([...startGroups, newStart]);
  };

  const deleteStart = async (groupId: string) => {
    const group = startGroups.find((g) => g.id === groupId);
    if (!group) return;

    // Clear start times for categories in this group
    for (const catId of group.categoryIds) {
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        await updateCategory({ ...cat, startTime: null });
      }
    }

    setStartGroups(startGroups.filter((g) => g.id !== groupId));
  };

  // Get all assigned category IDs (excluding the one being edited)
  const getAssignedCategoryIds = (excludeGroupId?: string) => {
    const assigned = new Set<number>();
    startGroups.forEach((g) => {
      if (g.id !== excludeGroupId) {
        g.categoryIds.forEach((id) => assigned.add(id));
      }
    });
    return assigned;
  };

  if (!categories.length) {
    return <div className={styles.empty}>No categories in this wave.</div>;
  }

  return (
    <div className={styles.container}>
      {countdown && <Countdown onDone={() => setCountdown(null)} />}

      {editingStartId && (
        <ManageCategoriesModal
          startGroup={startGroups.find((g) => g.id === editingStartId)!}
          allCategories={categories}
          assignedCategoryIds={getAssignedCategoryIds(editingStartId)}
          onClose={() => setEditingStartId(null)}
          onSave={(categoryIds) =>
            saveStartGroupCategories(editingStartId, categoryIds)
          }
        />
      )}

      <div className={styles.header}>
        <div className={styles.currentTime}>
          <span className={styles.timeLabel}>Current Time:</span>
          <span className={styles.timeValue}>
            {currentTime.toLocaleTimeString("en-GB")}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          startIcon={<Plus size={14} />}
          onClick={addNewStart}
        >
          Add Start Group
        </Button>
      </div>

      {/* Wave Time Control */}
      <div className={styles.waveTimeControl}>
        <div className={styles.waveTimeHeader}>
          <span className={styles.waveLabel}>Wave {waveNum} Start Time</span>
          <span className={styles.waveTimeHelp}>
            (Adjusting wave time shifts all starts)
          </span>
        </div>
        <div className={styles.waveTimeAdjust}>
          <button
            className={styles.waveTimeBtn}
            onClick={() => adjustWaveTime(-30)}
            title="Shift all starts -30 seconds"
          >
            − 30s
          </button>
          <span
            className={styles.waveTimeDisplay}
            onClick={setWaveTimeToNow}
            title="Click to set wave time to now"
          >
            {waveBaseTime || "Not Set"}
          </span>
          <button
            className={styles.waveTimeBtn}
            onClick={() => adjustWaveTime(30)}
            title="Shift all starts +30 seconds"
          >
            + 30s
          </button>
        </div>
      </div>

      {startGroups.map((group, si) => {
        const cats = group.categoryIds
          .map((id) => categories.find((c) => c.id === id))
          .filter(Boolean) as CategoryProps[];
        const allRunning = cats.every((c) => c.status !== "upcoming");
        const hasCategories = cats.length > 0;

        return (
          <div key={group.id} className={styles.startBlock}>
            <div className={styles.startHeader}>
              <div className={styles.startInfo}>
                <span className={styles.startLabel}>Start {si + 1}</span>
                <div className={styles.timeControls}>
                  <button
                    className={styles.timeBtn}
                    onClick={() => adjustTime(group.id, -30)}
                    title="Decrease 30 seconds"
                  >
                    −
                  </button>
                  <span
                    className={styles.startTime}
                    onClick={() => setTimeToNow(group.id)}
                    title="Click to set to current time"
                  >
                    {group.time || "Not Set"}
                  </span>
                  <button
                    className={styles.timeBtn}
                    onClick={() => adjustTime(group.id, 30)}
                    title="Increase 30 seconds"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.startActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => setEditingStartId(group.id)}
                  title="Manage categories"
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  onClick={() => deleteStart(group.id)}
                  title="Delete start"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {hasCategories ? (
              <>
                <div className={styles.catList}>
                  {cats.map((cat) => (
                    <div key={cat.id} className={styles.catRow}>
                      <div
                        className={styles.colorDot}
                        style={{ background: cat.color ?? "#ccc" }}
                      />
                      <span className={styles.catName}>
                        {cat.name}
                        {cat.subCategory && (
                          <span className={styles.subCategory}>
                            {" "}
                            · {cat.subCategory}
                          </span>
                        )}
                      </span>
                      <span
                        className={`${styles.statusTag} ${
                          cat.status === "running"
                            ? styles.running
                            : cat.status === "finished"
                              ? styles.finished
                              : ""
                        }`}
                      >
                        {cat.status ?? "upcoming"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.actions}>
                  {!allRunning && (
                    <>
                      <button
                        className={styles.countdownBtn}
                        onClick={() => setCountdown(group.id)}
                      >
                        ⏱ 1 Min
                      </button>
                      <button
                        className={styles.startBtn}
                        onClick={() => startGroup(group)}
                      >
                        <img
                          src={Icons.buttonStart}
                          alt=""
                          width={14}
                          height={14}
                        />
                        Start All
                      </button>
                    </>
                  )}
                  {allRunning && (
                    <button
                      className={styles.liveBtn}
                      onClick={() =>
                        navigate(`/race/${raceUuid}/heat/${waveNum}`)
                      }
                    >
                      Go Live →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyStart}>
                <p>No categories assigned to this start</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingStartId(group.id)}
                >
                  Add Categories
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StartManager;
