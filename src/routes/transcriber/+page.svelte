<script lang="ts">
import { AUDIO_FILENAMES } from "$lib/audio";
import AudioFullName from "$lib/components/AudioFullName.svelte";
import Diff from "$lib/components/Diff.svelte";
import PageTitle from "$lib/components/PageTitle.svelte";
import {
	OFFICIAL_TRANSCRIPTIONS,
	PARTS_OF_SPEECH_LONG,
	PARTS_OF_SPEECH_SHORT,
	type Transcription,
	getSpecificTranscription,
} from "$lib/transcriptions";
import Papa from "papaparse";
import {SvelteMap} from "svelte/reactivity";

const newTranscriptions = new SvelteMap<string, Transcription>();
for (const [category, filenames] of Object.entries(AUDIO_FILENAMES)) {
	for (const filename of filenames) {
		const fullName = `${category}/${filename}`;
		newTranscriptions.set(
            fullName,
            structuredClone(getSpecificTranscription(category, filename))
        );
	}
}

function getTranscription(fullName: string) {
    // Used to assert that the key exists
    return newTranscriptions.get(fullName) as Transcription;
}

let currentFocused = $state<string | undefined>();
let suggestedTranscriptions = $derived(
    new Set(
        Object.entries(newTranscriptions)
            .filter(([fullName, _]) => fullName !== currentFocused) // To avoid suggesting the current input
            .map(([_, { transcription }]) => transcription),
    )
);

function transcriptionEquals(a: Transcription, b: Transcription | undefined) {
	return b
		? a.transcription === b.transcription && a.partOfSpeech === b.partOfSpeech
		: a.transcription === "" || a.partOfSpeech === 0;
}

function saveAsCsv(data: unknown[], filename: string) {
	const link = document.createElement("a");
	link.href = URL.createObjectURL(
		new Blob([Papa.unparse(data, { header: false })], { type: "text/csv" }),
	);
	link.download = filename;
	link.click();
}

function save() {
	// Find modified transcriptions
	const modifiedTranscriptions: Record<string, Transcription> = {};
	for (const [category, filenames] of Object.entries(AUDIO_FILENAMES)) {
		for (const filename of filenames) {
			const fullName = `${category}/${filename}`;
            const newTranscription = getTranscription(fullName);
			if (
				!transcriptionEquals(
                    newTranscription,
					OFFICIAL_TRANSCRIPTIONS[filename],
				)
			) {
				modifiedTranscriptions[fullName] = newTranscription;
			}
		}
	}
	// Filter out aliases
	const nonAliases = structuredClone(OFFICIAL_TRANSCRIPTIONS);
	const aliases: Record<string, string> = {};
	for (const [fullName, modifiedTranscription] of Object.entries(
		modifiedTranscriptions,
	)) {
		let foundOriginal = false;
		for (const [partialName, officialTranscription] of Object.entries(
			nonAliases,
		)) {
			if (transcriptionEquals(modifiedTranscription, officialTranscription)) {
				aliases[fullName] = partialName;
				delete modifiedTranscriptions[fullName];
				foundOriginal = true;
				break;
			}
		}
		if (!foundOriginal) nonAliases[fullName] = modifiedTranscription;
	}
	// Save
	saveAsCsv(Object.entries(aliases), "unofficial-aliases.csv");
	saveAsCsv(
		Object.entries(modifiedTranscriptions).reduce(
			(acc, [fullName, transcription]) => {
				acc.push([
					fullName,
					transcription.transcription,
					PARTS_OF_SPEECH_SHORT[transcription.partOfSpeech] as string,
				]);
				return acc;
			},
			[] as [string, string, string][],
		),
		"unofficial-transcriptions.csv",
	);
}
</script>

<datalist id="existing-transcriptions">
    {#each suggestedTranscriptions as transcription}
        <option value={transcription}></option>
    {/each}
</datalist>

<PageTitle
        title="Transcriber"
        description="Transcribe the audio files from the Tyne and Wear Metro Class 599s"
/>
<main>
    <p>Click <button onclick={save}>Save</button> to download the updated unofficial-aliases.csv and unofficial-transcriptions.csv</p>
    <div id="table-container">
        <table>
            <thead>
            <tr>
                <th>Category</th>
                <th>Filename</th>
                <th>Transcription</th>
                <th>Sentence part</th>
                <th>File</th>
            </tr>
            </thead>
            <tbody>
            {#each Object.entries(AUDIO_FILENAMES) as [category, filenames]}
                {#each filenames as filename}
                    {@const originalTranscription = OFFICIAL_TRANSCRIPTIONS[filename]}
                    {@const fullName = `${category}/${filename}`}
                    {@const newTranscription = getTranscription(fullName)}
                    <tr
                            class:modified={!transcriptionEquals(newTranscription, originalTranscription)}
                            class:incomplete={(newTranscription.transcription === '') !== (newTranscription.partOfSpeech === 0)}
                    >
                        <td>{category}</td>
                        <td>{filename}</td>
                        <td class="transcription">
                            {#if newTranscription.transcription.length > 100}
                        <textarea rows="3"
                                  bind:value={newTranscription.transcription}
                                  onfocus={() => currentFocused = undefined}
                        ></textarea>
                            {:else}
                                <input type="text" list="existing-transcriptions"
                                       bind:value={newTranscription.transcription}
                                       onfocus={() => currentFocused = fullName}
                                />
                                {#if originalTranscription}
                                    <Diff
                                            oldStr={originalTranscription.transcription}
                                            newStr={newTranscription.transcription}
                                    />
                                {/if}
                            {/if}
                        </td>
                        <td>
                            <select bind:value={newTranscription.partOfSpeech}>
                                {#each Object.entries(PARTS_OF_SPEECH_LONG) as [partOfSpeechId,partOfSpeech]}
                                    <option value={+partOfSpeechId}>{partOfSpeech}</option>
                                {/each}
                            </select>
                            {#if originalTranscription}
                                {#if originalTranscription.partOfSpeech === newTranscription.partOfSpeech}
                                    <span class="no-changes">Same as original</span>
                                {:else}
                                <span>
                                    Originally
                                    {PARTS_OF_SPEECH_SHORT[originalTranscription.partOfSpeech] || "N/A"}
                                </span>
                                {/if}
                            {/if}
                        </td>
                        <td>
                            <AudioFullName {fullName} hideFullName/>
                        </td>
                    </tr>
                {/each}
            {/each}
            </tbody>
        </table>
    </div>
</main>

<style>
main {
    min-height: 0;
    display: flex;
    flex-direction: column;
}

#table-container {
    overflow: auto;
}

p {
    text-align: center;
}

table {
    display: block;
    overflow-y: auto;
}

.transcription, .transcription input, .transcription textarea {
    box-sizing: border-box;
    width: 100%;
}

thead {
    background-color: #ccc;
}

.modified {
    background-color: #fa5;
}

.incomplete {
    background-color: #f99;
}

tbody > tr:nth-child(even) {
    background-color: #eee;

    &.modified {
        background-color: #f83
    }

    &.incomplete {
        background-color: #f77
    }
}

.no-changes {
    color: #888;
    font-style: italic;
}
</style>