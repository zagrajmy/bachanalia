"""Keep the artist's drawing; borrow generated pixels only where text was.

Codex regenerated the whole canvas, rooster included. But the text, the logos
and the frame all sit on empty starfield — none of them overlap the bird — so
the generated image is only needed inside those patches. Everywhere else the
original survives untouched, eye and comb included.

The generated starfield is darker and more saturated than the original, which
turns every patch into a visible panel, so it is levelled onto the original's
statistics first. Sampled from background only: the transform has to describe
the night sky, not the bird.
"""

from PIL import Image, ImageDraw, ImageFilter

ORIGINAL = "key-art-original.jpg"
GENERATED = "key-art-generated.png"
OUT = "key-art-composite.png"

# Verified against regions.png: none of these contain rooster pixels.
PATCHES = [
    (18, 20, 296, 152),   # Ad Astra + Polcon marks
    (18, 246, 610, 414),  # XL / POLCON / BACHANALIA FANTASTYCZNE
    (18, 404, 655, 500),  # 25-27 WRZESNIA 2026 * KAMPUS B * ZIELONA GORA
]
FEATHER = 10  # starfield is forgiving; the swirls behind it are not

# The coral frame is cropped off, not painted over. Feathering a 13px band
# reached inward far enough to pull the generated comb over the real one —
# that was the doubled spike on the rooster's head — and left a violet halo
# where the pink bled through. Losing 16px of a background costs nothing.
TRIM = (16, 16, 1284, 484)

# Empty sky in both images, clear of text, logos, frame and bird. Sampling
# the tail feathers by mistake drags the whole transform toward blue.
SAMPLES = [(300, 160, 425, 245), (150, 165, 290, 240), (60, 160, 140, 240)]


def channel_stats(image, boxes):
    """Mean and spread per channel over the sample regions."""
    totals = [0.0, 0.0, 0.0]
    squares = [0.0, 0.0, 0.0]
    count = 0

    for box in boxes:
        pixels = image.crop(box).load()
        w, h = box[2] - box[0], box[3] - box[1]
        for y in range(0, h, 2):
            for x in range(0, w, 2):
                px = pixels[x, y]
                count += 1
                for c in range(3):
                    totals[c] += px[c]
                    squares[c] += px[c] * px[c]

    means = [t / count for t in totals]
    stds = [max((squares[c] / count - means[c] ** 2) ** 0.5, 1e-6) for c in range(3)]
    return means, stds


def level(source, target, boxes):
    """Linearly map source's background statistics onto target's."""
    src_mean, src_std = channel_stats(source, boxes)
    dst_mean, dst_std = channel_stats(target, boxes)

    tables = []
    for c in range(3):
        gain = dst_std[c] / src_std[c]
        tables.extend(
            min(255, max(0, round((v - src_mean[c]) * gain + dst_mean[c]))) for v in range(256)
        )

    print(
        "  levelled:",
        ", ".join(
            f"{ch} {src_mean[c]:.0f}->{dst_mean[c]:.0f} (x{dst_std[c]/src_std[c]:.2f})"
            for c, ch in enumerate("RGB")
        ),
    )
    return source.point(tables)


def main():
    original = Image.open(ORIGINAL).convert("RGB")
    generated = Image.open(GENERATED).convert("RGB")

    if generated.size != original.size:
        generated = generated.resize(original.size, Image.LANCZOS)

    generated = level(generated, original, SAMPLES)

    mask = Image.new("L", original.size, 0)
    draw = ImageDraw.Draw(mask)

    for patch in PATCHES:
        draw.rectangle(patch, fill=255)

    mask = mask.filter(ImageFilter.GaussianBlur(FEATHER))

    result = Image.composite(generated, original, mask).crop(TRIM)
    result.save(OUT)
    print(f"wrote {OUT} {result.size}")


if __name__ == "__main__":
    main()
