<script lang="ts">
import { concat } from "$lib/audio";
import Audio from "$lib/components/Audio.svelte";

let { fullNames, gapSeconds = 0.15 }: {
    fullNames: string[];
    gapSeconds?: number;
} = $props();
</script>

{#await concat(fullNames, gapSeconds)}
    <p>Concatenating audio, please wait...</p>
{:then src}
    <Audio {src}/>
{/await}