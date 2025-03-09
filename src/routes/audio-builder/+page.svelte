<script lang="ts">
import { AUDIO_FILENAMES } from "$lib/audio.js";
import AudioFullName from "$lib/components/AudioFullName.svelte";
import ConcatenatedAudio from "$lib/components/ConcatenatedAudio.svelte";
import PageTitle from "$lib/components/PageTitle.svelte";
import { PARTS_OF_SPEECH_LONG, getSpecificTranscription } from "$lib/transcriptions.js";

type Row = {
	category: keyof typeof AUDIO_FILENAMES;
	filename: string;
};

let selection: Row[] = $state([]);
let fullNames = $derived(selection.map(
	({ category, filename }) => `${category}/${filename}`,
));

const filters = $state({
	categories: [] as (keyof typeof AUDIO_FILENAMES)[],
	filename: "",
	transcription: "",
	partsOfSpeech: [] as number[],
});

let doAutoFilterPOS = $state(false);
$effect(() => {
	if (!doAutoFilterPOS) return;
    // If auto-filter is enabled, change the filter whenever the selection changes
    let lastPOS = 3;
	if (selection.length > 0) {
        const {category, filename} = selection[selection.length - 1];
        lastPOS = getSpecificTranscription(
            category as string,
            filename,
        ).partOfSpeech;
    }
    if (lastPOS === 3) {
        filters.partsOfSpeech = [1, 3];
    } else if (lastPOS === 1 || lastPOS === 2) {
        filters.partsOfSpeech = [2, 3];
    } else {
        filters.partsOfSpeech = [1, 2, 3];
    }
});

const ROWS = Object.entries(AUDIO_FILENAMES).flatMap(([category, filenames]) =>
	filenames.map((filename) => ({ category, filename })),
);

function caseInsensitiveSearch(needle: string, haystack: string) {
	return haystack.toLowerCase().includes(needle.toLowerCase());
}
</script>

<PageTitle
        title="Audio builder"
        description="Piece together any audio files from the Tyne and Wear Metro Class 599s to create your own custom announcement"
/>
<main>
    <h2>Selection</h2>
    <div id="selection-container">
        {#if selection.length === 0}
            <p class="selection-issue">No audio files selected</p>
        {:else}
            <button onclick={() => selection = []}>Clear selection</button>
            <ol id="selection">
                {#each Object.entries(fullNames) as [key, fullName] (key)}
                    <li>
                        <AudioFullName {fullName}/>
                        <button onclick={() => selection = selection.toSpliced(+key, 1)}>❌</button>
                    </li>
                {/each}
            </ol>
        {/if}
    </div>
    <h2>Concatenated audio</h2>
    <div id="concat-container">
        {#if selection.length === 0}
            <p class="selection-issue">Waiting for your selection</p>
        {:else}
            <ConcatenatedAudio {fullNames}/>
        {/if}
    </div>
    <h2>Audio files</h2>
    <div id="table-container">
        <table>
            <thead>
            <tr>
                <th>
                    <select bind:value={filters.categories} multiple>
                        {#each Object.keys(AUDIO_FILENAMES) as category}
                            <option value={category}>{category}</option>
                        {/each}
                    </select>
                </th>
                <th>
                    <input type="text" placeholder="Search..." bind:value={filters.filename}/>
                </th>
                <th>
                    <input type="text" placeholder="Search..." bind:value={filters.transcription}/>
                </th>
                <th>
                    <div id="pos-filter-container">
                        <div>
                            <label for="auto-filter-pos">Auto-filter</label>
                            <input id="auto-filter-pos" type="checkbox" bind:checked={doAutoFilterPOS}/>
                        </div>
                        <select bind:value={filters.partsOfSpeech} disabled={doAutoFilterPOS} multiple>
                            {#each Object.entries(PARTS_OF_SPEECH_LONG).slice(1,4) as [partOfSpeechId,partOfSpeech]}
                                <option value={+partOfSpeechId}>{partOfSpeech}</option>
                            {/each}
                        </select>
                    </div>
                </th>
            </tr>
            <tr>
                <th>Category</th>
                <th>Filename</th>
                <th id="transcription-col">Transcription</th>
                <th>Part of speech</th>
                <th>File</th>
            </tr>
            </thead>
            <tbody>
            {#each ROWS as row}
                {@const fullName = `${row.category}/${row.filename}`}
                {@const {transcription,partOfSpeech} = getSpecificTranscription(row.category, row.filename)}
                {#if (
                    (filters.categories.length === 0 || filters.categories.includes(row.category)) &&
                    (!filters.filename || caseInsensitiveSearch(filters.filename, row.filename)) &&
                    (!filters.transcription || caseInsensitiveSearch(filters.transcription, transcription)) &&
                    (filters.partsOfSpeech.length === 0 || filters.partsOfSpeech.includes(partOfSpeech))
                )}
                    <tr>
                        <td>{row.category}</td>
                        <td>{row.filename}</td>
                        <td>{transcription}</td>
                        <td>{PARTS_OF_SPEECH_LONG[partOfSpeech]}</td>
                        <td><AudioFullName {fullName} hideFullName/></td>
                        <td>
                            <button type="button"
                                    onclick={() => selection = [...selection, row]}
                            >Add</button>
                        </td>
                    </tr>
                {/if}
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

h2, .selection-issue {
    text-align: center;
}

.selection-issue {
    font-style: italic;
}

#selection-container {
    min-height: 6em;
    display: flex;
    flex-direction: column;
    align-items: center;
}

#selection {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;

    & > li {
        display: flex;
        align-items: center;

        & > button {
            padding: .2em;
            border-radius: 50%;
        }
    }
}

#concat-container {
    display: flex;
    justify-content: center;
    min-height: 2em;
}

table, #transcription-col {
    width: 100%;
}

#pos-filter-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

select[multiple] {
    height: 4em;
}

input[type="text"] {
    width: 100%;
    box-sizing: border-box;
}
</style>