<script lang="ts">
import FontMetrocarDotMatrix from "$lib/components/dot-matrix/FontMetrocarDotMatrix.svelte";
import SvgMetrocarDotMatrix from "$lib/components/dot-matrix/SVGMetrocarDotMatrix.svelte";
import {
	type DotMatrixFont,
	generateOTF,
	parseImage,
} from "$lib/components/dot-matrix/index";
import DotMatrixImage from "$lib/media/dot-matrix.webp";
import { onMount } from "svelte";

let { text }: { text: string } = $props();
// Text is split into pages by <>
// If the text is just one page, scroll the text
// Otherwise, cycle through each page, showing it centered for 2 seconds
let pages = $derived(text.split("<>"));

let currentPageNumber = $state(0);
let scrollInterval: NodeJS.Timeout | undefined;
$effect(() => {
	clearInterval(scrollInterval);
	if (pages.length > 1) {
		currentPageNumber = 0;
		scrollInterval = setInterval(() => {
			currentPageNumber = (currentPageNumber + 1) % pages.length;
		}, 2000);
	}
});

let font: DotMatrixFont | undefined = $state();
onMount(() => {
	const image = new Image();
	image.onload = () => {
		// noinspection SpellCheckingInspection
		font = parseImage(
			image,
            // Ignoring the last two characters, since I don't know what Unicode character they correspond to
			"abcdefghiklmnoprstuvwxyABCDEFGHIJKLMNOPRSTUWX12,.?{}'",
			5,
		);
		const otfURL = generateOTF(font, "DotMatrix", true, 0.5, 1);
		document.fonts.add(new FontFace("DotMatrix", `url(${otfURL})`));
	};
	image.src = DotMatrixImage;
});
</script>

<FontMetrocarDotMatrix text={pages[currentPageNumber]} height={font?.height} mode={pages.length === 1 ? "scroll" : "center"} />
{#if font}
    <SvgMetrocarDotMatrix {font} text={pages[currentPageNumber]} mode={pages.length === 1 ? "scroll" : "center"} />
{/if}