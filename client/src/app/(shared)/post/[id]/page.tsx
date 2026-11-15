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
    <Suspense fallback={<main className="min-h-screen bg-[#191919]" />}>
      <PostById params={params} />
    </Suspense>
  );
}
