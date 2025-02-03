<script lang="ts">
    import {
        DOT_MATRIX_HEIGHT,
        DOT_MATRIX_WIDTH,
        type DotMatrixFont,
        type DotMatrixGlyph
    } from "$lib/components/dot-matrix";

    const EMPTY_COLUMN = new Array(DOT_MATRIX_HEIGHT).fill(false);

    export let font: DotMatrixFont;
    export let text: string;
    export let circularDots = true;
    export let dotSize = .5;
    export let characterSpacing = 1;
    export let mode: 'scroll' | 'center' | 'full' = 'center';
    export let scrollSpeed = 50; // in columns per second
    export let scrollResetTime = 1000; // in milliseconds

    $: scrollResetColumns = scrollResetTime / scrollSpeed;
    $: spacing = new Array(characterSpacing).fill(EMPTY_COLUMN);

    let renderedText: DotMatrixGlyph;
    function renderText() {
        renderedText = text.split('')
            .flatMap(character => {
                if (!(character in font)) {
                    if (' ' in font) {
                        console.warn(`Character "${character}" not found in font`);
                        character = ' ';
                    } else {
                        throw new Error(`Character "${character}" not found in font, and space character could not be used as fallback`);
                    }
                }
                return [...spacing, ...font[character]];
            })
            .slice(1);
    }
    $: if (text && spacing) renderText();

    $: numScrollColumns = renderedText.length + DOT_MATRIX_WIDTH;

    let renderedDisplay: boolean[][];
    let scrollInterval: NodeJS.Timeout;
    function update() {
        clearInterval(scrollInterval);
        if (mode === 'scroll') {
            renderedDisplay = new Array(DOT_MATRIX_WIDTH).fill(EMPTY_COLUMN);
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
        } else if (mode === 'center') {
            const padding = (DOT_MATRIX_WIDTH - renderedText.length) / 2
            const paddingLeft = Math.floor(padding);
            const paddingRight = Math.ceil(padding);
            renderedDisplay = [
                ...new Array(paddingLeft).fill(EMPTY_COLUMN),
                ...renderedText,
                ...new Array(paddingRight).fill(EMPTY_COLUMN)
            ];
        } else {
            renderedDisplay = renderedText;
        }
    }
    $: if (renderedText) update();
</script>

<div style:--dot-matrix-height={DOT_MATRIX_HEIGHT}>
    <svg viewBox={`-1 -.5 ${renderedDisplay.length+1} ${DOT_MATRIX_HEIGHT}`} fill="#333">
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