<script lang="ts">
import PageTitle from "$lib/components/PageTitle.svelte";
import {
	type DotMatrixFont,
	generateOTF,
	parseImage,
} from "$lib/components/dot-matrix";
import FontMetrocarDotMatrix from "$lib/components/dot-matrix/FontMetrocarDotMatrix.svelte";
import SvgMetrocarDotMatrix from "$lib/components/dot-matrix/SVGMetrocarDotMatrix.svelte";
import DotMatrixImage from "$lib/media/dot-matrix.webp";

// Input data
let imageFiles: FileList | undefined = $state();
let expectedCharacters = $state("");
let fontFamilyName = $state("Metrocar Dot Matrix");
let isGenerated = $state(false);

// OTF style options
let circularDots = $state(true);
let dotSize = $state(0.5);
let characterSpacing = $state(1);
let spaceWidth = $state(5);

// Output
let font: DotMatrixFont | undefined = $state();
let otfURL: string | undefined = $state();

function generate() {
    if (!image || !expectedCharacters) return;
	isGenerated = true;
	font = parseImage(image, expectedCharacters, spaceWidth);
	otfURL = generateOTF(font, fontFamilyName, circularDots, dotSize, characterSpacing);
	document.fonts.add(new FontFace("DotMatrix", `url(${otfURL})`));
}

let image: HTMLImageElement | undefined = $derived.by(() => {
    if (imageFiles?.[0]) {
        const result = new Image();
        result.src = URL.createObjectURL(imageFiles[0]);
        return result;
    }
});
</script>

<PageTitle
        title="Dot matrix font creator"
        description="Generate dot matrix font files from images"
/>
<main>
    <p>To use this, first create an image.</p>
    <ul>
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
        <!-- svelte-ignore a11y_img_redundant_alt -->
        <img src={DotMatrixImage} alt="Example dot matrix image"/>
    </div>

    <p>Once you have an image, upload it below:</p>
    <input type="file" accept="image/*" bind:files={imageFiles}/>
    {#if image}
        <!-- svelte-ignore a11y_img_redundant_alt -->
        <img src={image.src} alt="Uploaded image"/>
    {/if}
    <p>And type the characters in the order they appear in the image:</p>
    <input type="text" placeholder="abc..." bind:value={expectedCharacters}/>
    <p>Optionally, you can also change the font family name:</p>
    <input type="text" bind:value={fontFamilyName}/>

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

    <button onclick={generate} disabled={!image || !expectedCharacters}>Generate</button>

    {#if isGenerated}
        <div>
            <h3>Previews (should be roughly identical)</h3>
            <p>Style options will sync with the SVG preview, but you will need to click "Generate" again to update the OTF preview.</p>
            <p>SVG Preview:</p>
            {#if font}
                <SvgMetrocarDotMatrix {font} text={expectedCharacters} {circularDots} {dotSize} {characterSpacing} mode="full"/>
                <p>OTF Preview:</p>
                {#if otfURL}
                    <FontMetrocarDotMatrix text={expectedCharacters} height={font?.height} {circularDots} {dotSize} mode="full"/>
                    <a download={`${fontFamilyName}.otf`} href={otfURL}>Download OTF file</a>
                {:else}
                    <p>Loading...</p>
                {/if}
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