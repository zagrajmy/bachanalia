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

type Props = {
  params: Promise<{ slug?: string[] }>;
};

function HomeFallback() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">Bachanalia Fantastyczne XL</h1>
      <p className="mt-4 text-lg">25–27 września 2026 · Zielona Góra</p>
      <p className="mt-2 text-sm opacity-70">Nowa strona w budowie.</p>
    </main>
  );
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
    return <HomeFallback />;
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
