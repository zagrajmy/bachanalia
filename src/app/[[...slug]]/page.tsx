import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { print } from "graphql/language/printer";

import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { ContentInfoQuery } from "@/queries/general/ContentInfoQuery";
import { ContentNode, NodeWithTitle } from "@/gql/graphql";
import PageTemplate from "@/components/Templates/Page/PageTemplate";
import { nextSlugToWpSlug } from "@/utils/nextSlugToWpSlug";
import PostTemplate from "@/components/Templates/Post/PostTemplate";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = nextSlugToWpSlug((await params).slug);
  const isPreview = slug.includes("preview");

  const { contentNode } = await fetchGraphQL<{ contentNode: NodeWithTitle }>(print(SeoQuery), {
    slug: isPreview ? slug.split("preview/")[1] : slug,
    idType: isPreview ? "DATABASE_ID" : "URI",
  });

  if (!contentNode && slug !== "/") {
    return notFound();
  }

  return {
    title: contentNode?.title ?? "Bachanalia Fantastyczne XL",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${slug}`,
    },
  };
}

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: Props) {
  const slug = nextSlugToWpSlug((await params).slug);
  const isPreview = slug.includes("preview");
  const { contentNode } = await fetchGraphQL<{ contentNode: ContentNode }>(
    print(ContentInfoQuery),
    {
      slug: isPreview ? slug.split("preview/")[1] : slug,
      idType: isPreview ? "DATABASE_ID" : "URI",
    },
  );

  if (!contentNode) {
    if (slug === "/") return <HomeFallback />;
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
