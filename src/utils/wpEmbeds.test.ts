import assert from "node:assert";
import { test } from "bun:test";

import { blockThirdPartyEmbeds } from "./wpEmbeds";

/** The three that are actually on the site today. */
const MAPS =
  '<iframe loading="lazy" src="https://maps.google.com/maps?q=Wojska%20Polskiego%2069&#038;t=m&#038;output=embed" title="Wojska Polskiego 69"></iframe>';
const FORM =
  '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLS/viewform?embedded=true" width="640"></iframe>';
const MIRO = '<iframe width="768" src="https://miro.com/app/live-embed/uXjVGBS67HU=/"></iframe>';

test("no third-party src survives", () => {
  for (const html of [MAPS, FORM, MIRO]) {
    const out = blockThirdPartyEmbeds(html);

    assert.ok(!/<iframe/i.test(out), `iframe left standing in ${out}`);
    assert.ok(!/\ssrc="http/i.test(out), `live src left standing in ${out}`);
  }
});

test("the url is kept for the visitor who says yes", () => {
  const out = blockThirdPartyEmbeds(MIRO);

  assert.match(out, /data-embed-src="https:\/\/miro\.com\/app\/live-embed\/uXjVGBS67HU=\/"/);
  assert.match(out, /href="https:\/\/miro\.com\/app\/live-embed\/uXjVGBS67HU=\/"/);
});

test("it names what is behind the curtain", () => {
  assert.match(blockThirdPartyEmbeds(MAPS), /Pokaż mapę/);
  assert.match(blockThirdPartyEmbeds(FORM), /Pokaż formularz/);
  assert.match(blockThirdPartyEmbeds(MIRO), /Pokaż tablicę/);
  assert.match(blockThirdPartyEmbeds(MAPS), /maps\.google\.com/);
});

test("our own embeds are left alone", () => {
  const ours = '<iframe src="https://bachanaliafantastyczne.pl/a/"></iframe>';

  assert.equal(blockThirdPartyEmbeds(ours), ours);
});

test("a relative src is nobody new", () => {
  const local = '<iframe src="/kalendarz/"></iframe>';

  assert.equal(blockThirdPartyEmbeds(local), local);
});

test("a url cannot end the attribute it is parked in", () => {
  const nasty = '<iframe src="https://evil.example/a?x=&quot; onload=&quot;alert(1)"></iframe>';
  const parked = /data-embed-src="([^"]*)"/.exec(blockThirdPartyEmbeds(nasty))?.[1];

  /**
   * The whole url has to come back out of one attribute. `&quot;` decodes to a
   * quote inside the value without closing it; a raw quote would close it, and
   * whatever followed would become an attribute of ours.
   */
  assert.equal(parked, "https://evil.example/a?x=&quot; onload=&quot;alert(1)");
});
