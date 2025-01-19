import AptShlCsv from "$lib/data/lines/apt-shl.csv?raw";
import ShlAptCsv from "$lib/data/lines/shl-apt.csv?raw";
import SssStjCsv from "$lib/data/lines/sss-stj.csv?raw";
import StjSssCsv from "$lib/data/lines/stj-sss.csv?raw";
import Papa from "papaparse";

export type RailLine = "apt_shl" | "shl_apt" | "stj_sss" | "sss_stj";

export type RailStopDetails = {
	routeCode: number;
	station: string;
	approachingAudio: string[];
	departingAudio: string[];
	approachingText: string;
	departingText: string;
};

function parseAudioList(audioList: string) {
	return audioList ? audioList.split(",") : [];
}

function readRailLine(csvData: string): RailStopDetails[] {
	const rows = Papa.parse(csvData).data as [
		string,
		string,
		string,
		string,
		string,
		string,
	][];
	return rows.map(
		([
			routeCode,
			station,
			approachingAudio,
			departingAudio,
			approachingText,
			departingText,
		]) => ({
			routeCode: +routeCode,
			station,
			approachingAudio: parseAudioList(approachingAudio),
			departingAudio: parseAudioList(departingAudio),
			approachingText,
			departingText,
		}),
	);
}

export default {
	apt_shl: readRailLine(AptShlCsv),
	shl_apt: readRailLine(ShlAptCsv),
	sss_stj: readRailLine(SssStjCsv),
	stj_sss: readRailLine(StjSssCsv),
} as { [key in RailLine]: RailStopDetails[] };
