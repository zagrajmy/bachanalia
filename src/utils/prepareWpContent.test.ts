import { strict as assert } from "node:assert";
import { test } from "node:test";

import { prepareWpContent } from "./prepareWpContent";

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
