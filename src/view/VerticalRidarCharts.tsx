import { SimpleGrid } from "@chakra-ui/react";
import RadarChart from "../components/VerticalRadarChart";
import { ExpandWrapper } from "../components/expand-wrapper";

const VerticalRidarCharts = () => {
  // Data for the two charts
  const tvAztecaLabels = [
    "UNO",
    "Deportes",
    "Noticias",
    "ADN40",
    "a+",
    "Azteca 7",
  ];
  const competitorLabels = [
    "El Heraldo",
    "NY Times",
    "Televisa",
    "Milenio",
    "Infobae",
    "El Universal",
    "AS",
    "Terra",
  ];

  // Sample Data (Week/Month data for Video, Nota, General)
  const tvAztecaDataSets = {
    Video: {
      Week: [70, 60, 90, 80, 50, 75],
      Month: [80, 70, 85, 90, 65, 80],
    },
    Nota: {
      Week: [60, 50, 75, 65, 40, 70],
      Month: [70, 60, 80, 85, 55, 75],
    },
  };

  const competitorDataSets = {
    Video: {
      Week: [65, 70, 80, 75, 85, 60, 70, 60],
      Month: [75, 80, 85, 70, 90, 75, 60, 80],
    },
    Nota: {
      Week: [55, 60, 70, 65, 75, 55, 50, 77],
      Month: [65, 70, 80, 65, 85, 65, 70, 66],
    },
  };

  return (
    <SimpleGrid columns={[1, 2]} spacing={5}>
      <section className="box">
        <ExpandWrapper>
          <RadarChart
            title="TVA"
            labels={tvAztecaLabels}
            dataSets={{
              Video: tvAztecaDataSets.Video,
              Nota: tvAztecaDataSets.Nota,
            }}
          />
        </ExpandWrapper>
      </section>
      <section className="box">
        <ExpandWrapper>
          <RadarChart
            title="Comp."
            labels={competitorLabels}
            dataSets={{
              Video: competitorDataSets.Video,
              Nota: competitorDataSets.Nota,
            }}
          />
        </ExpandWrapper>
      </section>
    </SimpleGrid>
  );
};

export default VerticalRidarCharts;
