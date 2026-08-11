import { strict as assert } from "node:assert";
import { test } from "node:test";

import { hasVisibleContent, prepareWpContent, splitWpContent } from "./prepareWpContent";

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

/** The shape WordPress actually ships: the carousel is four wrappers deep. */
const PAGE = `<div class="elementor elementor-3230">
<section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-widget elementor-widget-text-editor"><div class="elementor-widget-container"><p>Bachanalia to konwent.</p></div></div>
</div></div></div></section>
<section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-widget elementor-widget-image-carousel" data-settings="{&quot;slides_to_show&quot;:&quot;1&quot;}"><div class="elementor-widget-container">
<div class="elementor-image-carousel-wrapper swiper" dir="ltr"><div class="elementor-image-carousel swiper-wrapper">
<div class="swiper-slide"><figure class="swiper-slide-inner"><img decoding="async" class="swiper-slide-image" src="https://wp.example/a.jpg" alt="IMG_1" /></figure></div><div class="swiper-slide"><figure class="swiper-slide-inner"><img decoding="async" class="swiper-slide-image" src="https://wp.example/b.jpg" alt="IMG_2" /></figure></div>
</div></div></div></div>
</div></div></div></section>
<section class="elementor-section"><div class="elementor-container"><div class="elementor-column"><div class="elementor-widget-wrap">
<div class="elementor-widget elementor-widget-text-editor"><div class="elementor-widget-container"><p>Do zobaczenia.</p></div></div>
</div></div></div></section>
</div>`;

test("lifts a carousel out as its own segment, in document order", () => {
  const segments = splitWpContent(PAGE);

  assert.deepEqual(
    segments.map((segment) => segment.type),
    ["html", "gallery", "html"],
  );
  assert.ok(segments[0]!.type === "html" && segments[0]!.html.includes("Bachanalia to konwent."));
  assert.ok(segments[2]!.type === "html" && segments[2]!.html.includes("Do zobaczenia."));
});

test("carries every slide's source and alt across", () => {
  const gallery = splitWpContent(PAGE)[1]!;

  assert.equal(gallery.type, "gallery");
  // oxlint-disable-next-line typescript/no-unnecessary-condition -- asserting the discriminant is the point of the line above
  assert.deepEqual(gallery.type === "gallery" ? gallery.images : [], [
    { src: "https://wp.example/a.jpg", alt: "IMG_1" },
    { src: "https://wp.example/b.jpg", alt: "IMG_2" },
  ]);
});

test("no carousel markup survives into the HTML segments", () => {
  for (const segment of splitWpContent(PAGE)) {
    if (segment.type !== "html") continue;

    assert.ok(!segment.html.includes("swiper-slide"), "slides belong to the gallery segment");
    assert.ok(!segment.html.includes("<img"), "so do their images");
  }
});

const tagCounts = (html: string) => ({
  opened: (html.match(/<(?!\/)[a-z]/g) ?? []).length - (html.match(/<img\b/g) ?? []).length,
  closed: (html.match(/<\//g) ?? []).length,
});

test("both halves stay balanced across the cut", () => {
  for (const segment of splitWpContent(PAGE)) {
    if (segment.type !== "html") continue;

    const { opened, closed } = tagCounts(segment.html);
    assert.equal(opened, closed, `unbalanced chunk: ${segment.html}`);
  }
});

test("a page without a carousel comes back as one chunk, byte for byte", () => {
  const plain = "<p>Regulamin</p>";

  assert.deepEqual(splitWpContent(plain), [{ type: "html", html: plain }]);
});

test("splitting still drops the carousel semantics prepareWpContent removes", () => {
  const gallery = splitWpContent(CAROUSEL)[0]!;

  assert.equal(gallery.type, "gallery");
  // oxlint-disable-next-line typescript/no-unnecessary-condition -- asserting the discriminant is the point of the line above
  assert.equal(gallery.type === "gallery" ? gallery.images.length : 0, 1);
});

test("wrappers around nothing but a carousel yield only the gallery", () => {
  const segments = splitWpContent(PAGE.replaceAll(/<p>[^<]*<\/p>/g, ""));

  assert.deepEqual(
    segments.map((segment) => segment.type),
    ["gallery"],
  );
});

test("an Elementor shell with no carousel and no copy yields nothing to render", () => {
  assert.deepEqual(splitWpContent(ELEMENTOR_SHELL), []);
  assert.deepEqual(splitWpContent(null), []);
});
