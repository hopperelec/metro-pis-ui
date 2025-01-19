<script lang="ts">
export let title: string;
export let description: string;
export let dontPrefix = false;
</script>

<svelte:head>
    <title>{dontPrefix ? title : `Metro PIS UI - ${title}`}</title>
    <meta name="description" content={description}>
</svelte:head>
<h1>{title}</h1>

<style>
h1 {
    text-align: center;
}
</style>