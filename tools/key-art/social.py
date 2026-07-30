"""Build the Open Graph card from the key art.

The con distributes almost entirely through Facebook, so the share card is the
first thing most people ever see of this site. Rendered here rather than at
request time: it changes about once a year, and a static PNG needs no font
loading in an edge runtime.

    python3 social.py path/to/Karrik-Regular.ttf
"""

import sys
from PIL import Image, ImageDraw, ImageFont

ART = "key-art-composite.png"
NAVY = (25, 31, 92)
PAPER = (255, 255, 255)
CORAL = (238, 116, 137)

OG_SIZE = (1200, 630)
OG_OUT = "../../src/app/opengraph-image.png"

TITLE = ["Bachanalia", "Fantastyczne"]
EDITION = "XL"
DETAIL = "25-27 września 2026 · Zielona Góra"


def og_card(ttf):
    card = Image.new("RGB", OG_SIZE, NAVY)

    art = Image.open(ART).convert("RGB")
    band_h = 300
    scale = OG_SIZE[0] / art.width
    art = art.resize((OG_SIZE[0], round(art.height * scale)), Image.LANCZOS)
    card.paste(art.crop((0, 0, OG_SIZE[0], band_h)), (0, OG_SIZE[1] - band_h))

    draw = ImageDraw.Draw(card)
    title = ImageFont.truetype(ttf, 76)
    detail = ImageFont.truetype(ttf, 30)

    line_h = 72
    y = 40
    for line in [*TITLE, EDITION]:
        draw.text((64, y), line, font=title, fill=CORAL if line == EDITION else PAPER)
        y += line_h

    y += 14
    draw.text((64, y), DETAIL, font=detail, fill=(203, 187, 207))

    bottom = y + draw.textbbox((0, 0), DETAIL, font=detail)[3]
    assert bottom < OG_SIZE[1] - band_h, f"copy runs into the artwork at {bottom}px"

    card.save(OG_OUT)
    print(f"wrote {OG_OUT} {card.size}")


if __name__ == "__main__":
    ttf = sys.argv[1]
    og_card(ttf)
