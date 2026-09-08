# Button / Etc

Figma 디자인 시스템의 [Button 영역](https://www.figma.com/design/fgvdOrZSUPdiBm3OwVPmCm?node-id=1-1695)을 기준으로 구현합니다.
검수 주소: `/component-example/button`.

```tsx
import { Button, IconButton } from "@/common/components/button";

<Button size="md" fullWidth isLoading={isSaving} onClick={handleSave}>저장</Button>
<Button variant="outlined" disabled={!canSubmit} type="submit">확인</Button>
<Button withWritingIcon onClick={handleWrite}>리뷰 작성하기</Button>
<IconButton kind="clip" size="xs" aria-label="기사님 링크 복사" onClick={handleCopy} />
<IconButton kind="like" aria-label="기사님 찜" aria-pressed={isLiked} onClick={handleLike} />
```

- CTA: `solid` / `outlined`, `sm`(327×54) / `md`(640×60). 부모가 좁으면 너비가 줄고 긴 문구는 줄바꿈됩니다. `fullWidth`는 부모 너비를 채웁니다.
- `leadingIcon` / `trailingIcon`은 24px 장식 아이콘입니다. `withWritingIcon`은 Figma solid-icon용 흰색 글쓰기 아이콘입니다.
- Etc: `like`, `clip`, `kakao`, `facebook`. `xs` 40px / `sm` 54px / `md` 64px이며 `like`에는 xs가 없습니다.
- 기본 type은 `button`. 폼 제출은 명시적으로 `type="submit"`을 사용합니다. native props와 React 19 `ref`를 지원합니다.
- `isLoading` / `disabled`는 클릭을 막습니다. 로딩 시 아이콘 대신 spinner를 표시하며 원래 접근 가능한 이름은 유지합니다. 아이콘 버튼에는 `aria-label`이 필수입니다.
- API, clipboard, 공유 SDK, 인증, 상태 갱신은 호출부 책임입니다. 예시 페이지도 외부 공유를 실행하지 않습니다.
- Check box / Filter는 Figma에서 별도 영역으로, 이번 Button/Etc 범위에 포함하지 않습니다.

## 디자인 토큰

색상 이름 대신 실제 값으로 기존 토큰을 대응합니다. Figma 비활성 채움 `#D9D9D9`는 저장소의 `--gray-300`, 비활성 문구 `#808080`는 `--content-muted`입니다.
기존 `--primary-500`은 기본 색상과 같으므로 hover `#E04829`, 비활성 테두리 `#C4C4C4`, 카카오 `#FAE100`은 Button.module.css에 한정된 변수로 정의했습니다.
아이콘은 MCP에서 받은 원본 SVG를 `public/icons/button`에 보관합니다. 기존 `ic-like.svg`와는 색상/모양이 달라 별도 원본을 사용합니다.
