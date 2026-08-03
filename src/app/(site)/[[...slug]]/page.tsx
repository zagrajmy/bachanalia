import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { print } from "graphql/language/printer";

import { fetchGraphQL, fetchGraphQLAtBuild } from "@/utils/fetchGraphQL";
import { ContentNodeResult, ContentQuery } from "@/queries/general/ContentQuery";
import { PageTemplate } from "@/components/Templates/Page/PageTemplate";
import { nextSlugToWpSlug } from "@/utils/nextSlugToWpSlug";
import { unshoutName, unshoutTitle } from "@/utils/unshout";
import { wpUriToPath } from "@/utils/wpUriToPath";
import { PostTemplate } from "@/components/Templates/Post/PostTemplate";
import { AllContentQuery } from "@/queries/general/AllContentQuery";
import { Home } from "@/components/Home";
import { fetchNews } from "@/components/News/news";
import { fetchAccreditation } from "@/content/shop";
import { RETIRED_PATHS } from "@/components/Globals/siteNav";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

async function HomePage() {
  const [news, tickets] = await Promise.all([fetchNews(6), fetchAccreditation()]);

  return <Home news={news} tickets={tickets} />;
}

const toPath = (segments?: string[]) => (segments?.length ? `/${segments.join("/")}/` : "/");

/**
 * Memoised so metadata and the body share a single WordPress round trip.
 */
const getContentNode = cache(async (slug: string) => {
  const isPreview = slug.includes("preview");

  const { contentNode } = await fetchGraphQL<{ contentNode: ContentNodeResult | null }>(
    print(ContentQuery),
    {
      slug: isPreview ? slug.split("preview/")[1] : slug,
      idType: isPreview ? "DATABASE_ID" : "URI",
    },
  );

  return contentNode;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segments = (await params).slug;
  const path = toPath(segments);
  const canonical = `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;

  if (path === "/") {
    return { alternates: { canonical } };
  }

  const contentNode = RETIRED_PATHS.includes(path)
    ? null
    : await getContentNode(nextSlugToWpSlug(segments));

  if (!contentNode) {
    return notFound();
  }

  const unshout = contentNode.contentTypeName === "post" ? unshoutName : unshoutTitle;

  return {
    title: unshout(contentNode.title),
    alternates: { canonical },
  };
}

export const revalidate = 10800;

export async function generateStaticParams() {
  const { pages, posts } = await fetchGraphQLAtBuild<{
    pages: { nodes: { uri?: string | null }[] };
    posts: { nodes: { uri?: string | null }[] };
  }>(print(AllContentQuery));

  return (
    [...(pages?.nodes ?? []), ...(posts?.nodes ?? [])]
      .map((node) => wpUriToPath(node.uri))
      .filter((path) => path !== "/" && !RETIRED_PATHS.includes(path))
      .map((path) => ({ slug: path.split("/").filter(Boolean) }))
      /** The homepage is a route here too, and without this it alone stays cold. */
      .concat([{ slug: [] }])
  );
}

export default async function Page({ params }: Props) {
  const segments = (await params).slug;
  const path = toPath(segments);

  if (path === "/") {
    return <HomePage />;
  }

  if (RETIRED_PATHS.includes(path)) {
    notFound();
  }

  const contentNode = await getContentNode(nextSlugToWpSlug(segments));

  if (!contentNode) {
    return notFound();
  }

  switch (contentNode.contentTypeName) {
    case "page":
      return <PageTemplate node={contentNode} />;
    case "post":
      return <PostTemplate node={contentNode} />;
    default:
      return <p>{contentNode.contentTypeName} not implemented</p>;
  }
}
