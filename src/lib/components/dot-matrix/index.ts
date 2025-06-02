import opentype from "opentype.js";

export const METROCAR_DOT_MATRIX_WIDTH = 96;

export type DotMatrixGlyph = boolean[][];
export type DotMatrixFont = {
	height: number;
	glyphs: Record<string, DotMatrixGlyph>;
}

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

	const font: DotMatrixFont = {
		height: image.height,
		glyphs: {},
	};
	let currChar = [];
	let numChars = 0;
	for (let x = 0; x < image.width; x++) {
		if (data[x * 4] === 128) {
			// Column is a separator
			if (numChars++ < expectedCharacters.length) {
				font.glyphs[expectedCharacters[numChars-1]] = currChar;
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
	if (numChars < expectedCharacters.length) {
		// Add last character
		font.glyphs[expectedCharacters[numChars++]] = currChar;
	}

	if (numChars !== expectedCharacters.length) {
		console.warn(`Expected ${expectedCharacters.length} characters, but found ${numChars}`);
	}

	if (!font.glyphs[" "]) {
		font.glyphs[" "] = new Array(spaceWidth).fill(
			new Array(image.height).fill(false),
		);
	}

	return font;
}

export const UNITS_PER_EM = 1000;
const KAPPA = (4 * (Math.sqrt(2) - 1)) / 3;

export function generateOTF(
	font: DotMatrixFont,
	fontFamilyName: string,
	circularDots: boolean,
	dotSize: number,
	characterSpacing: number,
) {
    const totalDotSize = UNITS_PER_EM / font.height;
	const dotDiameter = totalDotSize * dotSize;
	const dotPaddingRatio = (1 - dotSize) / 2;

	const glyphs = [
		new opentype.Glyph({
			name: ".notdef",
			unicode: 0,
			advanceWidth: totalDotSize,
			path: new opentype.Path(),
		}),
	];
	for (const [character, charData] of Object.entries(font.glyphs)) {
		const path = new opentype.Path();
		for (let fromX = 0; fromX < charData.length; fromX++) {
			const toX = fromX + characterSpacing / 2;
			const x1 = (toX + dotPaddingRatio) * totalDotSize;
			const x2 = x1 + dotDiameter;
            const column = charData[fromX];

			for (let fromY = 0; fromY < column.length; fromY++) {
				if (column[fromY]) {
					const toY = column.length - 3 - fromY; // Invert Y axis
					const y1 = (toY + dotPaddingRatio) * totalDotSize;
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
			advanceWidth: totalDotSize * (charData.length + characterSpacing),
			path,
		});
		glyphs.push(glyph);
	}

	const otf = new opentype.Font({
		familyName: fontFamilyName,
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
