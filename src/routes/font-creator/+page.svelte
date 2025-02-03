<script lang="ts">
    import PageTitle from '$lib/components/PageTitle.svelte';
    import DotMatrixImage from '$lib/media/dot-matrix.webp';
    import FontDotMatrix from "$lib/components/dot-matrix/FontDotMatrix.svelte";
    import SVGDotMatrix from "$lib/components/dot-matrix/SVGDotMatrix.svelte";
    import {type DotMatrixFont, generateOTF, parseImage} from "$lib/components/dot-matrix";

    // Input data
    let imageFiles: FileList;
    let expectedCharacters: string;
    let isGenerated: boolean;

    // OTF style options
    let circularDots = true;
    let dotSize = .5;
    let characterSpacing = 1;
    let spaceWidth = 5;

    // Output
    let font: DotMatrixFont;
    let otfURL: string;

    function generate() {
        isGenerated = true;
        font = parseImage(image, expectedCharacters, spaceWidth);
        otfURL = generateOTF(font, circularDots, dotSize, characterSpacing);
        document.fonts.add(new FontFace('DotMatrix', `url(${otfURL})`));
    }

    let image: HTMLImageElement;
    $: if (imageFiles && imageFiles[0]) {
        image = new Image();
        image.src = URL.createObjectURL(imageFiles[0]);
    }
</script>

<PageTitle
        title="Dot matrix font creator"
        description="Generate dot matrix font files from images"
/>
<main>
    <p>To use this, first create an image.</p>
    <ul>
        <li>The image should be 9 pixels tall.</li>
        <li>The image should contain a horizontal strip of characters.</li>
        <li>
            Only the red channel of the image will be checked, so you can use other channels for annotations.
            (the hex numbers below are the red channel values)
        </li>
        <li>Each character should use 0x00 for "unlit" dots and 0xff for "lit" dots.</li>
        <li>Characters should be separated by a single column of 0x80.</li>
    </ul>

    <div>
        <p>
            Below is the image used for the <a href="/routes">Routes</a> page.
            Note that some characters intentionally have a gap on one side.
        </p>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={DotMatrixImage} alt="Example dot matrix image"/>
    </div>

    <p>Once you have an image, upload it below:</p>
    <input type="file" accept="image/*" bind:files={imageFiles}/>
    {#if image}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={image.src} alt="Uploaded image"/>
    {/if}
    <p>And type the characters in the order they appear in the image:</p>
    <input type="text" placeholder="abc..." bind:value={expectedCharacters}/>

    <div>
        <h3>Style options</h3>
        <label>
            Circular dots:
            <input type="checkbox" bind:checked={circularDots}/>
        </label>
        <label>
            Dot size:
            <input type="range" min=".01" max=".99" step=".01" bind:value={dotSize}/>
            <input type="number" min=".01" max=".99" step=".01" bind:value={dotSize}/>
        </label>
        <label>
            Character spacing:
            <input type="range" max="5" step="1" bind:value={characterSpacing}/>
            <input type="number" step="1" bind:value={characterSpacing}/>
        </label>
        <label>
            Space width:
            <input type="range" min="0" max="10" step="1" bind:value={spaceWidth}/>
            <input type="number" step="1" bind:value={spaceWidth}/>
        </label>
    </div>

    <button on:click={generate} disabled={!image || !expectedCharacters}>Generate</button>

    {#if isGenerated}
        <div>
            <h3>Previews (should be roughly identical)</h3>
            <p>Style options will sync with the SVG preview, but you will need to click "Generate" again to update the OTF preview.</p>
            <p>SVG Preview:</p>
            {#if font}
                <SVGDotMatrix {font} text={expectedCharacters} {circularDots} {dotSize} {characterSpacing} mode="full"/>
            {:else}
                <p>Loading...</p>
            {/if}
            <p>OTF Preview:</p>
            {#if otfURL}
                <FontDotMatrix text={expectedCharacters} {circularDots} {dotSize} mode="full"/>
                <a download="DotMatrix.otf" href={otfURL}>Download OTF file</a>
            {:else}
                <p>Loading...</p>
            {/if}
        </div>
    {/if}
</main>

<style lang="scss">
main, main > div {
    display: flex;
    flex-direction: column;
    align-items: center;
}

main > div {
    margin: 1em 0;
}

img {
    height: 2em;
    image-rendering: pixelated;
}

input[type="number"] {
    &[step=".01"] {
        width: 3em;
    }

    &[step="1"] {
        width: 2em;
    }
}
</style>