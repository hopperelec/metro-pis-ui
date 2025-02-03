<script lang="ts">
import {
	DOT_MATRIX_HEIGHT,
	DOT_MATRIX_WIDTH,
} from "$lib/components/dot-matrix/index";

export let text: string;
export let circularDots = true;
export let dotSize = 0.5;
export let mode: "scroll" | "center" | "full" = "center";
export let scrollSpeed = 50; // in columns per second
export let scrollResetTime = 1000; // in milliseconds

$: scrollResetColumns = scrollResetTime / scrollSpeed;
$: numScrollColumns = text.length * 6 + DOT_MATRIX_WIDTH; // Approximate

let scrollInterval: NodeJS.Timeout;
let scrollPosition = 0;
function resetScroll() {
	clearInterval(scrollInterval);
	if (mode === "scroll") {
		scrollPosition = 0;
		scrollInterval = setInterval(() => {
			if (scrollPosition < numScrollColumns + scrollResetColumns) {
				scrollPosition++;
			} else {
				scrollPosition = 0;
			}
		}, 1000 / scrollSpeed);
	}
}
$: if (text && mode) resetScroll();
</script>

<div id="container"
     class:scroll={mode === 'scroll'} class:center={mode === 'center'} class:full={mode === 'full'}
     style:--dot-size={dotSize}
     style:--dot-matrix-height={DOT_MATRIX_HEIGHT} style:--dot-matrix-width={DOT_MATRIX_WIDTH}
     style:--scroll-position={scrollPosition}
>
    <div id="background" class:circular-dots={circularDots}></div>
    <div id="scroll-container">
        <p id="text">{text}</p>
    </div>
    {#if mode === 'full'}
        <!-- Used for the width of the container, since actual text needs `position: absolute` -->
        <p id="hidden-text">{text}</p>
    {/if}
</div>

<style>
    #background {
        width: 100%; /* For if mode is 'full' */
        background-image: conic-gradient(
                transparent 0deg,
                #333 0deg 90deg,
                transparent 90deg 180deg,
                transparent 180deg
        );
        background-size: var(--total-dot-size) var(--total-dot-size);
        background-position: var(--dot-radius) var(--dot-radius);

        &.circular-dots {
            background-image: radial-gradient(circle, #333 var(--dot-radius), transparent 0);
            background-position: center;
        }
    }

    #background, #scroll-container {
        position: absolute;
        height: 1em;
    }

    #scroll-container {
        /* Sadly, the shadow/glow from clipped text is still visible */
        clip-path: inset(0 var(--dot-radius) 0 var(--dot-radius));
    }

    p {
        text-wrap: nowrap;
    }

    #container {
        --total-dot-size: calc(1em / var(--dot-matrix-height));
        --dot-radius: calc(var(--total-dot-size) * var(--dot-size) / 2);

        /* Why doesn't CSS let you configure shadow brightness? */
        text-shadow:
                var(--outer-glow), var(--outer-glow), var(--outer-glow),
                var(--inner-glow), var(--inner-glow), var(--inner-glow), var(--inner-glow),
                var(--inner-glow), var(--inner-glow), var(--inner-glow), var(--inner-glow),
                var(--inner-glow), var(--inner-glow), var(--inner-glow), var(--inner-glow);
        --outer-glow: #fb0 0 0 .16em;
        --inner-glow: #b50 0 0 .02em;

        font-size: 2em;
        height: 1em;
        color: #fff;
        font-family: DotMatrix, monospace;
        background-color: #393939;
        padding: var(--total-dot-size);
        border: .25em solid #202020;
        margin: var(--total-dot-size);
        position: relative;
        overflow: hidden;

        &.scroll > #scroll-container > p {
            position: absolute;
            left: calc((var(--dot-matrix-width) - var(--scroll-position)) * var(--total-dot-size));
        }

        &.center {
            /* Sadly, this doesn't align with the background if the text has an odd number of columns */
            text-align: center;
        }

        &:not(.full) {
            &, & > #scroll-container, & > #background {
                width: calc(var(--dot-matrix-width) * var(--total-dot-size));
            }
        }
    }

    #hidden-text {
        visibility: hidden;
    }
</style>