import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../../lib/posts';
import { postImagePath, renderPostCard } from '../../../lib/social-card.mjs';

export async function getStaticPaths() {
  return (await getPublishedPosts()).map((post) => ({
    params: { image: postImagePath(post.id).split('/').at(-1)!.replace(/\.png$/, '') },
    props: { title: post.data.title },
  }));
}

export const GET: APIRoute = async ({ props }) => new Response(
  new Uint8Array(await renderPostCard(props.title)),
  { headers: { 'Content-Type': 'image/png' } },
);
