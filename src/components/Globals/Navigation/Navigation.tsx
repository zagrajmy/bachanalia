import Link from "next/link";

import styles from "./Navigation.module.css";

const links = [
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/o-konwencie/", label: "O konwencie" },
  { href: "/program/", label: "Program" },
  { href: "/goscie/", label: "Goście" },
  { href: "/akredytacja/", label: "Akredytacja" },
  { href: "/wystawcy/", label: "Wystawcy" },
  { href: "/wspieraja-nas/", label: "Wspierają nas" },
];

export default function Navigation() {
  return (
    <nav
      className={styles.navigation}
      role="navigation"
      itemScope
      itemType="http://schema.org/SiteNavigationElement"
    >
      {links.map(({ href, label }) => (
        <Link itemProp="url" href={href} key={href}>
          <span itemProp="name">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
