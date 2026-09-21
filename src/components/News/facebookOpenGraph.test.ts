import { strict as assert } from "node:assert";
import { test } from "node:test";

import { facebookOpenGraphImage } from "./facebookOpenGraph";

test("extracts and decodes a Facebook post's Open Graph image", () => {
  assert.equal(
    facebookOpenGraphImage(`
      <meta content="Bachanalia Fantastyczne" property="og:title">
      <meta content='https://scontent-ber1-1.xx.fbcdn.net/photo.jpg?width=720&amp;frame=1' property='og:image'>
    `),
    "https://scontent-ber1-1.xx.fbcdn.net/photo.jpg?width=720&frame=1",
  );
});

test("rejects non-Facebook and malformed image URLs", () => {
  assert.equal(
    facebookOpenGraphImage('<meta property="og:image" content="https://example.com/photo.jpg">'),
    undefined,
  );
  assert.equal(facebookOpenGraphImage('<meta property="og:image" content="not a URL">'), undefined);
  assert.equal(facebookOpenGraphImage("<html></html>"), undefined);
});
