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
      Year: [],
      AllTime: [],
    },
    Nota: {
      Week: [],
      Month: [],
      Year: [],
      AllTime: [],
    },
  };

  const competitorDataSets = {
    Video: {
      Week: [],
      Month: [],
      Year: [],
      AllTime: [],
    },
    Nota: {
      Week: [],
      Month: [],
      Year: [],
      AllTime: [],
    },
  };



  // Assuming tvAztecaLabels is an array of labels you want to match against
  tvAztecaLabels.forEach((label) => {
  // Find the corresponding data entry based on the label
  const tvAztecaVideoData = data.data.comparison.videos.find(video => video.name === label);
  const tvAztecaNoteData = data.data.comparison.notes.find(note => note.name === label);
  
  if (tvAztecaVideoData) {
    // Get the last four data points
    const lastFourData = tvAztecaVideoData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    tvAztecaDataSets.Video.Month.push(average);

    // Calculate Year data
    const lastYearData = tvAztecaVideoData.data.slice(-52);
    const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
    const yearAverage = yearSum / lastYearData.length; 

    tvAztecaDataSets.Video.Year.push(yearAverage);

    // Calculate All Time data
    const allTimeData = tvAztecaVideoData.data;
    const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
    const allTimeAverage = allTimeSum / allTimeData.length; 

    tvAztecaDataSets.Video.AllTime.push(allTimeAverage);
    
    // Push the last value of y to companyDataSets.Video.Week
    tvAztecaDataSets.Video.Week.push(tvAztecaVideoData.data[tvAztecaVideoData.data.length - 1].y);
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    tvAztecaDataSets.Video.Month.push(0); // or another default value
    tvAztecaDataSets.Video.Week.push(0); // or another default value
    tvAztecaDataSets.Video.Year.push(0); // or another default value
    tvAztecaDataSets.Video.AllTime.push(0); // or another default value
  }
  if (tvAztecaNoteData) {
    // Get the last four data points
    const lastFourData = tvAztecaNoteData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    tvAztecaDataSets.Nota.Month.push(average);
    
    // Push the last value of y to companyDataSets.Video.Week
    tvAztecaDataSets.Nota.Week.push(tvAztecaNoteData.data[tvAztecaNoteData.data.length - 1].y);

    // Calculate Year data
    const lastYearData = tvAztecaNoteData.data.slice(-52);
    const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
    const yearAverage = yearSum / lastYearData.length; 

    tvAztecaDataSets.Nota.Year.push(yearAverage);

    // Calculate All Time data
    const allTimeData = tvAztecaNoteData.data;
    const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
    const allTimeAverage = allTimeSum / allTimeData.length; 

    tvAztecaDataSets.Nota.AllTime.push(allTimeAverage);
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    tvAztecaDataSets.Nota.Month.push(0); // or another default value
    tvAztecaDataSets.Nota.Week.push(0); // or another default value
    tvAztecaDataSets.Nota.Year.push(0); // or another default value
    tvAztecaDataSets.Nota.AllTime.push(0); // or another default value
  }
});



  
  // competitor

// Assuming competitorLabels is an array of labels you want to match against
competitorLabels.forEach((label) => {
  // Find the corresponding data entry based on the label
  const competitorVideoData = data.data.comparison.videos.find(video => video.name === label);
  const competitorNoteData = data.data.comparison.notes.find(note => note.name === label);
  
  if (competitorVideoData) {
    // Get the last four data points
    const lastFourData = competitorVideoData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    competitorDataSets.Video.Month.push(average);
    
    // Push the last value of y to companyDataSets.Video.Week
    competitorDataSets.Video.Week.push(competitorVideoData.data[competitorVideoData.data.length - 1].y);

    // Calculate Year data
    const lastYearData = competitorVideoData.data.slice(-52);
    const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
    const yearAverage = yearSum / lastYearData.length; 

    competitorDataSets.Video.Year.push(yearAverage);

    // Calculate All Time data
    const allTimeData = competitorVideoData.data;
    const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
    const allTimeAverage = allTimeSum / allTimeData.length; 

    competitorDataSets.Video.AllTime.push(allTimeAverage);
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    competitorDataSets.Video.Month.push(0); // or another default value
    competitorDataSets.Video.Week.push(0); // or another default value
    competitorDataSets.Video.Year.push(0); // or another default value
    competitorDataSets.Video.AllTime.push(0); // or another default value
  }
  if (competitorNoteData) {
    // Get the last four data points
    const lastFourData = competitorNoteData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    competitorDataSets.Nota.Month.push(average);
    
    // Push the last value of y to companyDataSets.Video.Week
    competitorDataSets.Nota.Week.push(competitorNoteData.data[competitorNoteData.data.length - 1].y);

    // Calculate Year data
    const lastYearData = competitorNoteData.data.slice(-52);
    const yearSum = lastYearData.reduce((acc, point) => acc + point.y, 0); 
    const yearAverage = yearSum / lastYearData.length; 

    competitorDataSets.Nota.Year.push(yearAverage);

    // Calculate All Time data
    const allTimeData = competitorNoteData.data;
    const allTimeSum = allTimeData.reduce((acc, point) => acc + point.y, 0); 
    const allTimeAverage = allTimeSum / allTimeData.length; 

    competitorDataSets.Nota.AllTime.push(allTimeAverage);
    
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    competitorDataSets.Nota.Month.push(0); // or another default value
    competitorDataSets.Nota.Week.push(0); // or another default value
    competitorDataSets.Nota.Year.push(0); // or another default value
    competitorDataSets.Nota.AllTime.push(0); // or another default value
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
