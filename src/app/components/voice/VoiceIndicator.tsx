import styles from './voiceIndicator.module.css';

interface VoiceIndicatorProps {
  /** True while SpeechRecognition is actively listening. */
  isListening: boolean;
  /** Latest transcript from recognition (interim or final). */
  lastTranscript?: string;
}

/**
 * Status pill for voice input.
 *
 * IMPORTANT: this component intentionally does NOT open its own microphone.
 * It previously grabbed a second `getUserMedia` stream just to animate a level
 * meter, which on phones (installed PWAs) stole the microphone away from
 * `SpeechRecognition` — so the meter moved but no words were ever recognized.
 * The indicator now reflects the recognition state directly via props, so only
 * one consumer (SpeechRecognition) ever holds the mic.
 */
export function VoiceIndicator({ isListening, lastTranscript }: VoiceIndicatorProps) {
  const transcript = lastTranscript?.trim();

  return (
    <div className={`${styles.voiceIndicator} ${isListening ? styles.active : ''}`}>
      <div className={`${styles.indicatorDot} ${isListening ? styles.listening : ''}`} />
      <span className={styles.indicatorText} dir="auto">
        {transcript
          ? `🎤 ${transcript}`
          : isListening
            ? 'Listening…'
            : 'Connecting…'}
      </span>
    </div>
  );
}
