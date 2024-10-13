import { ExpandWrapper } from "../components/expand-wrapper";
import RadarChart from "../components/RadarChart";

function Heatmap(data:any) {
  // Data for the local companies
  
  const companyLabels:string[] = [];

  
  data.data.comparison.videos.map((name:{name:string,data:[]}) => companyLabels.push(name.name))


  // Sample Data (Week/Month data for Video, Nota, and General TV Azteca)
  const companyDataSets = {
    Video: {
      Week: [],
      Month: [],
    },
    Nota: {
      Week: [],
      Month: [],
    },
    General: {
      Week: [], // Example: dynamically updated general percentage for the week
      Month: [], // Example: dynamically updated general percentage for the month
    },
  };


  
  // Push data to videos 
  data.data.comparison.videos.map((name: { name: string, data: [{ x: string, y: number }] }) => {
    // Get the last four data points
    const lastFourData = name.data.slice(-4); // Slice to get the last four entries
    
    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average
  
    // Push the average to companyDataSets.Video.Week
    companyDataSets.Video.Month.push(average);
    companyDataSets.Video.Week.push(name.data[name.data.length - 1].y)
  });

  // Push data to Nota 
  data.data.comparison.notes.map((name: { name: string, data: [{ x: string, y: number }] }) => {
    // Get the last four data points
    const lastFourData = name.data.slice(-4); // Slice to get the last four entries
    const sum = lastFourData.reduce((acc, point) => acc + point.y, 0); // Sum the y values
    const average = sum / lastFourData.length; // Calculate the average
  
    // Push the average to companyDataSets.Nota.Week
    companyDataSets.Nota.Month.push(average);
    companyDataSets.Nota.Week.push(name.data[name.data.length - 1].y)
  });

  // Push General Tv Azteca 
  const foundObjectOfTvAzteca = data.data.weekly.data.find(item => item.name === "TV Azteca Avg");
  
  companyDataSets.General.Week.push(foundObjectOfTvAzteca?.data[foundObjectOfTvAzteca.data.length - 1].y)
  
  const lastFourDataTvAzteca = foundObjectOfTvAzteca?.data?.slice(-4); // Slice to get the last four entries
  const sumTvAzteca = lastFourDataTvAzteca?.reduce((acc, point) => acc + point.y, 0); // Sum the y values
  const averageTvAzteca = sumTvAzteca / lastFourDataTvAzteca?.length; // Calculate the average
    
  companyDataSets.General.Month.push(averageTvAzteca)

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
