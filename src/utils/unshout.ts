import { footerNav, primaryCta, primaryNav } from "@/components/Globals/siteNav";
import { accreditation, blocks, con } from "@/content/con";

/**
 * Polish letters spelled out: `\b` and `\w` are ASCII-only, and the `u` flag
 * that would give us `\p{Lu}` is a compile error under an ES5 target.
 */
const LOWER = "a-ząćęłńóśźż";
const UPPER = "A-ZĄĆĘŁŃÓŚŹŻ";

const HAS_LETTER = new RegExp(`[${LOWER}${UPPER}]`);
const HAS_LOWERCASE = new RegExp(`[${LOWER}]`);

/** Shouting is caps with no lowercase in it; digits and punctuation are fine. */
const isShouted = (title: string) => HAS_LETTER.test(title) && !HAS_LOWERCASE.test(title);

const normalise = (title: string) => title.replaceAll(/\s+/g, " ").trim().toLocaleLowerCase("pl");

/**
 * How the site itself writes the things WordPress also holds. Most shouted page
 * titles are a page we already link to, so the nav answers them outright —
 * including the names inside them, as in "Co to są Bachanalia".
 */
const VOCABULARY = [
  con.name,
  con.rank,
  con.edition,
  primaryCta.label,
  ...primaryNav.map((group) => group.label),
  ...primaryNav.flatMap((group) => group.children ?? []).map((child) => child.label),
  ...footerNav.flatMap((section) => section.links).map((link) => link.label),
  ...blocks.map((block) => block.label),
  ...accreditation.map((tier) => tier.label),
];

/** Prototype-free, so a page titled "CONSTRUCTOR" cannot look up a function. */
const CANONICAL: Record<string, string> = Object.create(null);
for (const label of VOCABULARY) CANONICAL[normalise(label)] = label;

const ALL_CAPS = new RegExp(`^[${UPPER}]{2,}$`);

/**
 * Initialisms that survive lowering. The vocabulary already contributes the
 * ones the site links to (RPG) and the edition (XL); these are the rest.
 */
const ACRONYMS = [
  ...VOCABULARY.filter((label) => ALL_CAPS.test(label)),
  "BF",
  "ZKF",
  "UZ",
  "ZOK",
  "LAN",
];

/**
 * Names that keep their capital wherever they land in a title, which sentence
 * case would otherwise flatten. A trailing "-" makes the entry a stem, and that
 * is how Polish declension is covered: "Bachanali-" also restores
 * "Bachanaliów" and "Bachanaliami". Phrases come first so their inner words are
 * settled before a stem looks at them.
 *
 * Extend this list rather than the algorithm. It is deliberately short — the
 * con's own vocabulary comes from `con.ts` and `siteNav.ts` above, and only
 * names that appear *inside* some other title need spelling out here.
 */
const NAMES = [
  "Fantazje Zielonogórskie",
  "Ad Astra",
  "Zielona Góra",
  "Bachanali-",
  "Zielonogórsk-",
  "Polcon-",
  "Fantastyczne",
];

const START = `(?<![${LOWER}${UPPER}])`;
const END = `(?![${LOWER}${UPPER}])`;

const restore = (title: string) => {
  let out = title;

  for (const name of NAMES) {
    const isStem = name.endsWith("-");
    const word = isStem ? name.slice(0, -1) : name;

    out = out.replaceAll(new RegExp(START + word + (isStem ? "" : END), "gi"), word);
  }

  for (const acronym of ACRONYMS) {
    out = out.replaceAll(new RegExp(START + acronym + END, "gi"), acronym);
  }

  return out;
};

/** Raises the first letter, skipping any quote, digit or dash in front of it. */
const upperFirst = (text: string) =>
  text.replace(new RegExp(`[${LOWER}]`), (letter) => letter.toLocaleUpperCase("pl"));

/**
 * Words a Polish name keeps lowercase: the academic titles the editors already
 * write that way ("dr Karolina Rożko") and the particles inside a name. An
 * initial keeps its dot, so "w." is raised where the preposition "w" is not.
 */
const KEEP_LOWER = new Set([
  "de",
  "dr",
  "hab.",
  "i",
  "im.",
  "inż.",
  "mgr",
  "oraz",
  "prof.",
  "van",
  "von",
  "w",
  "we",
  "z",
  "ze",
]);

const WORD = new RegExp(`[${LOWER}]+\\.?`, "g");

const nameCase = (text: string) =>
  text.replace(WORD, (word) => (KEEP_LOWER.has(word) ? word : upperFirst(word)));

/**
 * Editors type titles into wp-admin in full caps and we render them verbatim,
 * so the headings shout. Mixed case is a deliberate choice — "Artur DZIKOWY
 * Olchowy" is a nickname, not a mistake — so only all-caps titles are touched.
 */
const unshout = (title: string | null | undefined, recase: (lowered: string) => string) => {
  if (!title) return "";
  if (!isShouted(title)) return title;

  return CANONICAL[normalise(title)] ?? restore(recase(title.toLocaleLowerCase("pl")));
};

/**
 * Sentence case, which is what Polish asks of a heading: the first word and the
 * proper nouns, never the English word-by-word capitals.
 */
export const unshoutTitle = (title?: string | null) => unshout(title, upperFirst);

/**
 * A person or a group, where every word carries a capital — "PAWEŁ AWDEJUK" is
 * "Paweł Awdejuk", not "Paweł awdejuk".
 *
 * Nothing in a title tells the two apart: "TABELA PROGRAMOWA" and "PAWEŁ
 * AWDEJUK" are both two capitalised words, and separating them would need a
 * dictionary of Polish given names. The callsite knows instead — every post in
 * this WordPress is a guest profile, so the guest surfaces ask for this and the
 * pages ask for `unshoutTitle`.
 */
export const unshoutName = (title?: string | null) => unshout(title, nameCase);
