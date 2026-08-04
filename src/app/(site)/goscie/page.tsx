import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { print } from "graphql/language/printer";

import { PostsQuery } from "@/components/Templates/Posts/PostsQuery";
import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { unshoutName } from "@/utils/unshout";
import { wpUriToPath } from "@/utils/wpUriToPath";
import { SectionHeading } from "@/components/SectionHeading";

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
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <SectionHeading
        as="h1"
        size="page"
        aside={
          editions.length > 0 && (
            <p className="max-w-[34ch] text-sm text-ink-muted">
              Program XL edycji jest w przygotowaniu. Goście edycji {editions.join(", ")}.
            </p>
          )
        }
      >
        Goście
      </SectionHeading>

      {nodes.length === 0 ? (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Gości XL edycji jeszcze nie ogłosiliśmy.
        </p>
      ) : (
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((post) => {
            const image = post.featuredImage?.node;

            return (
              <li key={post.id}>
                <Link href={wpUriToPath(post.uri)} className="group block no-underline">
                  <div className="overflow-hidden rounded-card bg-paper-shade">
                    {image?.sourceUrl ? (
                      <Image
                        src={image.sourceUrl}
                        alt={image.altText || ""}
                        width={image.mediaDetails?.width ?? 800}
                        height={image.mediaDetails?.height ?? 600}
                        sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 27vw, (min-width: 640px) 45vw, 90vw"
                        className="aspect-3/4 w-full object-contain"
                      />
                    ) : (
                      <div className="aspect-3/4 w-full" />
                    )}
                  </div>

                  <h2 className="display mt-4 text-xl text-ink transition-colors duration-200 group-hover:text-rose">
                    {unshoutName(post.title)}
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
