import opentype from "opentype.js";

export const DOT_MATRIX_HEIGHT = 9;
export const DOT_MATRIX_WIDTH = 96;

export type DotMatrixGlyph = boolean[][];
export type DotMatrixFont = Record<string, DotMatrixGlyph>;

export function parseImage(
	image: HTMLImageElement,
	expectedCharacters: string,
	spaceWidth: number,
) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not get 2d context");

	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	ctx.drawImage(image, 0, 0);
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

	const glyphs = {} as DotMatrixFont;
	let currChar = [];
	let numChars = 0;
	for (let x = 0; x < image.width; x++) {
		if (data[x * 4] === 128) {
			// Column is a separator
			if (numChars++ < expectedCharacters.length) {
				glyphs[expectedCharacters[numChars-1]] = currChar;
			}
			currChar = [];
		} else {
			let currCol = [];
			for (let y = 0; y < image.height; y++) {
				const red = data[(y * image.width + x) * 4];
				if (red === 0) {
					currCol.push(false);
				} else if (red === 255) {
					currCol.push(true);
				} else {
					throw new Error(`Invalid red channel value at (${x}, ${y}): ${red}`);
				}
			}
			currChar.push(currCol);
		}
	}
	if (numChars++ < expectedCharacters.length) {
		// Add last character
		glyphs[expectedCharacters[numChars]] = currChar;
	}

	if (numChars !== expectedCharacters.length) {
		console.warn(`Expected ${expectedCharacters.length} characters, but found ${numChars}`);
	}

	if (!glyphs[" "]) {
		glyphs[" "] = new Array(spaceWidth).fill(
			new Array(DOT_MATRIX_HEIGHT).fill(false),
		);
	}

	return glyphs;
}

export const UNITS_PER_EM = 1000;
export const TOTAL_DOT_SIZE = UNITS_PER_EM / DOT_MATRIX_HEIGHT;
const KAPPA = (4 * (Math.sqrt(2) - 1)) / 3;

export function generateOTF(
	font: DotMatrixFont,
	circularDots: boolean,
	dotSize: number,
	characterSpacing: number,
) {
	const dotDiameter = TOTAL_DOT_SIZE * dotSize;
	const dotPaddingRatio = (1 - dotSize) / 2;

	const glyphs = [
		new opentype.Glyph({
			name: ".notdef",
			unicode: 0,
			advanceWidth: TOTAL_DOT_SIZE,
			path: new opentype.Path(),
		}),
	];
	for (const [character, charData] of Object.entries(font)) {
		const path = new opentype.Path();
		for (let fromX = 0; fromX < charData.length; fromX++) {
			const toX = fromX + characterSpacing / 2;
			const x1 = (toX + dotPaddingRatio) * TOTAL_DOT_SIZE;
			const x2 = x1 + dotDiameter;

			for (let fromY = 0; fromY < charData[fromX].length; fromY++) {
				if (charData[fromX][fromY]) {
					const toY = DOT_MATRIX_HEIGHT - 3 - fromY; // Invert Y axis
					const y1 = (toY + dotPaddingRatio) * TOTAL_DOT_SIZE;
					const y2 = y1 + dotDiameter;

					if (circularDots) {
						const dotRadius = dotDiameter / 2;
						const cx = x1 + dotRadius;
						const cy = y1 + dotRadius;

						path.moveTo(cx, y1);
						path.curveTo(
							cx + dotRadius * KAPPA,
							y1,
							x2,
							cy - dotRadius * KAPPA,
							x2,
							cy,
						);
						path.curveTo(
							x2,
							cy + dotRadius * KAPPA,
							cx + dotRadius * KAPPA,
							y2,
							cx,
							y2,
						);
						path.curveTo(
							cx - dotRadius * KAPPA,
							y2,
							x1,
							cy + dotRadius * KAPPA,
							x1,
							cy,
						);
						path.curveTo(
							x1,
							cy - dotRadius * KAPPA,
							cx - dotRadius * KAPPA,
							y1,
							cx,
							y1,
						);
					} else {
						path.moveTo(x1, y1);
						path.lineTo(x2, y1);
						path.lineTo(x2, y2);
						path.lineTo(x1, y2);
						path.lineTo(x1, y1);
					}
					path.closePath();
				}
			}
		}

		const glyph = new opentype.Glyph({
			name: character,
			unicode: character.charCodeAt(0),
			advanceWidth: TOTAL_DOT_SIZE * (charData.length + characterSpacing),
			path,
		});
		glyphs.push(glyph);
	}

	const otf = new opentype.Font({
		familyName: "MetrocarDotMatrix",
		styleName: "Regular",
		unitsPerEm: UNITS_PER_EM,
		ascender: UNITS_PER_EM * 0.8,
		descender: -UNITS_PER_EM * 0.2,
		glyphs,
	});

	return URL.createObjectURL(
		new Blob([otf.toArrayBuffer()], { type: "font/opentype" }),
	);
}

