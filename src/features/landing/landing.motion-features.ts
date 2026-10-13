// LazyMotion이 hydration 뒤에 따로 내려받는 애니메이션 기능 묶음입니다.
// 랜딩 컴포넌트가 이 파일을 정적으로 import하면 지연 로딩이 풀리므로 반드시 동적 import로만 불러옵니다.
export { domAnimation as default } from "motion/react";
