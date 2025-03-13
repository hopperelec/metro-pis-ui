<script lang="ts">
import { FULL_NAMES_BY_PARTIAL_NAME } from "$lib/audio";
import AudioFullName from "$lib/components/AudioFullName.svelte";
import PageTitle from "$lib/components/PageTitle.svelte";
import { PARTS_OF_SPEECH_LONG, TRANSCRIPTIONS } from "$lib/transcriptions";
</script>

<PageTitle
        title="All audio"
        description="Browse all audio files from the Tyne and Wear Metro Class 599s"
/>
<main>
    <table>
        <thead>
        <tr>
            <th>Name</th>
            <th>Transcription</th>
            <th>Sentence part</th>
            <th>Files</th>
        </tr>
        </thead>
        <tbody>
        {#each Object.entries(FULL_NAMES_BY_PARTIAL_NAME) as [partialName, fullNames]}
            <tr>
                <td>{partialName}</td>
                <td class="transcription">{TRANSCRIPTIONS[partialName]?.transcription || "Not transcribed"}</td>
                <td>{PARTS_OF_SPEECH_LONG[partialName in TRANSCRIPTIONS ? TRANSCRIPTIONS[partialName].partOfSpeech : 0]}</td>
                <td class="audio">
                    {#each fullNames as fullName}
                        <AudioFullName {fullName}/>
                    {/each}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
</main>

<style>
main {
    overflow: auto;
}

.transcription {
    text-wrap: auto;
}

.audio {
    display: flex;
}

thead {
    background-color: #ccc;
}

tbody > tr:nth-child(even) {
    background-color: #eee;
}
</style>