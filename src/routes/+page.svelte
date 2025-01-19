<script>
import PageTitle from "$lib/components/PageTitle.svelte";
</script>

<PageTitle
        title="Tyne and Wear Metro Class 599 PIS UI" dontPrefix
        description="A user-friendly way to browse and experiment with official PIS data for the Tyne and Wear Metro Class 599s"
/>
<main>
    <p>
        This tool provides a user-friendly way to browse and experiment with official PIS data taken from
        Freedom of Information requests made to Nexus (Tyne and Wear Transport Executive).
        <br>
        Audio files are sourced from
        <a href="https://github.com/Rail-Announcements/nexus-tyne-and-wear-metro">this GitHub repository</a>.
        Official transcripts, station codes, route announcements and dot matrix messages are sourced from
        <a href="https://www.whatdotheyknow.com/request/tyne_wear_metro_automated_announ">this WhatDoTheyKnow FoI request</a>
        (specifically the file named "Master Station Index 2.xls").
        <br>
        Each of the pages are listed below.
    </p>
    <br>
    <nav>
        <ul>
            <li>
                <a href="all-audio">All Audio</a>
                lists all audio including announcements, audio descriptions and chimes,
                organized by their transcription (so male and female versions of the same announcement are grouped together).
            </li>
            <li>
                <a href="audio-builder">Audio Builder</a>
                lets you piece together any of those audio files to create your own custom announcement,
                and makes it easy to find the audio files you need to do so.
            </li>
            <li>
                <a href="routes">Routes</a>
                lets you listen to the announcements and view the on-board dot matrix
                for arriving at and departing from each station on any possible route.
            </li>
            <li>
                <a href="transcriber">Transcriber</a>
                was mostly just made for creating the transcriptions for this website
                (modifying the official ones, and creating missing ones),
                but I've left it in for if you want to see all the changes that were made.
            </li>
        </ul>
    </nav>
</main>

<style>
main {
    display: flex;
    flex-direction: column;
    align-items: center;
}

p {
    text-align: center;
}
</style>