import StationsCsv from "$lib/data/stations.csv?raw";
import Papa from "papaparse";

export default (
	Papa.parse(StationsCsv as string).data as [string, string]
).reduce(
	(acc, [stationCode, stationName]) => {
		acc[stationCode] = stationName;
		return acc;
	},
	{} as Record<string, string>,
);
