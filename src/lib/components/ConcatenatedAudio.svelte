<script lang="ts">
import { concat } from "$lib/audio";
import Audio from "$lib/components/Audio.svelte";

export let fullNames: string[];
export let gapSeconds = 0.15;
</script>

{#await concat(fullNames, gapSeconds)}
    <p>Concatenating audio, please wait...</p>
{:then src}
    <Audio {src}/>
{/await}