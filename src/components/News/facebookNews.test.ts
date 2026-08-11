import { strict as assert } from "node:assert";
import { test } from "node:test";

import { parseFeedItems } from "./facebookFeed";

/** Two items as Custom Facebook Feed renders them, trimmed to what we read. */
const FEED = `<div class="cff-posts-wrap"><div class="cff-item cff-photo-post cff-box author-bachanalia-fantastyczne cff-347748351932621 cff-new" id="cff_347748351932621_1440582534768997" data-page-id="347748351932621" data-cff-timestamp="1785434413" data-object-id="1440582491435668">
  <div class="cff-author"><div class="cff-date " > 2 days ago </div></div>
  <p class="cff-post-text">
  <span class="cff-text" data-color="">Czy intryguj&#261; Was starsze samochody&#10067; Jeśli tak, to posta&#263; <a href="https://facebook.com/121600797526778" rel="nofollow noopener">GratoWied&#378;ma</a> na pewno nie jest Wam obca&#10071;<br /><br />Dominika Błaszczyk &#8211; dziennikarka i pisarka. <a href="https://facebook.com/674600489313773" rel="nofollow noopener">#bachanaliafantastyczne</a> <a href="https://facebook.com/406571989457707" rel="nofollow noopener">#BF26</a></span></p>
  <div class="cff-media-wrap"><div class="cff-photos nofancybox" data-img-src-set="[{&quot;130&quot;:&quot;https:\\/\\/scontent-waw2-2.xx.fbcdn.net\\/v\\/t39.30808-6\\/760146935_n.jpg?stp=dst-jpg_p130x130&amp;oe=6A735E7D&quot;,&quot;720&quot;:&quot;https:\\/\\/scontent-waw2-2.xx.fbcdn.net\\/v\\/t39.30808-6\\/760146935_n.jpg?stp=dst-jpg_p720x720&amp;oe=6A735E7D&quot;}]"></div></div>
</div><div class="cff-item cff-status-post cff-box" id="cff_347748351932621_1436499999999999" data-cff-timestamp="1785175206">
  <p class="cff-post-text"><span class="cff-text" data-color="">Zg&#322;oszenia programowe zaktualizowane i ZAMKNI&#280;TE&#10071; Przysz&#322;y do nas dziesi&#261;tki propozycji.</span></p>
</div><div class="cff-clear"></div></div>`;

test("builds a permalink out of the page and post ids", () => {
  const items = parseFeedItems(FEED);
  const first = items[0]!;
  const second = items[1]!;

  assert.equal(first.href, "https://www.facebook.com/347748351932621/posts/1440582534768997");
  assert.equal(second.href, "https://www.facebook.com/347748351932621/posts/1436499999999999");
  assert.equal(first.external, true);
});

test("dates a post from the feed's own timestamp", () => {
  const first = parseFeedItems(FEED)[0]!;

  assert.equal(first.dateTime, new Date(1_785_434_413 * 1000).toISOString());
  assert.match(first.date, /2026/);
});

test("titles a post with its opening sentence and keeps the rest as the excerpt", () => {
  const second = parseFeedItems(FEED)[1]!;

  assert.equal(second.title, "Zgłoszenia programowe zaktualizowane i ZAMKNIĘTE❗");
  assert.equal(second.excerpt, "Przyszły do nas dziesiątki propozycji.");
});

test("drops the hashtag pile and the markup Facebook wraps the text in", () => {
  const first = parseFeedItems(FEED)[0]!;

  assert.ok(!first.excerpt.includes("#"));
  assert.ok(!first.excerpt.includes("<a"));
  assert.ok(first.excerpt.endsWith("Dominika Błaszczyk – dziennikarka i pisarka."));
});

test("unescapes the 720px image out of the attribute's JSON", () => {
  const items = parseFeedItems(FEED);
  const first = items[0]!;
  const second = items[1]!;

  assert.equal(
    first.image?.src,
    "https://scontent-waw2-2.xx.fbcdn.net/v/t39.30808-6/760146935_n.jpg?stp=dst-jpg_p720x720&oe=6A735E7D",
  );
  assert.equal(second.image, undefined);
});

test("ignores a feed with nothing in it", () => {
  assert.deepEqual(parseFeedItems('<div class="cff-posts-wrap"></div>'), []);
  assert.equal(parseFeedItems("").length, 0);
});
