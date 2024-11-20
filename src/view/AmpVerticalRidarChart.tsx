import { SimpleGrid } from "@chakra-ui/react";
import RadarChart from "../components/VerticalRadarChart";
import { ExpandWrapper } from "../components/expand-wrapper";

const AmpVerticalRidarCharts = (data) => {
  // Data for the two charts
  const ampLabels = [
    'Veracruz', 'Quintanaroo',
    'Sinaloa', 'BC',
    'CJ', 'Aguascalientes',
    'Queretaro', 'Chiapas',
    'Puebla', 'Yucatan',
    'Chihuahua', 'Morelos',
    'Jalisco', 'Guerrero',
    'Bajio', 'Laguna'
]

  
  // Sample Data (Week/Month data for Video, Nota, General)
  const ampDataSets = {
    Video: {
      Week: [],
      Month: [],
    },
    Nota: {
      Week: [],
      Month: [],
    },
  };

  // Assuming ampLabels is an array of labels you want to match against
  ampLabels.forEach((label) => {
  // Find the corresponding data entry based on the label
  const ampVideoData = data.data.comparison.videos.find(video => video.name === label);
  const ampNoteData = data.data.comparison.notes.find(note => note.name === label);
  
  if (ampVideoData) {
    // Get the last four data points
    const lastFourData = ampVideoData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    ampDataSets.Video.Month.push(average);
    
    // Push the last value of y to companyDataSets.Video.Week
    ampDataSets.Video.Week.push(ampVideoData.data[ampVideoData.data.length - 1].y);
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    ampDataSets.Video.Month.push(0); // or another default value
    ampDataSets.Video.Week.push(0); // or another default value
  }
  if (ampNoteData) {
    // Get the last four data points
    const lastFourData = ampNoteData.data.slice(-4); // Slice to get the last four entries

    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average

    // Push the average to companyDataSets.Video.Month
    ampDataSets.Nota.Month.push(average);
    
    // Push the last value of y to companyDataSets.Video.Week
    ampDataSets.Nota.Week.push(ampNoteData.data[ampNoteData.data.length - 1].y);
  } else {
    // If there's no matching data, you might want to handle it (e.g., push a default value)
    ampDataSets.Nota.Month.push(0); // or another default value
    ampDataSets.Nota.Week.push(0); // or another default value
  }
});


  return (
    <SimpleGrid columns={[1]} spacing={5}>
      <section className="box">
        <ExpandWrapper>
          <RadarChart
            title="AMP"
            labels={ampLabels}
            dataSets={{
              Video: ampDataSets.Video,
              Nota: ampDataSets.Nota,
            }}
          />
        </ExpandWrapper>
      </section>
    </SimpleGrid>
  );
};

export default AmpVerticalRidarCharts;
