import type { Metadata } from "next";
import { EditionSwitch } from "@/components/Guests/EditionSwitch";
import { GuestCard, GuestNames, GuestsGrid } from "@/components/Guests/GuestCard";
import { SectionHeading } from "@/components/SectionHeading";
import { type Guest, guests, GUESTS_YEAR } from "@/content/guests";

export const metadata: Metadata = {
  title: "Goście",
};

const href = (guest: Guest) => (guest.bio ? `/goscie/${guest.slug}/` : undefined);

export default function GosciePage() {
  const withPhoto = guests.filter((guest) => guest.photo);
  const withoutPhoto = guests.filter((guest) => !guest.photo);

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <SectionHeading as="h1" size="page" aside={<EditionSwitch current={GUESTS_YEAR} />}>
        Goście
      </SectionHeading>

      <GuestsGrid>
        {withPhoto.map((guest) => (
          <GuestCard
            key={guest.slug}
            name={guest.name}
            href={href(guest)}
            image={guest.photo && { src: guest.photo, alt: guest.name, focus: guest.photoFocus }}
          />
        ))}
      </GuestsGrid>

      <GuestNames guests={withoutPhoto.map((guest) => ({ name: guest.name, href: href(guest) }))} />
    </div>
  );
}
