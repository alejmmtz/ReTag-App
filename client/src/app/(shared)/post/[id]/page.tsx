import { Suspense } from 'react';

import PostDetailView from '../../../../components/posts/post-detail-view';

type Props = {
  params: Promise<{ id: string }>;
};

async function PostById({ params }: Props) {
  const { id } = await params;

  return <PostDetailView postId={id} />;
}

export default function PostPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="bg-background mx-auto min-h-dvh w-full max-w-lg px-8 py-12 pt-18 page-enter" />}>
      <PostById params={params} />
    </Suspense>
  );
}
