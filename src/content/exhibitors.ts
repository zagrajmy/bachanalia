export type ExhibitorLink = {
  href: string;
  label: string;
};

export type Exhibitor = {
  description?: string;
  links: ExhibitorLink[];
  logoUrl?: string;
  name: string;
};
