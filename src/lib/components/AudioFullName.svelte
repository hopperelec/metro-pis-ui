<script lang="ts">
import { fullNameToURL } from "$lib/audio";
import Audio from "$lib/components/Audio.svelte";

export let fullName: string;
export let hideFullName = false;
</script>

<Audio src={fullNameToURL(fullName)} fullName={hideFullName ? undefined : fullName}/>