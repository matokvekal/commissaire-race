import React, { useMemo } from "react";
import useRaceStore from "@/stores/racesStore";
import RaceMap from "@/components/map/RaceMap";

interface MapProps {
  raceUuid: string;
}

const Map: React.FC<MapProps> = ({ raceUuid }) => {
  const races = useRaceStore((s) => s.races);

  const race = useMemo(
    () => races.find((r) => r.uuid === raceUuid),
    [races, raceUuid]
  );

  if (!race) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading race...</div>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <RaceMap
        location={race.location || "Tel Aviv, Israel"}
        title={`${race.name} - Location`}
      />
    </div>
  );
};

export default Map;
