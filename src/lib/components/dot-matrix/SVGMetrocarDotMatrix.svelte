<script lang="ts">
import {
	METROCAR_DOT_MATRIX_WIDTH,
	type DotMatrixFont,
	type DotMatrixGlyph,
} from "$lib/components/dot-matrix";

let {
    font,
    text,
    circularDots = true,
    dotSize = 0.5,
    characterSpacing = 1,
    mode = "center",
    scrollSpeed = 50,
    scrollResetTime = 1000
}: {
    font: DotMatrixFont;
    text: string;
    circularDots?: boolean;
    dotSize?: number;
    characterSpacing?: number;
    mode?: "scroll" | "center" | "full";
    scrollSpeed?: number; // in columns per second
    scrollResetTime?: number; // in milliseconds
} = $props();

let emptyColumn = $derived(new Array(font.height).fill(false));
let emptyDisplay = $derived(new Array(METROCAR_DOT_MATRIX_WIDTH).fill(emptyColumn));
let scrollResetColumns = $derived(scrollResetTime / scrollSpeed);
let spacing = $derived(new Array(characterSpacing).fill(emptyColumn));

let renderedText: DotMatrixGlyph = $derived(
    text.split("")
		.flatMap((character) => {
			if (!(character in font.glyphs)) {
				if (" " in font.glyphs) {
					console.warn(`Character "${character}" not found in font`);
					character = " ";
				} else {
					throw new Error(
						`Character "${character}" not found in font, and space character could not be used as fallback`,
					);
				}
			}
			return [...spacing, ...font.glyphs[character]];
		})
		.slice(1)
);

let numScrollColumns = $derived(renderedText.length + METROCAR_DOT_MATRIX_WIDTH);

let renderedDisplay = $state([]) as boolean[][];
let scrollInterval: NodeJS.Timeout;
$effect(() => {
	clearInterval(scrollInterval);
	if (mode === "scroll") {
		renderedDisplay = emptyDisplay.slice();
		let x = 0;
		scrollInterval = setInterval(() => {
			if (x < numScrollColumns + scrollResetColumns) {
				if (x < numScrollColumns) {
					renderedDisplay = [...renderedDisplay.slice(1), renderedText[x]];
				}
				x++;
			} else {
				x = 0;
			}
		}, 1000 / scrollSpeed);
	} else if (mode === "center") {
		const padding = (METROCAR_DOT_MATRIX_WIDTH - renderedText.length) / 2;
		renderedDisplay = [
			...new Array(Math.floor(padding)).fill(emptyColumn),
			...renderedText,
			...new Array(Math.ceil(padding)).fill(emptyColumn),
		];
	} else {
		renderedDisplay = renderedText;
	}
});
</script>

<div style:--dot-matrix-height={font.height}>
    <svg viewBox={`-1 -.5 ${renderedDisplay.length+1} ${font.height}`} fill="#333">
        <defs>
            <!-- Styles are inlined so that they are kept if the SVG is copied -->
            <!--suppress CssUnusedSymbol -->
            <style>
                .lit {
                    fill: #fff;

                    /* TODO: Re-create the glow effect */
                }
            </style>
        </defs>
        {#each renderedDisplay as column, x (x)}
            {#each column as lit, y (y)}
                {#if circularDots}
                    <circle cx={x} cy={y} r={dotSize / 2} class:lit/>
                {:else}
                    <rect x={x-dotSize/2} y={y-dotSize/2} width={dotSize} height={dotSize} class:lit/>
                {/if}
            {/each}
        {/each}
    </svg>
</div>

<style>
    div {
        --total-dot-size: calc(1em / var(--dot-matrix-height));

        font-size: 2em;
        background-color: #393939;
        padding: var(--total-dot-size) 0;
        border: .25em solid #202020;
        margin: var(--total-dot-size);
        height: 1em;
    }

    svg {
        width: 100%;
        height: 1em;
    }
</style>