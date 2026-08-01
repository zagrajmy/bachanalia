import { strict as assert } from "node:assert";
import { test } from "node:test";

import { unshoutName, unshoutTitle } from "./unshout";

test("lowers a shouted page title to Polish sentence case", () => {
  assert.equal(unshoutTitle("TABELA PROGRAMOWA"), "Tabela programowa");
  assert.equal(unshoutTitle("ZGŁOSZENIA PROGRAMU"), "Zgłoszenia programu");
});

test("mixed case is the editor's own choice and passes through untouched", () => {
  assert.equal(
    unshoutTitle("Regulamin sklepu i polityka zwrotów"),
    "Regulamin sklepu i polityka zwrotów",
  );
  assert.equal(unshoutName("Artur DZIKOWY Olchowy"), "Artur DZIKOWY Olchowy");
  assert.equal(unshoutName("dr Karolina Rożko"), "dr Karolina Rożko");
});

test("the con's own names keep their capitals", () => {
  assert.equal(unshoutTitle("CO TO SĄ BACHANALIA"), "Co to są Bachanalia");
  assert.equal(unshoutTitle("BACHANALIA FANTASTYCZNE"), "Bachanalia Fantastyczne");
  assert.equal(unshoutTitle("KONWENT ZKF AD ASTRA"), "Konwent ZKF Ad Astra");
  assert.equal(unshoutTitle("ZIELONA GÓRA ZAPRASZA"), "Zielona Góra zaprasza");
  assert.equal(unshoutTitle("HISTORIA BACHANALIÓW"), "Historia Bachanaliów");
  assert.equal(unshoutTitle("POLCON 2026"), "Polcon 2026");
  assert.equal(unshoutTitle("FANTAZJE ZIELONOGÓRSKIE"), "Fantazje Zielonogórskie");
});

test("acronyms stay upper", () => {
  assert.equal(unshoutTitle("RPG"), "RPG");
  assert.equal(unshoutTitle("SESJE RPG DLA POCZĄTKUJĄCYCH"), "Sesje RPG dla początkujących");
  assert.equal(unshoutTitle("XL EDYCJA NA UZ"), "XL edycja na UZ");
});

test("Polish diacritics survive the round trip", () => {
  assert.equal(unshoutTitle("ZGŁOSZENIA OBSŁUGI"), "Zgłoszenia obsługi");
  assert.equal(unshoutTitle("ŁÓDŹ ŚWIĘCI ŻÓŁTĄ ĆMĘ"), "Łódź święci żółtą ćmę");
  assert.equal(unshoutName("PAWEŁ AWDEJUK"), "Paweł Awdejuk");
});

test("guest names take a capital on every word, unlike a sentence", () => {
  assert.equal(unshoutName("FIGURKOWCY"), "Figurkowcy");
  assert.equal(unshoutName("MARIA SKŁODOWSKA-CURIE"), "Maria Skłodowska-Curie");
  assert.equal(unshoutName("KRZYSZTOF „JAXA” RUDEK"), "Krzysztof „Jaxa” Rudek");
  assert.equal(unshoutName("PIOTR W. CHOLEWA"), "Piotr W. Cholewa");
  assert.equal(unshoutName("DR JAKUB WALICKI"), "dr Jakub Walicki");
});

test("a shouted title the nav already spells is taken from the nav verbatim", () => {
  assert.equal(unshoutTitle("REGULAMIN WYSTAWCÓW"), "Regulamin wystawców");
  assert.equal(unshoutTitle("RETRO GAMING"), "Retro gaming");
  assert.equal(unshoutTitle("CZAS I MIEJSCE"), "Czas i miejsce");
});

test("handles a missing title", () => {
  assert.equal(unshoutTitle(undefined), "");
  assert.equal(unshoutTitle(null), "");
  assert.equal(unshoutTitle(""), "");
  assert.equal(unshoutName(undefined), "");
});

test("leaves a title with no letters in it alone", () => {
  assert.equal(unshoutTitle("2026"), "2026");
});
