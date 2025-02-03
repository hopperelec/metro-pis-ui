<script lang="ts">
import FontDotMatrix from "$lib/components/dot-matrix/FontDotMatrix.svelte";
import SVGDotMatrix from "$lib/components/dot-matrix/SVGDotMatrix.svelte";
import {
	type DotMatrixFont,
	generateOTF,
	parseImage,
} from "$lib/components/dot-matrix/index";
import DotMatrixImage from "$lib/media/dot-matrix.webp";
import { onMount } from "svelte";

export let text: string;
// Text is split into pages by <>
// If the text is just one page, scroll the text
// Otherwise, cycle through each page, showing it centered for 2 seconds
$: pages = text.split("<>");

let currentPageNumber = 0;
let scrollInterval: NodeJS.Timeout;
function updatePages() {
	clearInterval(scrollInterval);
	if (pages.length > 1) {
		currentPageNumber = 0;
		scrollInterval = setInterval(() => {
			currentPageNumber = (currentPageNumber + 1) % pages.length;
		}, 2000);
	}
}
$: if (pages) updatePages();

let font: DotMatrixFont;
onMount(() => {
	const image = new Image();
	image.onload = () => {
		// noinspection SpellCheckingInspection
		font = parseImage(
			image,
			"abcdefghiklmnoprstuvwxyABCDEFGHIJKLMNOPRSTUWX12,.",
			5,
		);
		const otfURL = generateOTF(font, true, 0.5, 1);
		document.fonts.add(new FontFace("DotMatrix", `url(${otfURL})`));
	};
	image.src = DotMatrixImage;
});
</script>

<FontDotMatrix text={pages[currentPageNumber]} mode={pages.length === 1 ? "scroll" : "center"} />
{#if font}
    <SVGDotMatrix {font} text={pages[currentPageNumber]} mode={pages.length === 1 ? "scroll" : "center"} />
{/if}