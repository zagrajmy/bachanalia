"""Did the edit keep the illustrator's rooster, or quietly redraw it?

Compares a candidate banner against the original. The left-hand patches are
*supposed* to change — that is where the text and the logos were — so they are
reported but not judged. The bird is the part that must survive.

    python3 verify.py key-art-original.jpg key-art-composite.png

Exits non-zero if the bird moved.
"""

import sys

from PIL import Image

TRIM_ORIGIN = (16, 16)

BIRD = (660, 22, 1284, 478)
ERASED = (22, 252, 604, 412)

MAX_MOVED_PCT = 0.5
MAX_MEAN_DELTA = 3.0


def region(original, candidate, offset, box, label):
    op, cp = original.load(), candidate.load()
    ox, oy = offset
    cw, ch = candidate.size

    total = moved = count = 0

    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            cx, cy = x - ox, y - oy
            if not (0 <= cx < cw and 0 <= cy < ch):
                continue
            delta = sum(abs(a - b) for a, b in zip(op[x, y], cp[cx, cy]))
            total += delta
            count += 1
            if delta > 60:
                moved += 1

    mean = total / count
    pct = 100.0 * moved / count
    print(f"  {label:8} mean|delta|={mean:6.2f}  pixels>60: {pct:5.2f}%")
    return mean, pct


def main():
    original = Image.open(sys.argv[1]).convert("RGB")
    candidate = Image.open(sys.argv[2]).convert("RGB")

    offset = TRIM_ORIGIN if candidate.size != original.size else (0, 0)
    print(f"original {original.size}  candidate {candidate.size}  offset {offset}")

    mean, pct = region(original, candidate, offset, BIRD, "bird")
    region(original, candidate, offset, ERASED, "erased")

    ok = pct < MAX_MOVED_PCT and mean < MAX_MEAN_DELTA
    print("\nVERDICT:", "bird intact" if ok else "BIRD REDRAWN — reject")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
