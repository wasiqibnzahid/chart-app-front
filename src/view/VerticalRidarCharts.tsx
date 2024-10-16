import { SimpleGrid } from "@chakra-ui/react";
import RadarChart from "../components/VerticalRadarChart";
import { ExpandWrapper } from "../components/expand-wrapper";

const VerticalRidarCharts = (data) => {
  // Data for the two charts
  const tvAztecaLabels = [
    "UNO",
    "Deportes",
    "Noticias",
    "ADN40",
    "A+",
    "7",
  ];
  const competitorLabels = [
    "Heraldo",
    "NY Times",
    "Televisa",
    "Milenio",
    "Infobae",
    "Universal",
    "AS",
    "Terra",
  ];

  
  // Sample Data (Week/Month data for Video, Nota, General)
  const tvAztecaDataSets = {
    Video: {
      Week: [],
      Month: [],
    },
    Nota: {
      Week: [],
      Month: [],
    },
  };

  const competitorDataSets = {
    Video: {
      Week: [],
      Month: [],
    },
    Nota: {
      Week: [],
      Month: [],
    },
  };

  // Push data to videos 
  data.data.comparison.videos.map((name) => {
    // Filter the data based on a condition (example: only include names that are in the tvAztecaLabels)
    if (tvAztecaLabels.includes(name.name)) {
      // Get the last four data points
      const lastFourData = name.data.slice(-4); // Slice to get the last four entries
  
      const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
      const average = sum / lastFourData.length; // Calculate the average
  
      // Push the average to companyDataSets.Video.Month
      tvAztecaDataSets.Video.Month.push(average);
      // Push the last value of y to companyDataSets.Video.Week
      tvAztecaDataSets.Video.Week.push(name.data[name.data.length - 1].y);
    }
  });


  // Push data to Nota 
  data.data.comparison.notes.map((name) => {
    // Filter the data based on a condition (example: only include names that are in the tvAztecaLabels)
    if (tvAztecaLabels.includes(name.name)) {
      // Get the last four data points
      const lastFourData = name.data.slice(-4); // Slice to get the last four entries
  
      const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
      const average = sum / lastFourData.length; // Calculate the average
  
      // Push the average to companyDataSets.Video.Month
      tvAztecaDataSets.Nota.Month.push(average);
      // Push the last value of y to companyDataSets.Video.Week
      tvAztecaDataSets.Nota.Week.push(name.data[name.data.length - 1].y);
    }
  });
  
  // competitor

    // Push data to videos 
    data.data.comparison.videos.map((name) => {
      // Filter the data based on a condition (example: only include names that are in the tvAztecaLabels)
      if (competitorLabels.includes(name.name)) {
        // Get the last four data points
        const lastFourData = name.data.slice(-4); // Slice to get the last four entries
    
        const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
        const average = sum / lastFourData.length; // Calculate the average
    
        // Push the average to companyDataSets.Video.Month
        competitorDataSets.Video.Month.push(average);
        // Push the last value of y to companyDataSets.Video.Week
        competitorDataSets.Video.Week.push(name.data[name.data.length - 1].y);
      }
    });
  
  
    // Push data to Nota 
    data.data.comparison.notes.map((name) => {
      // Filter the data based on a condition (example: only include names that are in the tvAztecaLabels)
      if (competitorLabels.includes(name.name)) {
        // Get the last four data points
        const lastFourData = name.data.slice(-4); // Slice to get the last four entries
    
        const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
        const average = sum / lastFourData.length; // Calculate the average
    
        // Push the average to companyDataSets.Video.Month
        competitorDataSets.Nota.Month.push(average);
        // Push the last value of y to companyDataSets.Video.Week
        competitorDataSets.Nota.Week.push(name.data[name.data.length - 1].y);
      }
    });

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
