import { MoverMypageComponentExamples } from "./_components/MoverMypageComponentExamples";

/** 기사님 마이페이지 리뷰 영역의 공통 요소를 한 화면에서 검수하는 예시 라우트입니다. */
export default function MoverMypageComponentsExamplePage() {
  return (
    <main className="min-h-screen bg-[var(--background-100)] px-6 py-10 min-[744px]:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 rounded-3xl bg-[var(--gray-50)] p-6 min-[744px]:p-10">
        <header>
          <h1 className="text-2xl-bold text-[var(--black-400)]">
            기사님 마이페이지 리뷰 공통 컴포넌트
          </h1>
          <p className="text-md-regular mt-2 text-[var(--gray-500)]">
            별점 분포, 받은 리뷰 카드, 페이지네이션의 반응형과 상태를 확인합니다.
          </p>
        </header>
        <MoverMypageComponentExamples />
      </div>
    </main>
  );
}
