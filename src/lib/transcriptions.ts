import OfficialTranscriptionsCsv from "$lib/data/official-transcriptions.csv?raw";
import UnofficialAliasesCsv from "$lib/data/unofficial-aliases.csv?raw";
import UnofficialTranscriptionsCsv from "$lib/data/unofficial-transcriptions.csv?raw";
import Papa from "papaparse";

function parseTranscriptionCsv(transcriptionCsv: string) {
	return (
		Papa.parse(transcriptionCsv).data as [string, string, string][]
	).reduce(
		(acc, [filename, transcription, partOfSpeech]) => {
			acc[filename] = {
				transcription,
				partOfSpeech: PARTS_OF_SPEECH_SHORT.indexOf(partOfSpeech),
			};
			return acc;
		},
		{} as Record<string, Transcription>,
	);
}

export const PARTS_OF_SPEECH_SHORT = [undefined, "BOS", "MOS", "EOS", ""];
export const PARTS_OF_SPEECH_LONG = [
	"Not transcribed",
	"Beginning of sentence",
	"Middle of sentence",
	"End of sentence",
	"N/A",
];

export type Transcription = { transcription: string; partOfSpeech: number };

export const OFFICIAL_TRANSCRIPTIONS = parseTranscriptionCsv(
	OfficialTranscriptionsCsv,
);
export const UNOFFICIAL_TRANSCRIPTIONS = parseTranscriptionCsv(
	UnofficialTranscriptionsCsv,
);
export const TRANSCRIPTIONS = {
	...OFFICIAL_TRANSCRIPTIONS,
	...UNOFFICIAL_TRANSCRIPTIONS,
};
export const UNOFFICIAL_ALIASES = (
	Papa.parse(UnofficialAliasesCsv as string).data as [string, string][]
).reduce(
	(acc, [aliasFrom, aliasTo]) => {
		acc[aliasFrom] = aliasTo;
		return acc;
	},
	{} as Record<string, string>,
);

export function getGenericTranscription(filename: string) {
	if (filename in TRANSCRIPTIONS) return TRANSCRIPTIONS[filename];
	if (filename.endsWith("_ALT")) {
		const altName = filename.slice(0, -4);
		if (altName in TRANSCRIPTIONS) return TRANSCRIPTIONS[altName];
	}
	return { transcription: "", partOfSpeech: 0 };
}

export function getSpecificTranscription(category: string, filename: string) {
	const fullName = `${category}/${filename}`;
	return (
		UNOFFICIAL_TRANSCRIPTIONS[fullName] ||
		TRANSCRIPTIONS[UNOFFICIAL_ALIASES[fullName]] ||
		UNOFFICIAL_TRANSCRIPTIONS[filename] ||
		TRANSCRIPTIONS[UNOFFICIAL_ALIASES[filename]] ||
		getGenericTranscription(filename)
	);
}
