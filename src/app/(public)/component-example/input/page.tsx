import { InputExamples } from "./_components/InputExamples";

/**
 * Input 계열만 독립적으로 육안 검수하는 예시 라우트입니다.
 * 페이지는 정적 레이아웃만 담당하고 상호작용 상태는 가장 작은 client 경계인 InputExamples에 둡니다.
 */
export default function InputExamplePage() {
  return (
    <main className="min-h-screen bg-[var(--background-100)] px-6 py-10 min-[744px]:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 rounded-3xl bg-[var(--gray-50)] p-6 min-[744px]:p-10">
        <header>
          <h1 className="text-2xl-bold text-[var(--black-400)]">Input 공통 컴포넌트</h1>
          <p className="text-md-regular mt-2 text-[var(--gray-500)]">
            outlined input, search input, textarea의 크기와 상태를 확인하는 예시 페이지입니다.
          </p>
        </header>
        <InputExamples />
      </div>
    </main>
  );
}
