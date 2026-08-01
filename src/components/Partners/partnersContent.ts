import gql from "graphql-tag";
import { print } from "graphql/language/printer";

import { decodeEntities } from "@/components/News/news";
import { partnerCredit } from "@/content/partners";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { nextSlugToWpSlug } from "@/utils/nextSlugToWpSlug";

export type PartnerLogo = {
  href?: string;
  name: string;
  /** A line of credit that belongs next to the mark, not under it. */
  note?: string;
  src: string;
  /**
   * Absent when the markup declares none — an Elementor thumbnail carries no
   * dimensions, and a guessed ratio distorts somebody's mark.
   */
  dimensions?: { height: number; width: number };
};

export type PartnerTier = { logos: PartnerLogo[]; title: string };

/** Logos placed above the first heading belong to nobody's tier — the city's funding mark. */
export type PartnersPage = { lead: PartnerLogo[]; tiers: PartnerTier[] };

/**
 * The page is Elementor's usual pile of wrappers, but the three things that
 * carry meaning survive it in document order: a heading opens a tier, an
 * anchor says who a logo belongs to, and the image is the logo. Everything
 * between them is scaffolding.
 */
const TOKEN = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>|<a\b[^>]*>|<\/a>|<img\b[^>]*>/gi;

const HREF = /\shref="([^"]*)"/i;
const SRC = /\ssrc="([^"]*)"/i;
const SRCSET = /\ssrcset="([^"]*)"/i;
const WIDTH = /\swidth="(\d+)"/i;
const HEIGHT = /\sheight="(\d+)"/i;
const ALT = /\salt="([^"]*)"/i;

function attr(tag: string, pattern: RegExp) {
  const value = tag.match(pattern)?.[1];
  return value ? decodeEntities(value) : undefined;
}

function plainText(html: string) {
  return decodeEntities(html.replaceAll(/<[^>]*>/g, " "))
    .replaceAll(/\s+/g, " ")
    .trim();
}

/**
 * WordPress offers every crop it made. The smallest is often the one Elementor
 * chose — the Planetarium mark is inserted at 150px — and these logos are the
 * content here, so ask Next for the largest instead.
 */
function widest(srcset?: string) {
  return (srcset ?? "")
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/))
    .flatMap(([url, descriptor]) =>
      url && /^\d+w$/.test(descriptor ?? "")
        ? [{ url, width: Number.parseInt(descriptor, 10) }]
        : [],
    )
    .sort((a, b) => b.width - a.width)[0];
}

function toLogo(tag: string, href?: string): PartnerLogo | undefined {
  const src = attr(tag, SRC);
  if (!src) return undefined;

  const width = Number(attr(tag, WIDTH));
  const height = Number(attr(tag, HEIGHT));
  const ratio = width > 0 && height > 0 ? width / height : 0;
  const largest = widest(attr(tag, SRCSET));
  /** Crops of one upload share its ratio, so a bigger URL needs no new guess. */
  const upgrade = ratio > 0 && largest && largest.width > width ? largest : undefined;

  return {
    ...partnerCredit(href, attr(tag, ALT)),
    ...(href && { href }),
    src: upgrade?.url ?? src,
    ...(ratio > 0 && {
      dimensions: upgrade
        ? { height: Math.round(upgrade.width / ratio), width: upgrade.width }
        : { height, width },
    }),
  };
}

export function parsePartners(html: string): PartnersPage {
  const lead: PartnerLogo[] = [];
  const tiers: PartnerTier[] = [];
  let href: string | undefined;

  TOKEN.lastIndex = 0;

  for (let match = TOKEN.exec(html); match; match = TOKEN.exec(html)) {
    const [tag, heading] = match;

    if (heading !== undefined) {
      const title = plainText(heading);
      if (title) tiers.push({ logos: [], title });
      continue;
    }

    if (tag.startsWith("</")) {
      href = undefined;
      continue;
    }

    if (tag.startsWith("<a")) {
      href = attr(tag, HREF);
      continue;
    }

    const logo = toLogo(tag, href);
    if (logo) (tiers.at(-1)?.logos ?? lead).push(logo);
  }

  /** Editors leave empty sections behind; a tier heading with nothing under it is noise. */
  return { lead, tiers: tiers.filter((tier) => tier.logos.length > 0) };
}

const PartnersPageQuery = gql`
  query PartnersPageQuery($uri: ID!) {
    page(id: $uri, idType: URI) {
      content
    }
  }
`;

export async function fetchPartners(): Promise<PartnersPage | null> {
  const { page } = await fetchGraphQL<{ page: { content?: string | null } | null }>(
    print(PartnersPageQuery),
    /** Pretty permalinks 404 on WordPress, so URI lookups go through /index.php. */
    { uri: nextSlugToWpSlug("wspieraja-nas") },
  );

  return page?.content ? parsePartners(page.content) : null;
}
