<script lang="ts">
    import type {Snippet} from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<div id="layout-container">
    <div id="slot-container">
        {@render children()}
    </div>
    <footer>
        This website is open-source. You can view all of it's the code, report any issues,
        make suggestions or contribute <a href="https://github.com/hopperelec/metro-pis-ui">here</a>.
        <br>
        <small>
            This website is not affiliated, associated, authorized, endorsed by, or in any way officially connected with
            Tyne and Wear Transport Executive or Tyne and Wear Metro.
        </small>
    </footer>
</div>

<style>
#layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

#slot-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

footer {
    text-align: center;
    width: 100%;
}
</style>