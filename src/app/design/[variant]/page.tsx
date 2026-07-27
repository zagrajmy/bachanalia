import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { print } from "graphql/language/printer";

import { ALL_VARIANTS, KEY_ART, NewsItem } from "@/components/design/content";
import { Akredytacja } from "@/components/design/variants/Akredytacja";
import { Atlas } from "@/components/design/variants/Atlas";
import { Demoscena } from "@/components/design/variants/Demoscena";
import { Plakat } from "@/components/design/variants/Plakat";
import { Akredytacja as AkredytacjaPrev } from "@/components/design/variants/previous/Akredytacja";
import { Atlas as AtlasPrev } from "@/components/design/variants/previous/Atlas";
import { Demoscena as DemoscenaPrev } from "@/components/design/variants/previous/Demoscena";
import { Plakat as PlakatPrev } from "@/components/design/variants/previous/Plakat";
import { Zin as ZinPrev } from "@/components/design/variants/previous/Zin";
import { Zin } from "@/components/design/variants/Zin";
import { PostsQuery } from "@/components/Templates/Posts/PostsQuery";
import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return ALL_VARIANTS.map(({ slug }) => ({ variant: slug }));
}

const RENDERERS: Record<string, (props: { news: NewsItem[]; artSrc: string }) => React.ReactNode> =
  {
    plakat: Plakat,
    atlas: Atlas,
    zin: Zin,
    demoscena: Demoscena,
    akredytacja: Akredytacja,
    "plakat-previous": PlakatPrev,
    "atlas-previous": AtlasPrev,
    "zin-previous": ZinPrev,
    "demoscena-previous": DemoscenaPrev,
    "akredytacja-previous": AkredytacjaPrev,
  };

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" });

export default async function VariantPage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const Renderer = RENDERERS[variant];

  if (!Renderer) notFound();

  const { posts } = await fetchGraphQL<{ posts: { nodes: Post[] } }>(print(PostsQuery), {
    first: 6,
  });

  const news: NewsItem[] = (posts?.nodes ?? []).map((post) => ({
    title: post.title ?? "",
    href: wpUriToPath(post.uri),
    date: post.date ? dateFormat.format(new Date(post.date)) : "",
  }));

  const artSrc = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${KEY_ART}`;

  return <Renderer news={news} artSrc={artSrc} />;
}
