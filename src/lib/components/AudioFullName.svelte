<script lang="ts">
import { fullNameToURL } from "$lib/audio";
import Audio from "$lib/components/Audio.svelte";

let { fullName, hideFullName = false }: {
    fullName: string;
    hideFullName?: boolean;
} = $props();
</script>

<Audio src={fullNameToURL(fullName)} fullName={hideFullName ? undefined : fullName}/>