import type { Metadata } from "next";
import { EditionSwitch } from "@/components/Guests/EditionSwitch";
import { GuestCard, GuestsGrid } from "@/components/Guests/GuestCard";
import { SectionHeading } from "@/components/SectionHeading";
import { PostsQuery } from "@/components/Templates/Posts/PostsQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { unshoutName } from "@/utils/unshout";
import { wpUriToPath } from "@/utils/wpUriToPath";

export const metadata: Metadata = {
  title: "Goście 2025",
};

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** The 2025 guests still live as WordPress posts, one per guest. */
export default async function Goscie2025Page() {
  const { posts } = await fetchGraphQL(PostsQuery);
  const nodes = posts?.nodes ?? [];

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <SectionHeading as="h1" size="page" aside={<EditionSwitch current={2025} />}>
        Goście
      </SectionHeading>

      <GuestsGrid>
        {nodes.map((post) => {
          const image = post.featuredImage?.node;

          return (
            <GuestCard
              key={post.id}
              name={unshoutName(post.title)}
              href={wpUriToPath(post.uri)}
              image={
                image?.sourceUrl
                  ? {
                      src: image.sourceUrl,
                      alt: image.altText || "",
                      width: image.mediaDetails?.width ?? undefined,
                      height: image.mediaDetails?.height ?? undefined,
                    }
                  : undefined
              }
              meta={
                post.date && (
                  <time dateTime={post.date} className="mt-1 block text-sm text-ink-muted">
                    {dateFormat.format(new Date(post.date))}
                  </time>
                )
              }
            />
          );
        })}
      </GuestsGrid>
    </div>
  );
}