// The two functions below were originally going to be how I compressed the dot matrix image
// before being sent to the client for the `/routes` page. However:
// - `cwebp -z 9` is about as effective
// - that's not including the code needed to un-compress the image
// - I couldn't get limited run lengths working as expected, which is where I would expect the most savings
// I mostly just wrote this for fun and I left it here because I'm still pretty happy with it.

// Notes about the RLE:
// - it resets for each character
// - it assumes that the first pixel of each character is unlit
// - it alternates between runs of lit and unlit pixels
// If the first pixel is lit, this can be encoded by having the first run be of length 0.

export function encodeFontBin(characters: DotMatrixFont) {
	const orderedCharacters = Object.entries(characters);
	const flatGlyphs = orderedCharacters.map((char) => char[1].flat());
	const characterSet = orderedCharacters.map((char) => char[0]).join("");

	// First, try encoding the glyphs, without RLE, using base 3 (0 for unlit, 1 for lit, 2 for delimiter)
	const uncompressedEncoding = flatGlyphs
		.flatMap((flatGlyph) => [2n, ...flatGlyph.map((lit) => (lit ? 1n : 0n))])
		// Remove the leading delimiter
		.slice(1)
		// Convert the array of digits to a BigInt
		.reduce((acc, digit) => acc * 3n + digit, 0n);

	// First, perform a normal RLE (no run length limit or delimiter)
	const originalRLE = flatGlyphs.map((flatGlyph) => {
		let currentRunLength = 0;
		let currentPixel = false;
		const subEncoding = [];
		for (const pixel of flatGlyph) {
			if (pixel === currentPixel) {
				currentRunLength++;
			} else {
				subEncoding.push(currentRunLength);
				currentRunLength = 1;
				currentPixel = pixel;
			}
		}
		subEncoding.push(currentRunLength);
		return subEncoding;
	});
	const highestRunLength = Math.max(...originalRLE.flat());

	// Find the most space-efficient RLE (or lack thereof) by limiting the run length
	let bestRLE = {
		runLengthLimit: 0, // Use run length limit of 0 to indicate no RLE
		encoding: uncompressedEncoding,
		binaryLength: uncompressedEncoding.toString(2).length,
	};
	const maxAllowedRunLength = Math.min(2 ** 8 - 1, highestRunLength);
	for (
		let runLengthLimit = 2;
		runLengthLimit <= maxAllowedRunLength;
		runLengthLimit++
	) {
		// Encode the RLE as a BigInt in base `runLengthLimit+1`
		const base = BigInt(runLengthLimit + 1); // +1 to account for the delimiter
		const encoding = originalRLE
			.flatMap((originalSubEncoding) => {
				// This map does three things:
				// #1 add a delimiter (0) between each sub-encoding
				// #2 split the sub-encoding into runs of at most `runLengthLimit`,
				//    putting a 0 run between each split
				// #3 add 1 to each run length since 0 is reserved for the delimiter
				const newSubEncoding = [0]; // #1
				for (let remainingRunLength of originalSubEncoding) {
					while (remainingRunLength > runLengthLimit) {
						newSubEncoding.push(
							runLengthLimit + 1, // #3
							1, // #2 and #3
						);
						remainingRunLength -= runLengthLimit;
					}
					newSubEncoding.push(
						remainingRunLength + 1, // #3
					);
				}
				// Flatten the new encoding into an array of digits
				return newSubEncoding;
			})
			// Remove the leading delimiter
			.slice(1)
			// Convert the array of digits to a single BigInt
			.reduce((acc, digit) => acc * base + BigInt(digit), 0n);

		const binaryLength = encoding.toString(2).length;
		if (binaryLength < bestRLE.binaryLength) {
			bestRLE = { runLengthLimit, encoding, binaryLength };
		}
	}

	// Prepare the binary buffer
	const binData = new Uint8Array(
		characterSet.length + // Character codes
			2 + // separator and `runLengthLimit`
			Math.ceil(bestRLE.binaryLength / 8), // RLE
	);

	// Start file with the character codes
	for (let i = 0; i < characterSet.length; i++) {
		binData[i] = characterSet.charCodeAt(i);
	}

	// Then add `runLengthLimit`
	// Add 1 to index to leave an empty (0) byte (the separator)
	binData[characterSet.length + 1] = bestRLE.runLengthLimit;

	// Finally, add the RLE
	let byteIndex = binData.length;
	while (bestRLE.encoding > 0) {
		binData[--byteIndex] = Number(bestRLE.encoding & 0xffn);
		bestRLE.encoding >>= 8n;
	}

	return binData;
}

