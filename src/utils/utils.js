const data = {
  Date: [
    "17-Jun4",
    "24-Jun4",
    "01-Jul4",
    "08-Jul4",
    "15-Jul4",
    "22-Jul4",
    "29-Jul4",
    "05-Aug4",
    "12-Aug4",
    "19-Aug4",
    "26-Aug4",
    "02-Sep4",
    "09-Sep4",
    "16-Sep4",
    "23-Sep4",
    "30-Sep4",
    "07-Oct4",
    "14-Oct4",
    "21-Oct4",
    "28-Oct4",
    "04-Nov4",
    "11-Nov4",
    "18-Nov4",
    "25-Nov4",
    "02-Dec4",
    "09-Dec4",
    "16-Dec4",
    "23-Dec4",
    "31-Dec4",
  ],
  "Azteca UNO (Note)": [
    78, 74, 77, 78, 61, 64, 70, 72, 71, 69, 68, 72, 73, 75, 74, 75, 74, 72, 73,
    70, 71, 69, 70, 67, 73, 71, 70, 68, 72,
  ],
  "Azteca UNO (Video)": [
    63, 81, 79, 76, 67, 66, 74, 73, 75, 74, 73, 71, 70, 72, 74, 72, 70, 71, 69,
    72, 73, 71, 72, 70, 74, 73, 72, 71, 73,
  ],
  "Azteca 7 (Note)": [
    63, 64, 64, 63, 67, 68, 72, 71, 70, 69, 67, 66, 65, 67, 70, 69, 68, 67, 66,
    69, 70, 68, 69, 67, 68, 67, 66, 65, 67,
  ],
  "Azteca 7 (Video)": [
    59, 80, 65, 65, 72, 73, 74, 73, 72, 71, 70, 69, 68, 70, 71, 70, 69, 68, 67,
    70, 71, 69, 70, 68, 71, 70, 69, 68, 70,
  ],
  "Deportes (Note)": [
    64, 61, 60, 64, 66, 65, 73, 72, 71, 70, 69, 67, 66, 68, 70, 69, 68, 67, 66,
    68, 70, 68, 69, 67, 69, 68, 67, 66, 68,
  ],
  "Deportes (Video)": [
    53, 59, 64, 60, 58, 60, 74, 73, 72, 71, 70, 69, 67, 68, 70, 69, 68, 67, 66,
    69, 70, 68, 69, 67, 70, 69, 68, 67, 69,
  ],
  "ADN40 (Note)": [
    64, 83, 59, 68, 66, 67, 71, 70, 69, 68, 67, 66, 65, 67, 69, 68, 67, 66, 65,
    67, 69, 67, 68, 66, 67, 66, 65, 64, 66,
  ],
  "ADN40 (Video)": [
    53, 54, 67, 70, 66, 68, 74, 73, 72, 71, 70, 69, 68, 67, 69, 68, 67, 66, 65,
    68, 69, 67, 68, 66, 68, 67, 66, 65, 67,
  ],
  "A+ (Note)": [
    76, 75, 80, 78, 72, 74, 73, 72, 71, 70, 69, 67, 66, 68, 71, 70, 69, 68, 67,
    70, 71, 69, 70, 68, 70, 69, 68, 67, 69,
  ],
  "A+ (Video)": [
    64, 83, 85, 84, 75, 77, 74, 73, 72, 71, 70, 69, 67, 68, 70, 69, 68, 67, 66,
    69, 70, 68, 69, 67, 69, 68, 67, 66, 68,
  ],
  "Noticias (Note)": [
    71, 63, 64, 64, 63, 65, 72, 71, 70, 69, 68, 67, 66, 67, 70, 69, 68, 67, 66,
    69, 70, 68, 69, 67, 68, 67, 66, 65, 67,
  ],
  "Noticias (Video)": [
    63, 75, 77, 78, 83, 82, 74, 73, 72, 71, 70, 69, 68, 69, 71, 70, 69, 68, 67,
    70, 71, 69, 70, 68, 71, 70, 69, 68, 70,
  ],
  "Milenio (Note)": [
    81, 83, 64, 84, 82, 80, 50, 49, 48, 47, 46, 45, 44, 45, 47, 46, 45, 44, 43,
    45, 47, 45, 46, 44, 46, 45, 44, 43, 45,
  ],
  "Milenio (Video)": [
    65, 54, 80, 46, 49, 47, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "El Heraldo (Note)": [
    90, 83, 87, 80, 80, 82, 53, 52, 51, 50, 49, 48, 47, 48, 50, 49, 48, 47, 46,
    48, 50, 48, 49, 47, 49, 48, 47, 46, 48,
  ],
  "El Heraldo (Video)": [
    89, 81, 34, 81, 81, 83, 55, 54, 53, 52, 51, 50, 49, 50, 52, 51, 50, 49, 48,
    50, 52, 50, 51, 49, 51, 50, 49, 48, 50,
  ],
  "El Universal (Note)": [
    55, 34, 45, 56, 34, 36, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "El Universal (Video)": [
    45, 35, 50, 30, 30, 32, 54, 53, 52, 51, 50, 49, 48, 49, 51, 50, 49, 48, 47,
    49, 51, 49, 50, 48, 50, 49, 48, 47, 49,
  ],
  "Televisa (Note)": [
    71, 50, 84, 56, 53, 55, 50, 49, 48, 47, 46, 45, 44, 45, 47, 46, 45, 44, 43,
    45, 47, 45, 46, 44, 46, 45, 44, 43, 45,
  ],
  "Televisa (Video)": [
    38, 54, 82, 30, 30, 32, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "Terra (Note)": [
    87, 84, 71, 53, 45, 47, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "Terra (Video)": [
    89, 74, 61, 26, 25, 27, 54, 53, 52, 51, 50, 49, 48, 49, 51, 50, 49, 48, 47,
    49, 51, 49, 50, 48, 50, 49, 48, 47, 49,
  ],
  "AS (Note)": [
    70, 82, 49, 35, 45, 47, 50, 49, 48, 47, 46, 45, 44, 45, 47, 46, 45, 44, 43,
    45, 47, 45, 46, 44, 46, 45, 44, 43, 45,
  ],
  "AS (Video)": [
    72, 31, 51, 26, 55, 57, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "Infobae (Note)": [
    60, 45, 44, 35, 25, 27, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
  "Infobae (Video)": [
    45, 33, 30, 53, 45, 47, 54, 53, 52, 51, 50, 49, 48, 49, 51, 50, 49, 48, 47,
    49, 51, 49, 50, 48, 50, 49, 48, 47, 49,
  ],
  "NY Times (Note)": [
    36, 45, 45, 37, 25, 27, 50, 49, 48, 47, 46, 45, 44, 45, 47, 46, 45, 44, 43,
    45, 47, 45, 46, 44, 46, 45, 44, 43, 45,
  ],
  "NY Times (Video)": [
    25, 25, 25, 25, 25, 27, 52, 51, 50, 49, 48, 47, 46, 47, 49, 48, 47, 46, 45,
    47, 49, 47, 48, 46, 48, 47, 46, 45, 47,
  ],
};
/**
 *
 * @returns { Record<string, Record<string,number>> }
 */
function calculateQuarterlyAverages(data) {
  const { Date, ...columns } = data;

  // Helper function to convert date to quarter
  const getQuarter = (dateStr) => {
    const [day, monthYear] = dateStr.split("-");
    const month = monthYear.slice(0, 3); // Extract month
    const year = monthYear.slice(3); // Extract year
    if (["Jan", "Feb", "Mar"].includes(month)) return `Q1-202${year}`;
    if (["Apr", "May", "Jun"].includes(month)) return `Q2-202${year}`;
    if (["Jul", "Aug", "Sep"].includes(month)) return `Q3-202${year}`;
    if (["Oct", "Nov", "Dec"].includes(month)) return `Q4-202${year}`;
  };

  // Organize data by quarters
  const quarterlyData = {};

  Date.forEach((dateStr, index) => {
    const quarter = getQuarter(dateStr);
    if (!quarterlyData[quarter]) {
      quarterlyData[quarter] = {};
    }
    for (const [key, values] of Object.entries(columns)) {
      if (!quarterlyData[quarter][key]) {
        quarterlyData[quarter][key] = [];
      }
      quarterlyData[quarter][key].push(values[index]);
    }
  });

  // Calculate average for each quarter
  const quarterlyAverages = {};
  for (const [quarter, values] of Object.entries(quarterlyData)) {
    quarterlyAverages[quarter] = {};
    for (const [key, valueArray] of Object.entries(values)) {
      quarterlyAverages[quarter][key] =
        valueArray.reduce((a, b) => a + b, 0) / valueArray.length;
    }
  }

  return quarterlyAverages;
}
export const finalData = calculateQuarterlyAverages(data);
export const averageLabels = Object.keys(finalData);

export function parseAndFormatDate(inputDate) {
  let date = inputDate;
  if(!inputDate) return "";

  if (inputDate.includes("Q")) {
    const [quarter, year] = inputDate.split("-");
    const month = (parseInt(quarter.replace("Q", ""), 10) - 1) + 1;
    date = new Date(`${year}-${String(month).padStart(2, "0")}-01`);
  } else {
    date = new Date(inputDate);
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return formattedDate;
}

export function changeLabel(data, oldLabel, newLable){
  const filteredData = data.filter((item) => item.name.includes(oldLabel));
  return filteredData.map((item) => {
    item.name = item.name.replace(oldLabel, newLable);
    return item;
  })
}


