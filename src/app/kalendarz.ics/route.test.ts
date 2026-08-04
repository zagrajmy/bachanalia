import assert from "node:assert";
import { test } from "bun:test";

import { GET } from "./route";

const body = async () => await (GET() as Response).text();

test("the last day is inside the event", async () => {
  const ics = await body();

  /** 27 IX is the last day, so an exclusive DTEND lands on the 28th. */
  assert.match(ics, /DTSTART;VALUE=DATE:20260925/);
  assert.match(ics, /DTEND;VALUE=DATE:20260928/);
});

test("commas in the address do not end the property", async () => {
  const ics = await body();
  const location = ics.split("\r\n").find((line) => line.startsWith("LOCATION:"));

  assert.ok(location);
  assert.ok(!/[^\\],/.test(location), `unescaped comma in ${location}`);
});

test("no line runs past what RFC 5545 allows", async () => {
  const ics = await body();

  for (const line of ics.split("\r\n")) {
    assert.ok(Buffer.byteLength(line) <= 75, `${Buffer.byteLength(line)} octets: ${line}`);
  }
});

test("a folded line continues with a space rather than starting a property", async () => {
  const ics = await body();
  const lines = ics.split("\r\n");

  /** Something has to be long enough to fold, or this proves nothing. */
  const folded = lines.filter((line) => line.startsWith(" "));
  assert.ok(folded.length > 0, "nothing folded, so folding is untested");

  for (const [at, line] of lines.entries()) {
    if (/^[A-Z-]+[:;]/.test(line) || line === "") continue;
    assert.ok(
      line.startsWith(" "),
      `line ${at} continues without a space: ${JSON.stringify(line)}`,
    );
  }
});

test("it downloads as a calendar", async () => {
  const response = GET() as Response;

  assert.match(response.headers.get("content-type") ?? "", /text\/calendar/);
  assert.match(response.headers.get("content-disposition") ?? "", /attachment/);
});
