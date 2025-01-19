<script lang="ts">
import type { Row } from "$lib/audio-builder-table";
import AudioFullName from "$lib/components/AudioFullName.svelte";

export let row: Row;
</script>

<AudioFullName fullName={`${row.category}/${row.filename}`} hideFullName/>