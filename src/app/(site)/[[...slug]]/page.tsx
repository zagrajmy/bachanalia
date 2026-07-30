import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { print } from "graphql/language/printer";

import { fetchGraphQL, fetchGraphQLAtBuild } from "@/utils/fetchGraphQL";
import { ContentInfoQuery } from "@/queries/general/ContentInfoQuery";
import { ContentNode, NodeWithTitle } from "@/gql/graphql";
import PageTemplate from "@/components/Templates/Page/PageTemplate";
import { nextSlugToWpSlug } from "@/utils/nextSlugToWpSlug";
import { wpUriToPath } from "@/utils/wpUriToPath";
import PostTemplate from "@/components/Templates/Post/PostTemplate";
import { AllContentQuery } from "@/queries/general/AllContentQuery";
import { SeoQuery } from "@/queries/general/SeoQuery";
import { Home } from "@/components/Home";
import { fetchNews } from "@/components/News/news";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

async function HomePage() {
  return <Home news={await fetchNews(6)} />;
}

const toPath = (segments?: string[]) => (segments?.length ? `/${segments.join("/")}/` : "/");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segments = (await params).slug;
  const path = toPath(segments);
  const canonical = `${process.env.NEXT_PUBLIC_BASE_URL}${path}`;

  if (path === "/") {
    return { alternates: { canonical } };
  }

  const slug = nextSlugToWpSlug(segments);
  const isPreview = slug.includes("preview");

  const { contentNode } = await fetchGraphQL<{ contentNode: NodeWithTitle }>(print(SeoQuery), {
    slug: isPreview ? slug.split("preview/")[1] : slug,
    idType: isPreview ? "DATABASE_ID" : "URI",
  });

  if (!contentNode) {
    return notFound();
  }

  return {
    title: contentNode.title,
    alternates: { canonical },
  };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const { pages, posts } = await fetchGraphQLAtBuild<{
    pages: { nodes: { uri?: string | null }[] };
    posts: { nodes: { uri?: string | null }[] };
  }>(print(AllContentQuery));

  return [...(pages?.nodes ?? []), ...(posts?.nodes ?? [])]
    .map((node) => wpUriToPath(node.uri).split("/").filter(Boolean))
    .filter((segments) => segments.length > 0)
    .map((slug) => ({ slug }));
}

export default async function Page({ params }: Props) {
  const segments = (await params).slug;

  if (toPath(segments) === "/") {
    return <HomePage />;
  }

  const slug = nextSlugToWpSlug(segments);
  const isPreview = slug.includes("preview");
  const { contentNode } = await fetchGraphQL<{ contentNode: ContentNode }>(
    print(ContentInfoQuery),
    {
      slug: isPreview ? slug.split("preview/")[1] : slug,
      idType: isPreview ? "DATABASE_ID" : "URI",
    },
  );

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
