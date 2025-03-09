<script lang="ts">
let { src, fullName = undefined }: {
    src: string;
    fullName?: string;
} = $props();

let time: number = $state(0);
let duration: number | undefined = $state();
let paused: boolean = $state(true);
</script>

<div id="container">
    <audio preload="none" {src} bind:currentTime={time} bind:duration={duration} bind:paused={paused}></audio>
    {#if fullName}<p>{fullName}</p>{/if}
    <div id="controls">
        <button onclick={() => paused = !paused}>{paused ? "▶️" : "⏸️"}</button>
        <input type="range" bind:value={time} max={duration || 0} step="0.01"/>
        <a href={src} download={fullName?.replace("/","-") || true}>💾</a>
    </div>
</div>

<style>
    #container {
        padding: .2em;
        display: flex;
        align-items: center;
        flex-direction: column;
        width: fit-content;
    }

    #controls {
        display: flex;
        align-items: center;
    }

    button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    a {
        text-decoration: none;
    }
</style>