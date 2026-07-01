import { useNavigate } from "react-router-dom";
import HeaderLogo from "@/components/headerLogo/HeaderLogo";
import Footer from "@/components/Footer/Footer";
import styles from "./landing.module.css";

const heroImage = `${import.meta.env.BASE_URL}images/landing.png`;

const FEATURES = [
  {
    title: "Live Lap Recording",
    text: "Tap-to-record splits for every rider, with instant DNF / DSQ / DNS handling and one-tap revert.",
  },
  {
    title: "Wave & Heat Management",
    text: "Group riders into waves, run staggered starts, and track each category's own start clock.",
  },
  {
    title: "Real-Time Standings",
    text: "Positions recalculate live as laps come in — built for the chaos of the finish line.",
  },
  {
    title: "CSV Import & Club Dictionary",
    text: "Bring in rider lists in seconds, with smart column mapping and Hebrew/English club matching.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/main");
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <HeaderLogo />
      </div>

      <div className={styles.hero}>
        <img
          className={styles.heroImage}
          src={heroImage}
          alt="Commissaire — MTB race management app showing live dashboard, course map and timing screens"
        />
        <div className={styles.badge}>MTB &amp; GRAVEL RACE OFFICIATING</div>
        <p className={styles.subtitle}>
          The race-day toolkit for commissaires running mountain bike and
          gravel events — check-in, timing, and live standings, built for
          dust, mud, and no signal.
        </p>
        <button className={styles.cta} onClick={handleEnter}>
          Enter the App
        </button>
      </div>

      <div className={styles.features}>
        {FEATURES.map((feature) => (
          <div className={styles.card} key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
