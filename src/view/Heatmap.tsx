import { ExpandWrapper } from "../components/expand-wrapper";
import RadarChart from "../components/RadarChart";

function Heatmap() {
  // Data for the local companies
  const companyLabels = [
    "Chihuahua",
    "CJ",
    "Morelos",
    "Jalisco",
    "Bajío",
    "Quintana Roo",
    "Queretaro",
    "Guerrero",
    "Veracruz",
    "Puebla",
    "Chiapas",
    "Aguascalientes",
    "Sinaloa",
    "Yúcatan",
  ];

  // Sample Data (Week/Month data for Video, Nota, and General TV Azteca)
  const companyDataSets = {
    Video: {
      Week: [70, 60, 90, 80, 50, 75, 62, 77, 68, 72, 58, 66, 81, 79],
      Month: [80, 70, 85, 90, 65, 80, 72, 87, 78, 82, 68, 76, 91, 89],
    },
    Nota: {
      Week: [60, 50, 75, 65, 40, 70, 52, 67, 58, 62, 48, 56, 71, 69],
      Month: [70, 60, 80, 85, 55, 75, 62, 77, 68, 72, 58, 66, 81, 79],
    },
    General: {
      Week: [90], // Example: dynamically updated general percentage for the week
      Month: [82], // Example: dynamically updated general percentage for the month
    },
  };

  return (
    <ExpandWrapper>
      <RadarChart
        title="Local Companies Performance"
        labels={companyLabels}
        dataSets={{
          Video: companyDataSets.Video,
          Nota: companyDataSets.Nota,
          General: companyDataSets.General,
        }}
      />
    </ExpandWrapper>
  );
}

export default Heatmap;
