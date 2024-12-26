import { useState, useMemo } from "react";

const useSelectedData = (data) => {
    const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
    const [selectedFilterRecordsLength, setSelectedFilterRecordsLength] = useState(0);
    const [topbarMode, setTopbarMode] = useState("month");

    const selectedData = useMemo(() => {
        const getTotalRecordsAndData = (dataList) => {
            const totalRecords = dataList?.length || 0;
            const currentIndex = currentRecordIndex || totalRecords - 1;

            if (!currentRecordIndex && totalRecords) setCurrentRecordIndex(currentIndex);
            if (!selectedFilterRecordsLength && totalRecords) setSelectedFilterRecordsLength(totalRecords);

            return dataList?.[currentIndex];
        };

        const changeTopbarMode = () => {
            setTopbarMode(topbarMode === "week" ? "month" : topbarMode === "month"? "year": "week");
            setCurrentRecordIndex(0);
            setSelectedFilterRecordsLength(0);
        }

        if (topbarMode === "week") {
            return { ...getTotalRecordsAndData(data?.weekComparison) };
        }

        if (topbarMode === "month") {
            return { ...getTotalRecordsAndData(data?.quarterData) };
        }

        if (topbarMode === "year") {
            return { ...getTotalRecordsAndData(data?.yearData) };
        }

        if (topbarMode === "all time") {
            return { ...data?.allTimeData };
        }

    }, [data, topbarMode, currentRecordIndex, selectedFilterRecordsLength]);

    const changeTopbarMode = () => {
        let newTopbarMode = topbarMode;
        switch(topbarMode) {
            case "week":
                newTopbarMode = "month";
                break;
            case "month":
                newTopbarMode = "year";
                break;
            case "year":
                newTopbarMode = "all time";
                break;
            case "all time":
                newTopbarMode = "week";
                break;
            default:
                newTopbarMode = "month";
        }
        setTopbarMode(newTopbarMode);
        setCurrentRecordIndex(0);
        setSelectedFilterRecordsLength(0);
    }

    return {
        selectedData,
        currentRecordIndex,
        selectedFilterRecordsLength,
        topbarMode,
        setTopbarMode,
        setCurrentRecordIndex,
        setSelectedFilterRecordsLength,
        changeTopbarMode
    };
};

export default useSelectedData;
