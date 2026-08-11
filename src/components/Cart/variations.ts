/**
 * The variation picker, derived entirely from what WooGraphQL reports.
 *
 * Nothing here knows that today's shop happens to sell shirt sizes and
 * anthologies: the axes are whatever attribute names the variations carry,
 * in the order the parent product lists them, and the options are the values
 * those variations actually use. A product with two attributes picks up a
 * second row of buttons on its own.
 *
 * Pure on purpose — the product page computes it on the server, the form
 * re-runs it in the browser, and the unit tests take it straight.
 */

export type VariationAttributeValue = { name: string; value: string };

export type ProductVariation = {
  attributes: VariationAttributeValue[];
  price: string;
  soldOut: boolean;
  variationId: number;
};

export type VariationAxis = { label: string; name: string; options: string[] };

export type VariationSelection = Record<string, string | undefined>;

/** Parent-product attribute metadata, used for the label and the axis order. */
export type AttributeLabel = { label: string; name: string };

function push(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

/**
 * An empty attribute value is WooCommerce's "any" — one variation standing in
 * for every option on that axis — so it matches whatever the buyer picked.
 */
function attributeMatches(attribute: VariationAttributeValue, chosen: string | undefined) {
  return attribute.value === "" || attribute.value === chosen;
}

export function buildAxes(
  variations: ProductVariation[],
  labels: AttributeLabel[] = [],
): VariationAxis[] {
  const names: string[] = [];
  const optionsByName: Record<string, string[]> = {};

  for (const label of labels) push(names, label.name);

  for (const variation of variations) {
    for (const attribute of variation.attributes) {
      push(names, attribute.name);
      const options = optionsByName[attribute.name] || (optionsByName[attribute.name] = []);
      if (attribute.value !== "") push(options, attribute.value);
    }
  }

  const labelFor = (name: string) => {
    for (const label of labels) if (label.name === name) return label.label;
    return name;
  };

  return names
    .filter((name) => (optionsByName[name] || []).length > 0)
    .map((name) => ({ name, label: labelFor(name), options: optionsByName[name] }));
}

export function matchesSelection(variation: ProductVariation, selection: VariationSelection) {
  for (const attribute of variation.attributes) {
    if (!attributeMatches(attribute, selection[attribute.name])) return false;
  }

  return true;
}

/** Resolves only once every axis has a value; a half-filled picker has no id. */
export function findVariation(
  variations: ProductVariation[],
  axes: VariationAxis[],
  selection: VariationSelection,
): ProductVariation | undefined {
  for (const axis of axes) if (!selection[axis.name]) return undefined;

  for (const variation of variations) if (matchesSelection(variation, selection)) return variation;

  return undefined;
}

/**
 * Whether an option can still lead anywhere in stock, given what is already
 * chosen on the other axes. Single-axis products only lose sold-out options;
 * a two-axis product loses the combinations that were never built.
 */
export function isOptionAvailable(
  variations: ProductVariation[],
  axisName: string,
  value: string,
  selection: VariationSelection,
) {
  const probe: VariationSelection = {};

  for (const key in selection) if (key !== axisName) probe[key] = selection[key];
  probe[axisName] = value;

  for (const variation of variations) {
    if (variation.soldOut) continue;
    if (matchesSelection(variation, probe)) return true;
  }

  return false;
}

/**
 * The picker opens with nothing chosen except an axis that offers a single
 * option. Guessing a shirt size for someone is how they get the wrong one.
 */
export function initialSelection(axes: VariationAxis[]): VariationSelection {
  const selection: VariationSelection = {};

  for (const axis of axes) if (axis.options.length === 1) selection[axis.name] = axis.options[0];

  return selection;
}

/**
 * Whether the buyer has picked a combination that cannot be sold.
 *
 * A product with no axes has nothing to pick: it is simple, and WooCommerce
 * already said whether it is in stock. Only a variable product can land on a
 * variant that is sold out or was never built.
 */
export function isSelectionUnavailable(
  variations: ProductVariation[],
  axes: VariationAxis[],
  selection: VariationSelection,
): boolean {
  if (axes.length === 0) return false;
  if (axes.some((axis) => !selection[axis.name])) return false;

  const chosen = findVariation(variations, axes, selection);

  return !chosen || chosen.soldOut;
}
