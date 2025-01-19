<script lang="ts">
export let text: string;
// Text is split into pages by <>
// If the text is just one page, scroll the text
// Otherwise, cycle through each page, showing it centered for 2 seconds
$: pages = text.split("<>");

const BOARD_WIDTH = 18; // in characters
const SCROLL_SPEED = 10; // in characters per second

let currentPage: number;
let scrollInterval: NodeJS.Timeout;

function setText(_: string) {
	clearInterval(scrollInterval);
	currentPage = 0;
	scrollInterval = setInterval(() => {
		currentPage = (currentPage + 1) % pages.length;
	}, 2000);
}
$: setText(text); // So that it only reacts to `text`
</script>

<div
        class:scroll={pages.length === 1}
        style:--board-width={BOARD_WIDTH+"ch"}
        style:--scroll-duration={((text.length+BOARD_WIDTH)/SCROLL_SPEED)+'s'}
>
    {#key text} <!-- Restart scroll -->
        <p>{pages[currentPage]}</p>
    {/key}
</div>

<style lang="scss">
p {
    width: fit-content;
    font-family: monospace;
    color: #fa0;
    white-space: nowrap;
}

div {
    background-color: black;
    border: .2em solid #eee;
    width: var(--board-width);
    height: 1em;
    overflow: hidden;
    font-size: 2em;

    &:not(.scroll) {
        display: flex;
        justify-content: center;
    }

    &.scroll > p {
        animation: scroll var(--scroll-duration) linear infinite;
    }
}

@keyframes scroll {
    0% {
        transform: translateX(calc(var(--board-width) + 2ch)) /* Not sure why 2ch is needed */
    }

    100% {
        transform: translateX(calc(-100% - 9ch)) /* -9ch to add a gap between repeats */
    }
}
</style>