export type ExhibitorLink = {
  href: string;
  label: string;
};

export type Exhibitor = {
  description?: string;
  links: ExhibitorLink[];
  /** Whether the logo needs paper behind it to survive the dark card. */
  logoNeedsPlate: boolean;
  logoUrl?: string;
  name: string;
};
