<script lang="ts">
let { title, description, dontPrefix = false }: {
    title: string;
    description: string;
    dontPrefix?: boolean;
} = $props();
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