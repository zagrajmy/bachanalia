import { strict as assert } from "node:assert";
import { test } from "node:test";

import { lqipRelPath, wpMediaKey } from "./lqipPath";

test("maps WordPress upload paths to mirrored .webp files", () => {
  assert.equal(
    lqipRelPath("/wp-content/uploads/2023/07/IMG_7508-2.jpg"),
    "wp-content/uploads/2023/07/IMG_7508-2.webp",
  );
});

test("maps Facebook post ids under fb/", () => {
  assert.equal(lqipRelPath("fb:1428257552668162"), "fb/1428257552668162.webp");
});

test("collapses WordPress size variants onto one key", () => {
  assert.equal(
    wpMediaKey("https://x.test/wp-content/uploads/2024/05/photo-1024x768.jpg"),
    "/wp-content/uploads/2024/05/photo.jpg",
  );
});
