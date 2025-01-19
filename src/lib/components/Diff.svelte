<script lang="ts">
import { diffWords } from "diff";

export let oldStr: string;
export let newStr: string;

$: diff = diffWords(oldStr, newStr);
</script>

{#if diff.some(({ added, removed }) => added || removed)}
    {#each diff as { added, removed, value }}
        <span class:added={added} class:removed={removed}>{value}</span>
    {/each}
{:else}
    <span class="no-changes">No changes</span>
{/if}

<style>
.added {
    background-color: #dfd;
}

.removed {
    background-color: #fdd;
}

.no-changes {
    color: #888;
    font-style: italic;
}
</style>