export function decodeFontBin(binData: Uint8Array): DotMatrixFont {
	// Parse the binary data
	const firstZero = binData.indexOf(0);
	switch (firstZero) {
		case -1:
			throw new Error("Dot matrix binary is missing first separator");
		case 0:
			throw new Error("Dot matrix binary is missing character set");
		case binData.length - 1:
			throw new Error("Dot matrix binary is missing max run length and RLE");
		case binData.length - 2:
			throw new Error("Dot matrix binary is missing RLE");
	}

	const characterSet = String.fromCharCode(...binData.slice(0, firstZero));

	const runLengthLimit = binData[firstZero + 1];
	if (runLengthLimit === 1) throw new Error("Run length limit cannot be 1");
	const base = BigInt(runLengthLimit + 1);

	let encoding = binData
		.slice(firstZero + 2)
		.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);

	// Get digits of encoding
	// Must do this first because they are read in reverse order
	const digits = [];
	while (encoding > 0) {
		digits.push(Number(encoding % base));
		encoding /= base;
	}
	digits.reverse();

	// Decode the digits
	const flatGlyphs = [] as boolean[][];
	let currentGlyph = [] as boolean[];
	if (runLengthLimit === 0) {
		// No RLE
		for (const digit of digits) {
			if (digit === 2) {
				flatGlyphs.push(currentGlyph);
				currentGlyph = [];
			} else {
				currentGlyph.push(digit === 1);
			}
		}
	} else {
		// RLE
		let currentRun = false;
		for (const digit of digits) {
			if (digit === 0) {
				flatGlyphs.push(currentGlyph);
				currentGlyph = [];
				currentRun = false;
			} else {
				const runLength = digit - 1;
				currentGlyph.push(...Array(runLength).fill(currentRun));
				currentRun = !currentRun;
			}
		}
		flatGlyphs.push(currentGlyph);
	}

	// Un-flatten the glyphs and zip them with the character set
	return characterSet.split("").reduce(
		(acc, char, index) => {
			const flatGlyph = flatGlyphs[index];
			acc[char] = [];
			for (let i = 0; i < flatGlyph.length; i += DOT_MATRIX_HEIGHT) {
				acc[char].push(flatGlyph.slice(i, i + DOT_MATRIX_HEIGHT));
			}
			return acc;
		},
		{} as Record<string, boolean[][]>,
	);
}
