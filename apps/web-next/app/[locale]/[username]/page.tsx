// apps/web-next/app/[locale]/[username]/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { FollowButton } from '@/app/components/FollowButton';
import { TagFilter } from '@/app/components/TagFilter';
import { getFormatter, getTranslations } from 'next-intl/server';
import { fetchPostsByUsername, fetchProfile, fetchTopTags } from '@/lib/api';

// 화면을 그리기 전에 Next 가 이 함수를 먼저 부른다. 돌려준 값이 <head> 로 들어간다.
// 굳혀둔 집계값을 그대로 다시 쓴다 — 제목 하나 때문에 서버를 또 부르지 않는다.
export async function generateMetadata({ params }: PageProps<'/[locale]/[username]'>): Promise<Metadata> {
  const { locale, username } = await params;
  const profile = await fetchProfile(username);
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: t('profileTitle', { username }),
    description: t('followers', { count: profile.followerCount }),
    // 우리 화면이 아니라 남의 화면에 뜨는 카드다. 크기까지 같이 줘야 자리를 잡는다.
    openGraph: {
      title: `@${username}`,
      description: t('followers', { count: profile.followerCount }),
      images: [{ url: profile.profileImageUrl, width: 64, height: 64 }],
    },
  };
}

// 대괄호 칸의 값은 props.params 로 들어온다.
// params 를 기다렸다 받는 이유는 나중에 다룬다 — 지금은 await 를 붙인다.
export default async function ProfilePage({ params }: PageProps<'/[locale]/[username]'>) {
  const { username } = await params;

  // 이 화면의 번역 칸을 연다. 서버에서 도는 조각이라 기다렸다 받는다.
  const t = await getTranslations('Profile');
  // 날짜·시각·숫자를 이 요청의 언어로 찍어주는 도구. 언어 이름을 손으로 안 적는다.
  const format = await getFormatter();

  // 셋 다 여기서 출발시킨다. 셋은 서로의 결과가 필요 없다.
  const profileRequest = fetchProfile(username);
  const postsRequest = fetchPostsByUsername(username);
  const tagsRequest = fetchTopTags(username);

  // 화면을 그리는 데 꼭 필요한 둘만 여기서 기다린다.
  const [profile, posts] = await Promise.all([profileRequest, postsRequest]);

  return (
    <>
      <p className="mb-4 text-sm text-black/60">
        {t('stats', { posts: posts.length, followers: profile.followerCount })}
        <span className="ml-2 text-black/40">
          {t('countedAt', {
            time: format.dateTime(new Date(profile.countedAt), {
              dateStyle: 'long',
              timeStyle: 'short',
            }),
          })}
        </span>
      </p>
      <FollowButton username={username} />
      {/* 느린 조각은 여기서 안 기다린다. 준비되면 그때 이 자리에 끼워 넣는다. */}
      <Suspense fallback={<p className="mb-4 text-sm text-black/40">태그 세는 중…</p>}>
        <TagFilter tags={tagsRequest} />
      </Suspense>
      <ul className="grid grid-cols-3 gap-2">
        {posts.map((post) => (
          <li key={post.id} className="aspect-square rounded bg-black/5 p-3 text-sm">
            <p>{post.content}</p>
            <p className="mt-1 text-black/60">{t('likes', { count: post.likeCount })}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
