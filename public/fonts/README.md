# Pretendard 웹폰트 구성

원본은 Pretendard 1.3.9(`Version 1.309`, SIL OFL 1.1)의 가변 폰트입니다. 2MB 원본을 그대로 내려받지 않도록 두 단계로 나눠 제공합니다.

| 순위 | 파일 | 용도 | 로딩 |
| --- | --- | --- | --- |
| 1 | `PretendardVariable.core.woff2` (약 145KB) | 화면 문구에 쓰이는 글자 | `next/font/local`이 모든 페이지에서 preload |
| 2 | `pretendard-dynamic-subset/` (조각 93개) | 그 밖의 글자(이름·주소 등 사용자 입력) | `unicode-range`에 해당하는 글자가 화면에 나올 때만 해당 조각을 내려받음 |
| - | `PretendardVariable.woff2` (약 2MB) | 위 두 가지를 만드는 원본 | 페이지에서 불러오지 않음 |

연결 위치는 `src/app/[locale]/layout.tsx`, `src/app/global-error.tsx`(1순위)와 `src/app/globals.css`(2순위, `font-family` 순서)입니다.

## 핵심 서브셋에 들어 있는 글자

- ASCII, Latin-1, 일반 문장부호, 한글 호환 자모, 자주 쓰는 기호
- `messages/*.json`의 모든 번역 값에 나오는 글자
- `src/**/*.ts(x)`에서 주석을 뺀 나머지에 나오는 글자

새 문구에 여기 없는 글자가 생겨도 화면은 깨지지 않습니다. 그 글자만 2순위 조각에서 받아 같은 Pretendard로 그립니다. 다만 조각 요청이 늘어나므로, 문구가 많이 바뀌면 핵심 서브셋을 다시 만드는 것이 좋습니다.

## 다시 만드는 방법

`fonttools`와 `brotli`가 필요합니다(`pip install fonttools brotli`).

1. 위 세 묶음의 글자를 모아 원본에서 `pyftsubset`으로 추출합니다. 옵션은 `--flavor=woff2 --layout-features='*' --notdef-outline --name-IDs='*'`이고, 가변 축(`wght` 45~930)은 그대로 둡니다.
2. 결과를 `PretendardVariable.core.woff2`로 저장합니다.

## 동적 서브셋에서 공식 배포본과 다른 점

`pretendard-dynamic-subset/`의 woff2 조각 92개는 npm `pretendard@1.3.9`의 `dist/web/variable/woff2-dynamic-subset`과 같은 파일입니다. CSS는 두 가지를 고쳤습니다.

- **`unicode-range`를 조각에 실제로 들어 있는 글자로 좁혔습니다.** 공식 CSS는 폰트에 없는 한자 1,125자를 범위에 포함하고 있어, 일본어·중국어 화면에서 쓸모없는 조각 8개를 내려받았습니다.
- **`PretendardVariable.subset.rest.woff2`를 추가했습니다.** 공식 조각에는 원본 폰트의 글자 2,307자(확장 라틴·그리스·키릴 등)가 빠져 있어, 원본에서 직접 만든 조각으로 채웠습니다.
