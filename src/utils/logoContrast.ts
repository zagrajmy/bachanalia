/**
 * Exhibitor logos arrive as whatever the exhibitor had: light marks drawn for
 * dark backgrounds, dark marks on transparency, and flat exports that carry
 * their own white ground. Only the middle kind disappears on the dark card, so
 * only that kind earns a paper plate behind it.
 */

/** Below this the pixel counts as see-through rather than faintly drawn. */
const TRANSPARENT_ALPHA = 32;

/** Under this share of see-through pixels the image supplies its own ground. */
const OPAQUE_SHARE = 0.15;

/** Mean luminance, 0–255, under which the ink is too dark for navy stock. */
const DARK_INK = 110;

export type LogoPixels = {
  /** Mean luminance of the pixels that are actually drawn, 0–255. */
  meanLuminance: number;
  /** Share of pixels that are see-through, 0–1. */
  transparentShare: number;
};

export function readsOnDark({ meanLuminance, transparentShare }: LogoPixels) {
  if (transparentShare < OPAQUE_SHARE) return true;
  return meanLuminance >= DARK_INK;
}

/** Rec. 709 luma, which is what "how light does this look" means here. */
const luminance = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Always RGBA: the caller runs `ensureAlpha()` before handing pixels over. */
export function measureLogo(pixels: Buffer | Uint8Array): LogoPixels {
  let drawnLuminance = 0;
  let drawn = 0;
  let transparent = 0;

  for (let i = 0; i + 4 <= pixels.length; i += 4) {
    if (pixels[i + 3] < TRANSPARENT_ALPHA) {
      transparent += 1;
      continue;
    }
    drawnLuminance += luminance(pixels[i], pixels[i + 1], pixels[i + 2]);
    drawn += 1;
  }

  const total = drawn + transparent;
  return {
    meanLuminance: drawn === 0 ? 0 : drawnLuminance / drawn,
    transparentShare: total === 0 ? 0 : transparent / total,
  };
}
