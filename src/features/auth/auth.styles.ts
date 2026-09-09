/**
 * 인증 화면에만 쓰는 Tailwind 조합입니다. 공통 토큰과 typography를 우선합니다.
 * Figma 1:1978/1:2106 기준: 744px 태블릿, 프로젝트 GNB와 동일한 1200px 데스크톱 전환.
 * unlayered typography.css 및 현재 dev의 Button CSS Module과 겹치는 반응형 수치에만 !를 붙입니다.
 */
const LINK_STYLE =
  "text-(--primary-400) font-semibold underline underline-offset-[3px] focus-visible:outline-[3px] focus-visible:outline-(--primary-400) focus-visible:outline-offset-[4px] focus-visible:rounded-[4px]";
const SMALL_COPY =
  "max-[744px]:text-[12px]! max-[744px]:leading-[18px]! max-[744px]:text-(--black-100)";

export const AUTH_STYLES = {
  background:
    "min-h-[calc(100svh-88px)] overflow-x-clip bg-(--primary-400) px-[24px] pt-[45px] pb-[76px] min-[744px]:max-[1200px]:min-h-[calc(100svh-54px)] min-[744px]:max-[1200px]:pt-[75px] min-[744px]:max-[1200px]:pb-[88px] max-[744px]:min-h-[calc(100svh-54px)] max-[744px]:bg-(--gray-50) max-[744px]:pt-[58px] max-[744px]:pb-[104px]",
  panel:
    "relative mx-auto w-full max-w-[740px] rounded-[40px] bg-(--gray-50) px-[50px] py-[48px] min-[744px]:max-[1200px]:max-w-[640px] min-[744px]:max-[1200px]:px-[40px] min-[744px]:max-[1200px]:py-[68px] max-[744px]:max-w-[560px] max-[744px]:rounded-none max-[744px]:p-0",
  header: "mb-[48px] flex flex-col items-center gap-[8px] max-[744px]:gap-0",
  wordmark:
    "flex h-[100px] w-full items-center justify-center max-[744px]:h-[84px] focus-visible:outline-[3px] focus-visible:outline-(--primary-400) focus-visible:outline-offset-[4px]",
  wordmarkImage: "h-[56px] w-[107px] max-[744px]:h-[46px] max-[744px]:w-[88px]",
  roleSwitch: `text-xl-regular text-center text-(--black-200) ${SMALL_COPY} max-[744px]:leading-[20px]!`,
  link: LINK_STYLE,
  content: "flex flex-col",
  form: "flex flex-col gap-[24px] max-[744px]:gap-[12px]",
  fields: "flex flex-col",
  // 오류 발생 전에도 메시지 행을 확보합니다. 공통 Input의 기존 label/field/message 구조를 유지합니다.
  field:
    "grid grid-rows-[auto_54px_minmax(32px,auto)] max-w-none gap-0! after:col-start-1 after:row-start-3 after:content-[''] [&>p]:col-start-1 [&>p]:row-start-3 [&>p]:pt-[4px] [&>p]:text-[12px]! [&>p]:leading-[20px]! [&>label]:mb-[16px] [&>label]:text-[20px]! [&>label]:font-normal! [&>label]:leading-[32px]! [&>div]:h-[54px] [&_input]:text-[18px]! [&_input::placeholder]:text-(--input-placeholder) max-[744px]:grid-rows-[auto_54px_minmax(20px,auto)] max-[744px]:[&>p]:leading-[16px]! max-[744px]:[&>label]:mb-[8px] max-[744px]:[&>label]:text-[14px]! max-[744px]:[&>label]:leading-[24px]! max-[744px]:[&_input]:text-[16px]!",
  submit:
    "max-[744px]:min-h-[54px]! max-[744px]:rounded-[12px]! max-[744px]:px-[16px]! max-[744px]:py-[12px]! max-[744px]:text-[16px]!",
  accountSwitch: `text-xl-regular mt-[24px] text-center text-(--black-200) max-[744px]:mt-[16px] ${SMALL_COPY} max-[744px]:leading-[20px]!`,
  social: "mt-[48px]",
  socialCopy: `text-xl-regular text-center text-(--black-200) ${SMALL_COPY}`,
  socialButtons:
    "mt-[32px] flex items-center justify-center gap-[32px] max-[744px]:mt-[24px] max-[744px]:gap-[24px]",
  socialButton:
    "cursor-pointer rounded-full disabled:cursor-not-allowed disabled:opacity-50 focus-visible:rounded-[4px] focus-visible:outline-[3px] focus-visible:outline-(--primary-400) focus-visible:outline-offset-[4px]",
  socialImage: "size-[72px] max-[744px]:size-[54px]",
  error: "text-md-regular mt-[16px] text-(--primary-400)",
  character:
    "pointer-events-none absolute bottom-[-52px] left-[calc(100%-60px)] size-[392px] object-contain min-[744px]:max-[1200px]:bottom-[-74px] min-[744px]:max-[1200px]:left-[calc(100%-137px)] min-[744px]:max-[1200px]:h-[246px] min-[744px]:max-[1200px]:w-[240px] max-[744px]:hidden",
} as const;
