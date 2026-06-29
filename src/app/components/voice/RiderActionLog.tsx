import { useState, useEffect } from 'react';
import styles from './riderActionLog.module.css';
import { RiderProps } from '@/types/types';

interface RiderAction {
  id: string;
  rider: RiderProps;
  timestamp: number;
  source: 'click' | 'voice';
  categoryColor: string;
}

interface RiderActionLogProps {
  actions: RiderAction[];
  isOpen: boolean;
  onToggle: () => void;
  onCancel?: (actionId: string, riderName: string) => void;
}

const CANCEL_ACTIVE_MS = 20000; // 20 seconds - show cancel button
const CANCEL_DEADLINE_MS = 30000; // 30 seconds - no more cancelling

export function RiderActionLog({ actions, isOpen, onToggle, onCancel }: RiderActionLogProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<'arrival' | 'bib'>('arrival');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const updated = { ...prev };
        actions.forEach((action) => {
          const elapsed = Date.now() - action.timestamp;
          updated[action.id] = Math.max(0, CANCEL_ACTIVE_MS - elapsed);
        });
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [actions]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const canCancel = (action: RiderAction) => {
    const elapsed = Date.now() - action.timestamp;
    return elapsed < CANCEL_DEADLINE_MS;
  };

  const showCancelButton = (action: RiderAction) => {
    const elapsed = Date.now() - action.timestamp;
    return elapsed < CANCEL_ACTIVE_MS;
  };

  const handleCancel = (action: RiderAction) => {
    setConfirmingId(action.id);
  };

  const confirmCancel = (action: RiderAction) => {
    setConfirmingId(null);
    onCancel?.(action.id, `#${action.rider.bibNumber} ${action.rider.firstName} ${action.rider.lastName}`);
  };

  const riderName = (rider: RiderProps) =>
    `#${rider.bibNumber} ${rider.firstName} ${rider.lastName}`;

  const getOrganizedActions = () => {
    if (sortBy === 'arrival') {
      return actions;
    }

    // Group by bib number, then sort within each group by lap descending
    const grouped = new Map<number, RiderAction[]>();
    [...actions].forEach((action) => {
      const bib = action.rider.bibNumber;
      if (!grouped.has(bib)) grouped.set(bib, []);
      grouped.get(bib)!.push(action);
    });

    // Sort each group by lapsCounter descending (newest/highest lap first)
    grouped.forEach((actions) => {
      actions.sort((a, b) => (b.rider.lapsCounter || 0) - (a.rider.lapsCounter || 0));
    });

    // Sort groups by bib ascending
    const sorted = Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .flatMap(([_, acts]) => acts);

    return sorted;
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.open : ''}`}
        onClick={onToggle}
        title="View rider action history"
      >
        <span className={styles.icon}>⏱️</span>
        {actions.length > 0 && <span className={styles.badge}>{actions.length}</span>}
      </button>

      {/* Log panel */}
      {isOpen && (
        <div className={styles.overlay} onClick={onToggle}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Rider Log</h3>
              <div className={styles.sortControls}>
                <button
                  className={`${styles.sortBtn} ${sortBy === 'arrival' ? styles.active : ''}`}
                  onClick={() => setSortBy('arrival')}
                >
                  Arrival
                </button>
                <button
                  className={`${styles.sortBtn} ${sortBy === 'bib' ? styles.active : ''}`}
                  onClick={() => setSortBy('bib')}
                >
                  Bib
                </button>
              </div>
              <button className={styles.closeBtn} onClick={onToggle}>✕</button>
            </div>

            {actions.length === 0 ? (
              <div className={styles.empty}>No riders recorded yet</div>
            ) : (
              <div className={styles.list}>
                {getOrganizedActions().map((action, idx) => {
                  const isConfirming = confirmingId === action.id;
                  const showCancel = showCancelButton(action);
                  const canCancelAction = canCancel(action);
                  const remaining = timeRemaining[action.id] ?? CANCEL_ACTIVE_MS;

                  return (
                    <div key={`${action.id}-${idx}`} className={styles.entry}>
                      <div
                        className={styles.colorDot}
                        style={{ backgroundColor: action.categoryColor }}
                        title={action.rider.category}
                      />
                      <div className={styles.info}>
                        <div className={styles.riderName}>
                          {riderName(action.rider)}
                        </div>
                        {action.rider.team && (
                          <div className={styles.club}>{action.rider.team}</div>
                        )}
                        <div className={styles.meta}>
                          <span className={styles.time}>{formatTime(action.timestamp)}</span>
                          <span className={`${styles.source} ${styles[action.source]}`}>
                            {action.source === 'voice' ? '🎤' : '👆'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.laps}>
                        {action.rider.lapsCounter}/{action.rider.totalLaps}
                      </div>

                      {/* Cancel button */}
                      {showCancel && !isConfirming && (
                        <button
                          className={styles.cancelBtn}
                          onClick={() => handleCancel(action)}
                          title="Cancel this entry"
                        >
                          <span className={styles.cancelTime}>
                            {Math.ceil(remaining / 1000)}s
                          </span>
                          ✕
                        </button>
                      )}

                      {/* Confirmation modal */}
                      {isConfirming && (
                        <div className={styles.confirmOverlay}>
                          <div className={styles.confirmModal}>
                            <div className={styles.confirmText}>
                              Cancel {riderName(action.rider)}?
                            </div>
                            <div className={styles.confirmButtons}>
                              <button
                                className={styles.confirmYes}
                                onClick={() => confirmCancel(action)}
                              >
                                Yes, Cancel
                              </button>
                              <button
                                className={styles.confirmNo}
                                onClick={() => setConfirmingId(null)}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
