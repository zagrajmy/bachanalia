import { strict as assert } from "node:assert";
import { test } from "node:test";

import { mediaVariantUrl, pickMediaWidth } from "./mediaPaths";

test("picks the smallest width that covers the request", () => {
  assert.equal(pickMediaWidth(500, [256, 640, 1200]), 640);
  assert.equal(pickMediaWidth(2000, [256, 640, 1200]), 1200);
});

test("maps a media key onto a public WebP path", () => {
  assert.equal(
    mediaVariantUrl("/wp-content/uploads/2023/07/IMG_7508-2.jpg", 640),
    "/_img/wp-content/uploads/2023/07/IMG_7508-2/640.webp",
  );
});
