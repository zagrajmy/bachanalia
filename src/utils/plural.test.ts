import { strict as assert } from "node:assert";
import { test } from "node:test";

import { counted } from "./plural";

const stoiska = { few: "stoiska", many: "stoisk", one: "stoisko" };

test("polish picks a different form for two through four", () => {
  assert.equal(counted(1, stoiska), "1 stoisko");
  assert.equal(counted(2, stoiska), "2 stoiska");
  assert.equal(counted(4, stoiska), "4 stoiska");
  assert.equal(counted(5, stoiska), "5 stoisk");
});

test("and again in every higher decade", () => {
  assert.equal(counted(22, stoiska), "22 stoiska");
  assert.equal(counted(25, stoiska), "25 stoisk");
  assert.equal(counted(102, stoiska), "102 stoiska");
});

test("the teens all take the many form", () => {
  assert.equal(counted(12, stoiska), "12 stoisk");
  assert.equal(counted(14, stoiska), "14 stoisk");
});

test("zero takes the many form", () => {
  assert.equal(counted(0, stoiska), "0 stoisk");
});
