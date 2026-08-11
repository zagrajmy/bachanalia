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
 */
export type Selected<T> = {
  [K in AllKeys<T>]?: ValueAt<T, K>;
};
