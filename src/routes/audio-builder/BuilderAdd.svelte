<script lang="ts">
import type {Row} from "$lib/audio-builder-table";
import type {Writable} from "svelte/store";

export let row: Row;
export let selection: Writable<string[]>;
</script>

<button type="button"
        on:click={() => selection.update(_selection => [..._selection, `${row.category}/${row.filename}`])}
>Add</button>