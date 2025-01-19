<script lang="ts">
import AudioFullName from "$lib/components/AudioFullName.svelte";
import type {Row} from "$lib/audio-builder-table";

export let row: Row;
</script>

<AudioFullName fullName={`${row.category}/${row.filename}`} hideFullName/>