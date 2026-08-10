import { strict as assert } from "node:assert";
import { test } from "node:test";

import { measureLogo, readsOnDark } from "./logoContrast";

const rgba = (pixels: number[][]) => Uint8Array.from(pixels.flat());

test("a dark mark on transparency needs the plate", () => {
  const measured = measureLogo(
    rgba([
      [20, 20, 30, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]),
    4,
  );

  assert.equal(readsOnDark(measured), false);
});

test("a light mark on transparency is already dark-ready", () => {
  const measured = measureLogo(
    rgba([
      [240, 240, 235, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]),
    4,
  );

  assert.equal(readsOnDark(measured), true);
});

test("a dark mark that carries its own white ground keeps it", () => {
  const measured = measureLogo(
    rgba([
      [10, 10, 10, 255],
      [255, 255, 255, 255],
      [255, 255, 255, 255],
      [255, 255, 255, 255],
    ]),
    4,
  );

  assert.equal(measured.transparentShare, 0);
  assert.equal(readsOnDark(measured), true);
});

test("an opaque image without an alpha channel is left alone", () => {
  const measured = measureLogo(Uint8Array.from([12, 12, 12, 30, 30, 30]), 3);

  assert.equal(measured.transparentShare, 0);
  assert.equal(readsOnDark(measured), true);
});

test("fully transparent pixels do not drag the mean down", () => {
  const measured = measureLogo(
    rgba([
      [250, 250, 250, 255],
      [0, 0, 0, 0],
    ]),
    4,
  );

  assert.equal(measured.meanLuminance > 200, true);
});
