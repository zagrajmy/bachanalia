# Where `src/content/key-art.png` comes from

The XL banner ships with the con's name, the two marks and a coral frame
painted into it, which makes it unusable as a site background. This is how the
clean version was derived, kept here so the result can be re-checked rather
than trusted.

| File                    | What it is                                                    |
| ----------------------- | ------------------------------------------------------------- |
| `key-art-original.jpg`  | The illustrator's banner, as WordPress serves it              |
| `prompt.txt`            | What Codex's image model was asked to do                      |
| `key-art-generated.png` | What it returned — **the rooster in this file is a redraw**   |
| `composite.py`          | Puts the original rooster back and keeps only the emptied sky |
| `verify.py`             | Proves the bird survived                                      |

## The trap

Asked to erase the text and leave the bird alone, the image model regenerated
the entire canvas. The result is convincing at a glance and wrong up close:
the comb spikes are rearranged, the wattle is a different shape, the star in
the eye is redrawn. A second model asked to eyeball the two images said the
geometry matched and the difference was "mostly colour". It was not — the
pixel diff put 52% of the bird's area past the threshold.

So the generated image is used only where nothing was drawn. `composite.py`
masks the three patches that held the text and the logos, levels the generated
sky onto the original's colour statistics (it comes back darker and more
saturated, which otherwise reads as visible panels), and crops the frame off
rather than painting over it — feathering a 13px band reached far enough
inward to drag the generated comb over the real one.

## Re-running

```sh
cd tools/key-art
python3 composite.py                                        # writes key-art-composite.png
python3 verify.py key-art-original.jpg key-art-composite.png
cp key-art-composite.png ../../src/content/key-art.png
```

`verify.py` exits non-zero if the bird moved, so it can gate a change to the
artwork. On the two files here it says:

| Candidate               | bird mean Δ | pixels > 60 | Verdict      |
| ----------------------- | ----------- | ----------- | ------------ |
| `key-art-composite.png` | 0.02        | 0.00%       | bird intact  |
| `key-art-generated.png` | 131.04      | 53.75%      | BIRD REDRAWN |

It compares at the crop offset rather than resizing the candidate back up —
rescaling smears every pixel and both files then look equally "corrupted".
