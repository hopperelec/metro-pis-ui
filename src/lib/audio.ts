import { PUBLIC_AUDIO_URL } from "$env/static/public";
import FILENAMES_FILE from "$lib/data/audio-filenames?raw";
import {
	TRANSCRIPTIONS,
	UNOFFICIAL_ALIASES,
	UNOFFICIAL_TRANSCRIPTIONS,
} from "$lib/transcriptions";
import audioBufferToWav from "audiobuffer-to-wav";

export const AUDIO_FILENAMES = Object.fromEntries(
	(FILENAMES_FILE as string).split(/\r?\n/).map((line) => {
		const [category, filenames] = line.split(":", 2) as [string, string];
		return [category, filenames.split(",")];
	}),
);

export const FULL_NAMES_BY_PARTIAL_NAME = Object.entries(
	AUDIO_FILENAMES,
).reduce(
	(acc, [category, filenames]) => {
		for (const filename of filenames) {
			const fullName = `${category}/${filename}`;
			let partialName = filename;
			if (fullName in UNOFFICIAL_TRANSCRIPTIONS) partialName = fullName;
			else if (fullName in UNOFFICIAL_ALIASES)
				partialName = UNOFFICIAL_ALIASES[fullName];
			else if (filename in UNOFFICIAL_ALIASES)
				partialName = UNOFFICIAL_ALIASES[filename];
			else if (!(filename in TRANSCRIPTIONS) && filename.endsWith("_ALT"))
				partialName = filename.slice(0, -4);
			if (!acc[partialName]) acc[partialName] = [];
			acc[partialName].push(fullName);
		}
		return acc;
	},
	{} as Record<string, string[]>,
);

export const PAUSE_REGEX = new RegExp(/PAUSE[1-4]/);

export function fullNameToURL(fullName: string): string {
	return `${PUBLIC_AUDIO_URL}/${fullName}.wav`;
}

export async function concat(
	fullNames: string[],
	gapSeconds: number,
): Promise<string> {
	let wavBuffer: ArrayBuffer;

	const audioContext = new window.AudioContext();
	try {
		// Fetch and decode original buffers
		const buffers = await Promise.all(
			fullNames.map(async (fullName) => {
				return await fetch(fullNameToURL(fullName))
					.then((response) => response.arrayBuffer())
					.then((buffer) => audioContext.decodeAudioData(buffer));
			}),
		);

		// Assume all buffers have the same number of channels and sample rate
		const { numberOfChannels, sampleRate } = buffers[0];
		const gapLength = Math.ceil(gapSeconds * sampleRate);

		// Create concatenated buffer
		const concatenatedBuffer = audioContext.createBuffer(
			numberOfChannels,
			buffers.reduce((sum, buffer) => sum + buffer.length, 0) +
				gapLength * (buffers.length - 1),
			sampleRate,
		);
		let offset = 0;
		for (const buffer of buffers) {
			for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
				const channelData = concatenatedBuffer.getChannelData(channel);
				channelData.set(buffer.getChannelData(channel), offset);
			}
			offset += buffer.length + gapLength;
		}

		// Create WAV buffer
		wavBuffer = audioBufferToWav(concatenatedBuffer);
	} finally {
		await audioContext.close();
	}

	// Create URL
	return URL.createObjectURL(new Blob([wavBuffer], { type: "audio/wav" }));
}
