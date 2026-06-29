import styles from './voiceRadarIcon.module.css';

interface VoiceRadarIconProps {
  isActive: boolean;
  audioLevel: number;
  isListening?: boolean;
}

export function VoiceRadarIcon({ isActive, audioLevel, isListening }: VoiceRadarIconProps) {
  const waveIntensity = Math.min(100, audioLevel);

  return (
    <div className={`${styles.radarContainer} ${isActive ? styles.active : ''}`}>
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.radarSvg}
      >
        {/* Outer wave circle */}
        <circle
          cx="28"
          cy="28"
          r={isActive ? 24 - (waveIntensity * 0.1) : 20}
          fill="none"
          stroke={isActive ? '#10b981' : '#d0d0d0'}
          strokeWidth="1.5"
          opacity={isActive ? 0.3 : 0.2}
          style={{
            transition: 'r 0.1s ease, stroke 0.2s ease, opacity 0.2s ease',
          }}
        />

        {/* Middle wave circle */}
        <circle
          cx="28"
          cy="28"
          r={isActive ? 16 - (waveIntensity * 0.08) : 14}
          fill="none"
          stroke={isActive ? '#10b981' : '#d0d0d0'}
          strokeWidth="1.5"
          opacity={isActive ? 0.5 : 0.3}
          style={{
            transition: 'r 0.1s ease, stroke 0.2s ease, opacity 0.2s ease',
          }}
        />

        {/* Inner wave circle */}
        <circle
          cx="28"
          cy="28"
          r={isActive ? 10 - (waveIntensity * 0.05) : 8}
          fill="none"
          stroke={isActive ? '#059669' : '#a0a0a0'}
          strokeWidth="2"
          opacity={isActive ? 1 : 0.5}
          style={{
            transition: 'r 0.1s ease, stroke 0.2s ease, opacity 0.2s ease',
          }}
        />

        {/* Center dot (microphone) */}
        <circle
          cx="28"
          cy="28"
          r="3"
          fill={isActive ? '#10b981' : '#666'}
          style={{
            transition: 'fill 0.2s ease',
          }}
        />

        {/* Animated wave rays when listening */}
        {isListening && waveIntensity > 10 && (
          <>
            {/* Ray 1 - Top */}
            <line
              x1="28"
              y1="8"
              x2="28"
              y2="12"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 2 - Top Right */}
            <line
              x1="38.6"
              y1="17.4"
              x2="40.6"
              y2="15.4"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 3 - Right */}
            <line
              x1="48"
              y1="28"
              x2="44"
              y2="28"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 4 - Bottom Right */}
            <line
              x1="38.6"
              y1="38.6"
              x2="40.6"
              y2="40.6"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 5 - Bottom */}
            <line
              x1="28"
              y1="48"
              x2="28"
              y2="44"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 6 - Bottom Left */}
            <line
              x1="17.4"
              y1="38.6"
              x2="15.4"
              y2="40.6"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 7 - Left */}
            <line
              x1="8"
              y1="28"
              x2="12"
              y2="28"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
            {/* Ray 8 - Top Left */}
            <line
              x1="17.4"
              y1="17.4"
              x2="15.4"
              y2="15.4"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={Math.min(1, waveIntensity / 100)}
              className={styles.ray}
            />
          </>
        )}
      </svg>

      {/* Glow effect when listening */}
      {isActive && (
        <div
          className={styles.glow}
          style={{
            opacity: Math.min(0.6, waveIntensity / 100),
          }}
        />
      )}
    </div>
  );
}
