const rules = new Intl.PluralRules("pl");

/**
 * Polish counts in three shapes, and picking by `n === 1` gets the second one
 * wrong every time: 1 stoisko, 2 stoiska, 5 stoisk — then 22 stoiska again.
 */
export function counted(n: number, forms: { few: string; many: string; one: string }) {
  const form = rules.select(n);
  return `${n} ${form === "one" ? forms.one : form === "few" ? forms.few : forms.many}`;
}
