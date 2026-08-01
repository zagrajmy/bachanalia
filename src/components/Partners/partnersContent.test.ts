import { describe, expect, it } from "bun:test";

import { parsePartners } from "./partnersContent";

/** Trimmed from the live page: an untiered lead logo, two tiers, one empty section. */
const HTML = `
<section class="elementor-section" data-e-type="section">
  <a href="https://www.zielona-gora.pl/">
    <img decoding="async" src="https://wp.test/wp-content/uploads/elementor/thumbs/3090755-qt8eo7.png" title="3090755" alt="3090755" />
  </a>
</section>
<section class="elementor-section"><h2 style="text-align: center;">Wsp&#243;łorganizatorzy</h2></section>
<section class="elementor-section">
  <a href="https://uz.zgora.pl/">
    <img width="960" height="299" src="https://wp.test/wp-content/uploads/2025/09/uz-1024x319.jpg" alt=""
      srcset="https://wp.test/wp-content/uploads/2025/09/uz-1024x319.jpg 1024w, https://wp.test/wp-content/uploads/2025/09/uz-300x94.jpg 300w, https://wp.test/wp-content/uploads/2025/09/uz-2048x639.jpg 2048w" />
  </a>
</section>
<section class="elementor-section"><h2>Patroni</h2></section>
<section class="elementor-section"></section>
<section class="elementor-section">
  <a href="https://www.youtube.com/@OtwarteKomiksy">
    <img width="300" height="300" src="https://wp.test/wp-content/uploads/2026/07/otwarte_komiksy-300x300.png" alt="" />
  </a>
</section>
<section class="elementor-section"><h2>Sekcja bez logotyp&#243;w</h2></section>
`;

describe("parsePartners", () => {
  const { lead, tiers } = parsePartners(HTML);

  it("keeps the tiers WordPress declares, in the order it declares them", () => {
    expect(tiers.map((tier) => tier.title)).toEqual(["Współorganizatorzy", "Patroni"]);
  });

  it("names an organisation by where its logo links, not by the filename", () => {
    expect(tiers[0].logos[0].name).toBe("Uniwersytet Zielonogórski");
    expect(tiers[1].logos[0].name).toBe("Otwarte Komiksy");
  });

  it("asks for the largest crop and keeps the declared aspect ratio", () => {
    const [uz] = tiers[0].logos;

    expect(uz.src).toEndWith("uz-2048x639.jpg");
    expect(uz.dimensions).toEqual({ height: 638, width: 2048 });
  });

  it("reports no size for an image that declares none rather than inventing one", () => {
    expect(lead[0].dimensions).toBeUndefined();
    expect(lead[0].note).toBe("Zrealizowano przy pomocy finansowej Miasta Zielona Góra");
  });

  it("drops a heading with nothing under it", () => {
    expect(tiers.map((tier) => tier.logos.length)).toEqual([1, 1]);
  });
});
