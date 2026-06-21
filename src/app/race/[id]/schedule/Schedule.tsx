import React, { useState, useEffect } from "react";
import styles from "./schedule.module.css";
import Button from "@/components/ui/Button";
import ButtonStart from "../../components/buttons/ButtonStart";
import ButtonRunning from "../../components/buttons/ButtonRunning";
import { useNavigate } from "react-router-dom";
import { CategoryProps } from "@/types/types";
import {
  Radio,
  Trophy,
  Edit2,
  Plus,
  GripVertical,
  Trash2,
  Clock,
  Save,
  X,
  ArrowUp,
  Check
} from "lucide-react";
import useCategoryStore from "@/stores/categoryStore";
import useRiderStore from "@/stores/ridersStore";
import { RiderProps } from "@/types/types";

interface Props {
  raceUuid: string;
  categories: CategoryProps[];
}

interface StartSlot {
  id: string;
  time: string;
  categoryIds: number[];
}

interface Wave {
  id: number;
  number: number;
  startTime: string;
  startSlots: StartSlot[];
}

// Minimum gap in minutes between the last start of one wave and the first of the next
export const DEFAULT_WAVE_GAP_MINUTES = 30;

/** Normalize any HH:MM, H:MM, HH:MM:SS → "HH:MM" */
export function normalizeTime(t: string | null | undefined): string | null {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** "HH:MM" → minutes since midnight, or Infinity for TBD */
export function toMinutes(t: string | null | undefined): number {
  const norm = normalizeTime(t);
  if (!norm) return Infinity;
  const [h, m] = norm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Group categories into waves by TIME GAP.
 * A new wave starts when the gap between consecutive start times
 * exceeds waveGapMinutes (default 60 min).
 * Within a wave, categories are grouped by their exact start time.
 */
export function buildSchedule(
  categories: CategoryProps[],
  waveGapMinutes = DEFAULT_WAVE_GAP_MINUTES
) {
  // Sort by start time ascending; TBD goes last
  const sorted = [...categories].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  );

  // wave number (1-based) → startTime string → categories[]
  const waveMap = new Map<number, Map<string, CategoryProps[]>>();

  let waveNum = 0;
  let lastStartMinutes = -Infinity;

  for (const cat of sorted) {
    const catMinutes = toMinutes(cat.startTime);
    const startKey = normalizeTime(cat.startTime) ?? "TBD";

    // New wave when gap from the LAST start of current wave exceeds threshold
    if (catMinutes - lastStartMinutes > waveGapMinutes) {
      waveNum++;
    }
    // Always advance the last-seen start time (so intra-wave gaps accumulate correctly)
    if (catMinutes !== Infinity) lastStartMinutes = catMinutes;

    if (!waveMap.has(waveNum)) waveMap.set(waveNum, new Map());
    const startMap = waveMap.get(waveNum)!;
    if (!startMap.has(startKey)) startMap.set(startKey, []);
    startMap.get(startKey)!.push(cat);
  }

  return waveMap;
}

const STATUS_COLOR: Record<string, string> = {
  running: "#3edda4",
  upcoming: "#63a6fc",
  finished: "#aaa"
};

const OUT_STATUSES = new Set(["DNS", "DSQ", "DNF"]);

function sortRidersForStanding(riderList: RiderProps[]): RiderProps[] {
  return [...riderList].sort((a, b) => {
    const aOut = OUT_STATUSES.has(a.status ?? "");
    const bOut = OUT_STATUSES.has(b.status ?? "");
    if (aOut !== bOut) return aOut ? 1 : -1;
    if (b.lapsCounter !== a.lapsCounter) return b.lapsCounter - a.lapsCounter;
    if (a.status === "finished" && b.status !== "finished") return -1;
    if (b.status === "finished" && a.status !== "finished") return 1;
    return a.bibNumber - b.bibNumber;
  });
}

const Schedule: React.FC<Props> = ({ raceUuid, categories }) => {
  const navigate = useNavigate();
  const { updateCategory } = useCategoryStore();
  const { riders, getRiders, updateRider } = useRiderStore((s) => ({
    riders: s.riders,
    getRiders: s.getRiders,
    updateRider: s.updateRider
  }));
  const [editMode, setEditMode] = useState(false);
  const [waveGap, setWaveGap] = useState(DEFAULT_WAVE_GAP_MINUTES);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    getRiders(raceUuid);
  }, [raceUuid, getRiders]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [unassignedCategories, setUnassignedCategories] = useState<
    CategoryProps[]
  >([]);
  const [draggedCategory, setDraggedCategory] = useState<CategoryProps | null>(
    null
  );
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const schedule = buildSchedule(categories, waveGap);

  // Initialize waves from categories
  useEffect(() => {
    if (!editMode || waves.length > 0) return;

    const waveData: Wave[] = [];
    const assigned = new Set<number>();

    schedule.forEach((startMap, waveNum) => {
      const slots: StartSlot[] = [];
      startMap.forEach((cats, startTime) => {
        slots.push({
          id: `slot-${waveNum}-${startTime}`,
          time: startTime === "TBD" ? "08:00" : startTime,
          categoryIds: cats.map((c) => {
            assigned.add(c.id);
            return c.id;
          })
        });
      });

      waveData.push({
        id: waveNum,
        number: waveNum,
        startTime: slots[0]?.time || "08:00",
        startSlots: slots
      });
    });

    setWaves(waveData);
    setUnassignedCategories(categories.filter((c) => !assigned.has(c.id)));
  }, [editMode, categories]);

  const addWave = () => {
    const maxWave =
      waves.length > 0 ? Math.max(...waves.map((w) => w.number)) : 0;
    setWaves([
      ...waves,
      {
        id: Date.now(),
        number: maxWave + 1,
        startTime: "08:00",
        startSlots: []
      }
    ]);
  };

  const addStartSlot = (waveId: number) => {
    setWaves(
      waves.map((w) => {
        if (w.id === waveId) {
          // If this is the first start slot, use wave time
          if (w.startSlots.length === 0) {
            return {
              ...w,
              startSlots: [
                {
                  id: `slot-${waveId}-${Date.now()}`,
                  time: w.startTime,
                  categoryIds: []
                }
              ]
            };
          }

          // Otherwise, increment from last time
          const lastTime = w.startSlots[w.startSlots.length - 1].time;
          const [h, m] = lastTime.split(":").map(Number);
          const newTime = `${String(h).padStart(2, "0")}:${String((m + 1) % 60).padStart(2, "0")}`;

          return {
            ...w,
            startSlots: [
              ...w.startSlots,
              {
                id: `slot-${waveId}-${Date.now()}`,
                time: newTime,
                categoryIds: []
              }
            ]
          };
        }
        return w;
      })
    );
  };

  const updateWaveTime = (waveId: number, time: string) => {
    setWaves(
      waves.map((w) => {
        if (w.id === waveId) {
          // Update wave time and also update Start 1 if it exists
          const updatedSlots = w.startSlots.map((slot, index) => {
            if (index === 0) {
              return { ...slot, time }; // Start 1 always matches wave time
            }
            return slot;
          });
          return { ...w, startTime: time, startSlots: updatedSlots };
        }
        return w;
      })
    );
  };

  const updateSlotTime = (waveId: number, slotId: string, time: string) => {
    setWaves(
      waves.map((w) => {
        if (w.id === waveId) {
          return {
            ...w,
            startSlots: w.startSlots.map((s) =>
              s.id === slotId ? { ...s, time } : s
            )
          };
        }
        return w;
      })
    );
  };

  const deleteWave = (waveId: number) => {
    const wave = waves.find((w) => w.id === waveId);
    if (!wave) return;

    // Move categories back to unassigned
    const categoriesInWave = wave.startSlots
      .flatMap((s) =>
        s.categoryIds.map((id) => categories.find((c) => c.id === id)!)
      )
      .filter(Boolean);

    setUnassignedCategories([...unassignedCategories, ...categoriesInWave]);
    setWaves(waves.filter((w) => w.id !== waveId));
  };

  const deleteStartSlot = (waveId: number, slotId: string) => {
    const wave = waves.find((w) => w.id === waveId);
    const slot = wave?.startSlots.find((s) => s.id === slotId);
    if (!slot) return;

    // Move categories back to unassigned
    const categoriesInSlot = slot.categoryIds
      .map((id) => categories.find((c) => c.id === id)!)
      .filter(Boolean);

    setUnassignedCategories([...unassignedCategories, ...categoriesInSlot]);

    setWaves(
      waves.map((w) => {
        if (w.id === waveId) {
          return {
            ...w,
            startSlots: w.startSlots.filter((s) => s.id !== slotId)
          };
        }
        return w;
      })
    );
  };

  const moveWave = (waveId: number, direction: "up" | "down") => {
    const idx = waves.findIndex((w) => w.id === waveId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === waves.length - 1) return;

    const newWaves = [...waves];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    [newWaves[idx], newWaves[targetIdx]] = [newWaves[targetIdx], newWaves[idx]];
    setWaves(newWaves);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, category: CategoryProps) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedCategory(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnterSlot = (slotId: string) => {
    setDragOverSlot(slotId);
  };

  const handleDragLeaveSlot = () => {
    setDragOverSlot(null);
  };

  const handleDropOnSlot = (waveId: number, slotId: string) => {
    if (!draggedCategory) return;

    // Remove from unassigned
    setUnassignedCategories((prev) =>
      prev.filter((c) => c.id !== draggedCategory.id)
    );

    // Single state update: remove from all slots AND add to target slot
    setWaves((prevWaves) =>
      prevWaves.map((w) => ({
        ...w,
        startSlots: w.startSlots.map((s) => {
          // Remove from all slots first
          const filteredIds = s.categoryIds.filter(
            (id) => id !== draggedCategory.id
          );

          // If this is the target slot, add the category
          if (w.id === waveId && s.id === slotId) {
            return {
              ...s,
              categoryIds: [...filteredIds, draggedCategory.id]
            };
          }

          return {
            ...s,
            categoryIds: filteredIds
          };
        })
      }))
    );

    setDraggedCategory(null);
    setDragOverSlot(null);
  };

  const handleDropOnUnassigned = () => {
    if (!draggedCategory) return;

    // Remove from all slots
    setWaves((prevWaves) =>
      prevWaves.map((w) => ({
        ...w,
        startSlots: w.startSlots.map((s) => ({
          ...s,
          categoryIds: s.categoryIds.filter((id) => id !== draggedCategory.id)
        }))
      }))
    );

    // Add to unassigned if not already there
    setUnassignedCategories((prev) => {
      if (prev.find((c) => c.id === draggedCategory.id)) {
        return prev;
      }
      return [...prev, draggedCategory];
    });

    setDraggedCategory(null);
  };

  const saveSchedule = async () => {
    // Update all categories with new wave numbers and start times
    for (const wave of waves) {
      for (const slot of wave.startSlots) {
        for (const catId of slot.categoryIds) {
          const category = categories.find((c) => c.id === catId);
          if (category) {
            await updateCategory({
              ...category,
              heat: wave.number,
              startTime: slot.time
            });
          }
        }
      }
    }

    // Reset unassigned categories to wave 0
    for (const cat of unassignedCategories) {
      await updateCategory({
        ...cat,
        heat: 0,
        startTime: null
      });
    }

    setEditMode(false);
    setWaves([]);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setWaves([]);
    setUnassignedCategories([]);
  };

  if (!categories.length) {
    return (
      <div className={styles.empty}>
        No categories yet. Import riders to generate them.
      </div>
    );
  }

  if (editMode) {
    return (
      <div className={styles.container}>
        <div className={styles.editHeader}>
          <h3>Schedule Editor</h3>
          <div className={styles.editActions}>
            <Button variant="secondary" size="sm" onClick={cancelEdit}>
              <X size={14} />
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={saveSchedule}>
              <Save size={14} />
              Save Schedule
            </Button>
          </div>
        </div>

        <div className={styles.editorLayout}>
          {/* Unassigned Categories */}
          <div className={styles.unassignedPanel}>
            <div className={styles.panelHeader}>
              <span>Unassigned Categories</span>
              <span className={styles.badge}>
                {unassignedCategories.length}
              </span>
            </div>
            <div
              className={styles.unassignedList}
              onDragOver={handleDragOver}
              onDrop={handleDropOnUnassigned}
            >
              {unassignedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={styles.draggableCategory}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, cat)}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: "move" }}
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
              ))}
              {unassignedCategories.length === 0 && (
                <div className={styles.emptyMessage}>
                  All categories assigned
                </div>
              )}
            </div>
          </div>

          {/* Waves Editor */}
          <div className={styles.wavesPanel}>
            <div className={styles.panelHeader}>
              <span>Waves & Start Times</span>
              <Button
                variant="primary"
                size="sm"
                startIcon={<Plus size={12} />}
                onClick={addWave}
              >
                Add Wave
              </Button>
            </div>

            <div className={styles.wavesList}>
              {waves.map((wave, waveIdx) => (
                <div key={wave.id} className={styles.waveEditor}>
                  <div className={styles.waveEditorHeader}>
                    <div className={styles.waveControls}>
                      <div className={styles.dragButtons}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => moveWave(wave.id, "up")}
                          disabled={waveIdx === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() => moveWave(wave.id, "down")}
                          disabled={waveIdx === waves.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <span className={styles.waveLabel}>
                        Wave {wave.number}
                      </span>
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={wave.startTime}
                        onChange={(e) =>
                          updateWaveTime(wave.id, e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.waveActions}>
                      <Button
                        variant="primary"
                        size="sm"
                        startIcon={<Plus size={10} />}
                        onClick={() => addStartSlot(wave.id)}
                      >
                        Add Start
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        iconOnly
                        onClick={() => deleteWave(wave.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className={styles.startSlotsList}>
                    {wave.startSlots.map((slot, slotIdx) => (
                      <div key={slot.id} className={styles.startSlotEditor}>
                        <div className={styles.slotHeader}>
                          <Clock size={12} />
                          <span className={styles.slotLabel}>
                            Start {slotIdx + 1}
                          </span>
                          {slotIdx === 0 ? (
                            <span className={styles.timeDisplay}>
                              {slot.time} (Wave Time)
                            </span>
                          ) : (
                            <input
                              type="time"
                              className={styles.timeInput}
                              value={slot.time}
                              onChange={(e) =>
                                updateSlotTime(wave.id, slot.id, e.target.value)
                              }
                            />
                          )}
                          <Button
                            variant="icon"
                            size="sm"
                            iconOnly
                            onClick={() => deleteStartSlot(wave.id, slot.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                        <div
                          className={`${styles.dropZone} ${
                            dragOverSlot === slot.id
                              ? styles.dropZoneActive
                              : ""
                          }`}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnterSlot(slot.id)}
                          onDragLeave={handleDragLeaveSlot}
                          onDrop={() => handleDropOnSlot(wave.id, slot.id)}
                        >
                          {slot.categoryIds.length === 0 ? (
                            <div className={styles.dropPlaceholder}>
                              Drop categories here
                            </div>
                          ) : (
                            slot.categoryIds.map((catId) => {
                              const cat = categories.find(
                                (c) => c.id === catId
                              );
                              if (!cat) return null;
                              return (
                                <div
                                  key={catId}
                                  className={styles.draggableCategory}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, cat)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <GripVertical
                                    size={14}
                                    className={styles.dragHandle}
                                  />
                                  <div
                                    className={styles.colorDot}
                                    style={{ background: cat.color ?? "#ccc" }}
                                  />
                                  <span className={styles.catName}>
                                    {cat.name}
                                  </span>
                                  {cat.subCategory && (
                                    <span className={styles.subCategory}>
                                      {" "}
                                      · {cat.subCategory}
                                    </span>
                                  )}
                                  <span className={styles.riderCount}>
                                    {cat.riders ?? 0} riders
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}

                    {wave.startSlots.length === 0 && (
                      <div className={styles.emptySlots}>
                        No start times yet. Click "Add Start" to create one.
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {waves.length === 0 && (
                <div className={styles.emptyWaves}>
                  No waves yet. Click "Add Wave" to create your first wave.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className={styles.container}>
      <div className={styles.viewHeader}>
        <h3>Race Schedule</h3>
        <div className={styles.headerRight}>
          <label className={styles.gapLabel}>
            Wave gap
            <select
              className={styles.gapSelect}
              value={waveGap}
              onChange={(e) => setWaveGap(Number(e.target.value))}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hrs</option>
            </select>
          </label>
          <Button
            variant="primary"
            size="sm"
            startIcon={<Edit2 size={14} />}
            onClick={() => setEditMode(true)}
          >
            Edit Schedule
          </Button>
        </div>
      </div>

      {[...schedule.entries()].map(([waveNum, startMap]) => {
        const firstTime = [...startMap.keys()][0];
        const allWaveCats = [...startMap.values()].flat();
        const waveRiders = allWaveCats.flatMap((cat) =>
          riders.filter(
            (r) =>
              r.raceUuid === raceUuid &&
              r.category === cat.name &&
              r.subCategory === cat.subCategory
          )
        );
        const waveFinished = waveRiders.filter((r) => r.status === "finished").length;

        return (
          <div key={waveNum} className={styles.wave}>
            <div className={styles.waveHeader}>
              <span className={styles.waveLabel}>Wave {waveNum}</span>
              {firstTime !== "TBD" && (
                <span className={styles.waveTime}>{firstTime}</span>
              )}
              {waveRiders.length > 0 && (
                <span className={styles.waveStat}>
                  {waveFinished}/{waveRiders.length} ✓
                </span>
              )}
              <Button
                variant="success"
                size="sm"
                className={styles.liveBtn}
                onClick={() => navigate(`/race/${raceUuid}/heat/${waveNum}`)}
              >
                <Radio size={13} />
                Go Live
              </Button>
            </div>

            {[...startMap.entries()].map(([startTime, cats], si) => {
              const anyRunning = cats.some((c) => c.status === "running");
              const startRiders = cats.flatMap((cat) =>
                riders.filter(
                  (r) =>
                    r.raceUuid === raceUuid &&
                    r.category === cat.name &&
                    r.subCategory === cat.subCategory
                )
              );
              const startFinished = startRiders.filter((r) => r.status === "finished").length;

              return (
                <div key={startTime} className={styles.startGroup}>
                  <div className={styles.startHeader}>
                    <div className={styles.startInfo}>
                      <span>Start {si + 1}</span>
                      {si === 0 && firstTime !== "TBD" && (
                        <span className={styles.startTime}>
                          {" "}
                          · WAVE START: {firstTime}
                        </span>
                      )}
                      {si > 0 && startTime !== "TBD" && (
                        <span className={styles.startTime}> · {startTime}</span>
                      )}
                      {startRiders.length > 0 && (
                        <span className={styles.startStat}>
                          {startFinished}/{startRiders.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.startActions}>
                      {anyRunning && (
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() =>
                            navigate(`/race/${raceUuid}/heat/${waveNum}`)
                          }
                        >
                          <Radio size={14} />
                          Live View
                        </Button>
                      )}
                    </div>
                  </div>

                  {cats.map((cat) => {
                    const catRiders = sortRidersForStanding(
                      riders.filter(
                        (r) =>
                          r.raceUuid === raceUuid &&
                          r.category === cat.name &&
                          r.subCategory === cat.subCategory
                      )
                    );

                    return (
                      <div key={cat.id} className={styles.catBlock}>
                        <div className={styles.categoryRow}>
                          <div
                            className={styles.colorDot}
                            style={{ background: cat.color ?? "#ccc" }}
                          />
                          <div className={styles.catInfo}>
                            <span className={styles.catName}>{cat.name}</span>
                            {cat.subCategory && (
                              <span className={styles.catMeta}>
                                {" "}· {cat.subCategory}
                              </span>
                            )}
                            <span className={styles.catMeta}>
                              {catRiders.length} riders · {cat.laps ?? 0} laps
                            </span>
                          </div>
                          <span
                            className={styles.statusBadge}
                            style={{
                              color: STATUS_COLOR[cat.status ?? "upcoming"]
                            }}
                          >
                            {cat.status ?? "upcoming"}
                          </span>
                          <div className={styles.catActions}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className={styles.standingsBtn}
                              onClick={() =>
                                navigate(
                                  `/race/${raceUuid}/standing/${waveNum}?category=${encodeURIComponent(cat.name)}`
                                )
                              }
                            >
                              <Trophy size={12} />
                            </Button>
                          </div>
                        </div>

                        {catRiders.length > 0 && (
                          <div className={styles.standingsList}>
                            {catRiders.map((rider, idx) => {
                              const isOut = OUT_STATUSES.has(rider.status ?? "");
                              const isFinished = rider.status === "finished";
                              const isDNS = rider.status === "DNS";
                              const isDSQ = rider.status === "DSQ";
                              return (
                                <div
                                  key={rider.id}
                                  className={`${styles.standingRow} ${isOut ? styles.standingRowOut : ""}`}
                                >
                                  <span className={styles.standingPos}>
                                    {isOut ? "—" : idx + 1}
                                  </span>
                                  <span className={styles.standingBib}>
                                    #{rider.bibNumber}
                                  </span>
                                  <span className={styles.standingName}>
                                    {rider.lastName} {rider.firstName}
                                  </span>
                                  <span className={styles.standingLaps}>
                                    {rider.lapsCounter}/{rider.totalLaps}
                                  </span>
                                  <div className={styles.standingActions}>
                                    <button
                                      className={`${styles.vBtn} ${isFinished ? styles.vBtnOn : ""}`}
                                      title="Mark finished"
                                      onClick={() =>
                                        updateRider({
                                          ...rider,
                                          status: isFinished ? "running" : "finished",
                                          raceStatus: isFinished ? "running" : "finished"
                                        })
                                      }
                                    >
                                      <Check size={11} />
                                    </button>
                                    <button
                                      className={`${styles.statusBtn} ${isDNS ? styles.dnsOn : ""}`}
                                      onClick={() =>
                                        updateRider({
                                          ...rider,
                                          status: isDNS ? "standing" : "DNS",
                                          raceStatus: "upcoming"
                                        })
                                      }
                                    >
                                      DNS
                                    </button>
                                    <button
                                      className={`${styles.statusBtn} ${isDSQ ? styles.dsqOn : ""}`}
                                      onClick={() =>
                                        updateRider({
                                          ...rider,
                                          status: isDSQ ? "running" : "DSQ"
                                        })
                                      }
                                    >
                                      DSQ
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      {showScrollTop && (
        <button
          className={styles.scrollTopBtn}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
};

export default Schedule;
