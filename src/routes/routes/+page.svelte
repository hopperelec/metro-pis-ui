<script lang="ts">
import { AUDIO_FILENAMES, PAUSE_REGEX } from "$lib/audio";
import AudioFullName from "$lib/components/AudioFullName.svelte";
import ConcatenatedAudio from "$lib/components/ConcatenatedAudio.svelte";
import DotMatrix from "$lib/components/DotMatrix.svelte";
import PageTitle from "$lib/components/PageTitle.svelte";
import LINES, { type RailLine } from "$lib/lines";
import STATIONS from "$lib/stations";
import {
	UNOFFICIAL_ALIASES,
	getGenericTranscription,
	getSpecificTranscription,
} from "$lib/transcriptions";
import { queryParamsState } from "kit-query-params";

const options = queryParamsState({
	schema: {
		line: `<${Object.keys(LINES).join(",")}>`,
		from: "string",
		routeCode: "number",
		female: "boolean",
		departing: "boolean",
	},
});
$: line =
	options.line && options.line in LINES
		? (options.line as RailLine)
		: "apt_shl";

$: routeCodes = new Set(
	LINES[line]
		?.filter((stop) => stop.station === options.from)
		.map((stop) => stop.routeCode),
);

$: row = LINES[line]?.filter(
	(stop) =>
		stop.routeCode === options.routeCode && stop.station === options.from,
)[0];
$: filenames = row
	? options.departing
		? row.departingAudio
		: row.approachingAudio
	: [];
$: fullNames = filenames.map((filename) => {
	let category: string;
	if (PAUSE_REGEX.test(filename)) category = "pause";
	else {
		category = options.female ? "female" : "male";
		if (!AUDIO_FILENAMES[category].includes(filename)) {
			const alias = Object.entries(UNOFFICIAL_ALIASES).find(
				([aliasFrom, aliasTo]) =>
					aliasTo === filename && aliasFrom.startsWith(`${category}/`),
			);
			if (alias) filename = alias[0];
			else return undefined;
		}
	}
	return `${category}/${filename}`;
});
$: text = row
	? options.departing
		? row.departingText
		: row.approachingText
	: "";
</script>

<PageTitle
        title="Routes"
        description="Listen to the announcements and view the dot matrix used on the Class 599s when travelling on Metro network"
/>
<main>
    <p>
        The data used on this page appears to be slightly out of date.
        This says "The next station is" while the 599s actually just say "Next station is" nowadays.<br>
        I could easily fix this, but there might be other discrepancies,
        and I would rather the data be outdated than outright incorrect.
    </p>

    <h2>Options</h2>
    <ul id="options">
        <li>
            <label for="line">Line</label>
            <select id="line" bind:value={options.line}>
                <option value="apt_shl">Green outbound - Airport to South Hylton</option>
                <option value="shl_apt">Green inbound - South Hylton to Airport</option>
                <option value="stj_sss">Yellow outbound - St James to South Shields</option>
                <option value="sss_stj">Yellow inbound - South Shields to St James</option>
            </select>
        </li>
        <li>
            <label for="from">From</label>
            <select id="from" bind:value={options.from}>
                {#each new Set(LINES[line]?.map(stop => stop.station)) as possibleStation}
                    <option value={possibleStation}>{possibleStation} - {STATIONS[possibleStation]}</option>
                {/each}
            </select>
        </li>
        <li>
            <label for="route-code">Route code</label>
            <select id="route-code" bind:value={options.routeCode} disabled={routeCodes.size === 0}>
                {#if routeCodes.size === 0}
                    <option>Select "From" first</option>
                {:else}
                    {#each routeCodes as routeCode}
                        <option value={routeCode}>{String(routeCode).padStart(2, '0')}</option>
                    {/each}
                {/if}
            </select>
        </li>
        <li>
            <label for="female">Female voice?</label>
            <input type="checkbox" id="female" bind:checked={options.female}/>
            <p>
                This just uses the female equivalent audio files if they exist.<br>
                The male and female announcements do not follow the exact same structure.<br>
                The male announcements use some recordings only done by the male voice.<br>
                Therefore, some announcements will be incomplete with this option enabled.
            </p>
        </li>
        <li>
            <label for="departing">Departing?</label>
            <input type="checkbox" id="departing" bind:checked={options.departing}/>
        </li>
    </ul>

    <br>
    <h2>Dot matrix</h2>
    <p>
        This does not actually render as a dot matrix (yet!).
        Hopefully I will be able to obtain the correct font at some point,
        otherwise I would need to re-create it pixel-by-pixel manually.
    </p>
    <br>
    {#if text}
        <div id="dot-matrix-container">
            <DotMatrix {text}/>
            <p>{text}</p>
        </div>
    {:else}
        <p class="selection-issue">Your current selection has no text.</p>
    {/if}

    <br>
    <h2>Concatenated audio</h2>
    {#if fullNames.length === 0}
        <p class="selection-issue">Your current selection has no audio.</p>
    {:else}
        <ConcatenatedAudio fullNames={fullNames.filter(x => x !== undefined)}/>
    {/if}

    <br>
    <h2>Individual audio files</h2>
    {#if fullNames.length === 0}
        <p class="selection-issue">Your current selection has no audio.</p>
    {:else}
        <ol id="audio-files">
            {#each Object.entries(fullNames) as [i,fullName]}
                {@const partialName = filenames[+i]}
                {@const { transcription } = fullName ? getSpecificTranscription(fullName, partialName) : getGenericTranscription(partialName)}
                <li>
                    {#if fullName}
                        <AudioFullName {fullName}/>
                    {:else}
                        <span>Missing audio file.</span>
                    {/if}
                    <span>{transcription}</span>
                </li>
            {/each}
        </ol>
    {/if}
</main>

<style lang="scss">
main {
    overflow: auto;
}

.selection-issue {
    font-style: italic;
}

#dot-matrix-container {
  display: flex;
  align-items: center;

  & > p {
    padding-left: 1em;
  }
}

#audio-files {
    width: fit-content;
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: auto auto;
    grid-auto-rows: 1fr;

    & > li {
        display: grid;
        grid-column: span 2;
        grid-template-columns: subgrid;
        align-items: center;
        text-align: center;
    }
}
</style>