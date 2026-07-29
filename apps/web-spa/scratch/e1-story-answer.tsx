// apps/web-spa/scratch/e1-story-answer.tsx
// E-1 과제 1 답안 — PostHeader 와 더보기 버튼을 유틸리티로 옮긴 모습.
//
// 실제 src/components/PostHeader.tsx 는 E-2 에서 나머지 컴포넌트와 함께 옮긴다.
// 여기서는 답안이 같은 값을 내는지만 확인해 둔다.
//
// ⚠️ globals.css 의 @source not "../../scratch" 때문에 이 파일의 유틸리티는
//    CSS 가 생성되지 않는다. 값 검증은 아래 기록대로 실제 PostHeader 에
//    잠시 적용해서 브라우저 computed style 로 확인했고, 그 뒤 되돌렸다.
//
// 옮기는 대상이던 손 CSS:
//   .post-header { display:flex; align-items:center; justify-content:space-between; }
//   .post-more   { border:none; background:none; color:#262626; font-size:18px;
//                  line-height:1; padding:12px; cursor:pointer; }
//
// 브라우저 computed style 대조 (손 CSS -> 유틸리티)
//   display          flex            -> flex            같음
//   align-items      center          -> center          같음
//   justify-content  space-between   -> space-between   같음
//   cursor           pointer         -> pointer         같음
//   padding          12px            -> 12px            같음
//   font-size        18px            -> 18px            같음
//   line-height      18px            -> 18px            같음 (leading-none)
//   color            rgb(38,38,38)   -> rgb(38,38,38)   같음
//   background-color transparent     -> transparent     같음
//   border-style     none            -> solid           다름 (border-width 는 양쪽 0)
//
// 다른 곳이 하나 있다. 손 CSS 의 border:none 은 border-style 을 none 으로 만들지만
// 유틸리티를 안 주면 리셋이 solid + 0px 를 남긴다. 두께가 0 이라 화면은 같다.
//
// 그리고 실측으로 확인한 것: color 유틸리티는 필요 없다.
// text-[#262626] 을 빼도 색이 rgb(38,38,38) 그대로였다. body 가 이미 같은 색이라
// 버튼이 물려받기 때문이다. 손 CSS 의 선언을 하나씩 기계적으로 옮기면
// 이렇게 필요 없는 유틸리티가 따라붙는다.
import { Avatar } from '../src/components/Avatar';
import { IconButton } from '../src/components/IconButton';

interface PostHeaderProps {
  username: string;
  profileImageUrl: string;
}

export function PostHeaderAnswer({ username, profileImageUrl }: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Avatar username={username} profileImageUrl={profileImageUrl} />
      <IconButton className="cursor-pointer p-3 text-[18px] leading-none" aria-label="게시물 메뉴">
        ⋯
      </IconButton>
    </div>
  );
}
