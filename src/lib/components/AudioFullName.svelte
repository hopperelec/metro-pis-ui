<script lang="ts">
    import Audio from "$lib/components/Audio.svelte";
    import {fullNameToURL} from "$lib/audio";

    export let fullName: string;
    export let hideFullName = false;
</script>

<Audio src={fullNameToURL(fullName)} fullName={hideFullName ? undefined : fullName}/>