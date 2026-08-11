type AllKeys<T> = T extends unknown ? keyof T : never;

type ValueAt<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : never
  : never;

/**
 * A field returning an interface comes back as one union member per concrete
 * type, and anything selected through `... on X` exists only on the members
 * that implement X. WordPress answers a page and a product through the same
 * `contentNode`, so the honest shape for code that reads across them is every
 * selected field, optional.
 *
 * The cost is the discrimination: reading `variations` off a SIMPLE product
 * gives `undefined` here where the union would have refused to compile. Code
 * that acts on one concrete type should narrow on `__typename` or `in`
 * instead — `resolveVariationId` does — and leave this to the mappers that
 * genuinely walk every member.
 */
export type Selected<T> = {
  [K in AllKeys<T>]?: ValueAt<T, K>;
};
