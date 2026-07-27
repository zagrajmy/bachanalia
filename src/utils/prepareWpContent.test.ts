import { strict as assert } from "node:assert";
import { test } from "node:test";

import { hasVisibleContent, prepareWpContent } from "./prepareWpContent";

const CAROUSEL = `<div class="elementor-image-carousel-wrapper swiper" role="region" aria-roledescription="carousel" aria-label="Karuzela obrazków" dir="ltr"><div class="elementor-image-carousel swiper-wrapper" aria-live="off"><div class="swiper-slide" role="group" aria-roledescription="slide" aria-label="1 z 11"><figure class="swiper-slide-inner"><img src="a.jpg" alt="a" /></figure></div></div></div>`;

test("drops carousel semantics that the static grid does not honour", () => {
  const out = prepareWpContent(CAROUSEL);

  assert.ok(!out.includes("aria-roledescription"));
  assert.ok(!out.includes("aria-live"));
  assert.ok(!out.includes('role="group"'));
  assert.ok(!out.includes('role="region"'));
  assert.ok(!out.includes("1 z 11"));
});

test("keeps the slide markup and the real content intact", () => {
  const out = prepareWpContent(CAROUSEL);

  assert.ok(out.includes('<div class="swiper-slide">'));
  assert.ok(out.includes('<img src="a.jpg" alt="a" />'));
  assert.ok(out.includes("elementor-image-carousel"));
});

test("leaves meaningful roles elsewhere alone", () => {
  const nav = '<nav role="navigation" aria-label="Menu"><a href="/x">x</a></nav>';

  assert.equal(prepareWpContent(nav), nav);
});

test("handles missing content", () => {
  assert.equal(prepareWpContent(null), "");
  assert.equal(prepareWpContent(undefined), "");
});

const ELEMENTOR_SHELL = `\t\t<div data-elementor-type="wp-page" class="elementor elementor-3230">
  <section class="elementor-section elementor-top-section"><div class="elementor-container">
  <div class="elementor-column"><div class="elementor-widget-wrap"></div></div></div></section></div>`;

test("an Elementor shell with no text counts as empty", () => {
  assert.equal(
    hasVisibleContent(ELEMENTOR_SHELL),
    false,
    "sztab-bachanaliowy ships 3kB of wrappers around nothing; a length check calls that content",
  );
});

test("pages carrying only images still count as content", () => {
  assert.equal(hasVisibleContent(`${ELEMENTOR_SHELL}<img src="logo.png" alt="">`), true);
});

test("real copy counts as content", () => {
  assert.equal(hasVisibleContent("<p>Zapraszamy na Bachanalia.</p>"), true);
});

test("whitespace and nbsp do not", () => {
  assert.equal(hasVisibleContent("<p> &nbsp; </p>"), false);
  assert.equal(hasVisibleContent(""), false);
  assert.equal(hasVisibleContent(null), false);
});
