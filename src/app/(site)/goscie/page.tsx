import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { print } from "graphql/language/printer";

import { PostsQuery } from "@/components/Templates/Posts/PostsQuery";
import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

export const metadata: Metadata = {
  title: "Goście",
};

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function GosciePage() {
  const { posts } = await fetchGraphQL<{ posts: { nodes: Post[] } }>(print(PostsQuery));
  const nodes = posts?.nodes ?? [];

  const editions = nodes
    .map((post) => (post.date ? new Date(post.date).getFullYear() : undefined))
    .filter((year, index, all): year is number => year !== undefined && all.indexOf(year) === index)
    .sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="display text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] text-ink">Goście</h1>

      {editions.length > 0 && (
        <p className="mt-6 max-w-[55ch] text-lg text-ink-muted">
          Program XL edycji jest w przygotowaniu. Poniżej goście i atrakcje z edycji{" "}
          {editions.join(", ")}.
        </p>
      )}

      {nodes.length === 0 ? (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Lista gości XL edycji pojawi się tutaj, gdy tylko ją ogłosimy.
        </p>
      ) : (
        <ul className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {nodes.map((post) => {
            const image = post.featuredImage?.node;

            return (
              <li key={post.id}>
                <Link href={wpUriToPath(post.uri)} className="group block no-underline">
                  <div className="overflow-hidden rounded-card bg-navy-800">
                    {image?.sourceUrl ? (
                      <Image
                        src={image.sourceUrl}
                        alt={image.altText || ""}
                        width={image.mediaDetails?.width ?? 800}
                        height={image.mediaDetails?.height ?? 600}
                        sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 27vw, (min-width: 640px) 45vw, 90vw"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full" />
                    )}
                  </div>

                  <h2 className="display mt-4 text-lg text-ink transition-colors duration-200 group-hover:text-accent">
                    {post.title}
                  </h2>

                  {post.date && (
                    <time dateTime={post.date} className="mt-1 block text-sm text-ink-muted">
                      {dateFormat.format(new Date(post.date))}
                    </time>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
