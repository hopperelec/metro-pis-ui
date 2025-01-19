<script lang="ts">
export let title: string;
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>
<h1>{title}</h1>

<style>
h1 {
    text-align: center;
}
</style>