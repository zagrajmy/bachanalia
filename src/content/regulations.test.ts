import { strict as assert } from "node:assert";
import { test } from "node:test";

import { regulationSections } from "./regulations";

test("regulation sections cover every numbered point exactly once", () => {
  let expectedStart = 1;

  for (const section of regulationSections) {
    assert.equal(section.start, expectedStart);
    assert.equal(section.rules.length, section.end - section.start + 1);
    expectedStart = section.end + 1;
  }

  assert.equal(expectedStart, 48);
});

test("point two keeps rejestrując in the same paragraph", () => {
  assert.match(
    regulationSections[0].rules[1]!.text,
    /Bachanaliami\) rejestrując się jako uczestnik/,
  );
});
