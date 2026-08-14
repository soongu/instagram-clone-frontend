// apps/web-spa/src/routes/ExplorePage.tsx
import { Link, useSearchParams } from 'react-router';
import { List } from '../components/List';
import { Section } from '../components/Section';
import { Button } from '../components/ui/button';
import { useFeedQuery, useTagsQuery } from '../queries/posts';

export function ExplorePage() {
  // 모양은 useState 와 똑같다 — 값 하나와 그 값을 바꾸는 함수 하나.
  // 다른 것은 담기는 자리다. 이 값은 컴포넌트가 아니라 주소에 적힌다.
  const [searchParams, setSearchParams] = useSearchParams();

  // 없으면 null 이다. undefined 가 아니라 null 이라는 것을 기억해 두자.
  const tag = searchParams.get('tag');

  // 주소에 적힌 값이 그대로 키의 일부가 된다.
  // 태그가 바뀌면 키가 바뀌고, 키가 바뀌면 새로 물어본다.
  const { data: shown, isPending, error } = useFeedQuery(tag ?? undefined);
  const { data: tags = [] } = useTagsQuery();

  return (
    <Section title="탐색">
      <div className="mb-4 flex flex-wrap gap-2">
        {/* 빈 값을 넣으면 물음표 뒤가 통째로 사라진다 */}
        <Button
          variant={tag === null ? 'default' : 'outline'}
          size="sm"
          aria-pressed={tag === null}
          onClick={() => setSearchParams({})}
        >
          전체
        </Button>
        {tags.map((name) => (
          <Button
            key={name}
            variant={tag === name ? 'default' : 'outline'}
            size="sm"
            aria-pressed={tag === name}
            onClick={() => setSearchParams({ tag: name })}
          >
            {name}
          </Button>
        ))}
      </div>

      {error !== null ? (
        <p className="text-sm text-danger-strong">게시물을 불러오지 못했어요</p>
      ) : isPending ? (
        <p className="text-sm text-faint">게시물을 불러오는 중이에요…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-faint">이 태그를 붙인 게시물이 없습니다.</p>
      ) : (
        <List
          items={shown}
          className="grid grid-cols-3 gap-1"
          aria-label="탐색 목록"
          renderItem={(post) => (
            <Link to={`/p/${post.id}`}>
              <img
                className="aspect-square w-full rounded-sm object-cover"
                src={post.imageUrl}
                alt={`${post.username} 의 게시물`}
              />
            </Link>
          )}
        />
      )}
    </Section>
  );
}
