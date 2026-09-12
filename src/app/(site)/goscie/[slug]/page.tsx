import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guests } from "@/content/guests";

type Props = { params: Promise<{ slug: string }> };

const withBio = guests.filter((guest) => guest.bio);

export const dynamicParams = false;

export function generateStaticParams() {
  return withBio.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guest = withBio.find((guest) => guest.slug === slug);

  if (!guest) return notFound();

  return {
    title: guest.name,
    description: guest.bio?.[0],
    alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/goscie/${slug}/` },
  };
}

export default async function GuestPage({ params }: Props) {
  const { slug } = await params;
  const guest = withBio.find((guest) => guest.slug === slug);

  if (!guest) return notFound();

  return (
    <article className="gutter mx-auto grid max-w-6xl gap-10 pt-12 pb-4 sm:pt-16 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-14">
      {guest.photo && (
        <Image
          src={guest.photo}
          alt={guest.name}
          sizes="(min-width: 1024px) 20rem, 100vw"
          priority
          placeholder="blur"
          className="w-full rounded-card bg-paper-shade object-cover lg:sticky lg:top-(--below-header)"
        />
      )}

      <div className="min-w-0">
        <Link href="/goscie/" className="eyebrow text-ink-muted">
          Goście
        </Link>

        <h1 className="display mt-3 ml-[-0.04em] border-b-2 border-navy pb-3 text-[clamp(1.9rem,5.2vw,3rem)]">
          {guest.name}
        </h1>

        <div className="wp-content mt-10">
          {guest.bio?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
