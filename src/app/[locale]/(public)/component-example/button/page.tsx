import { ButtonExamples } from "./_components/ButtonExamples";

/** 공통 버튼 검수용 페이지입니다. 실제 API 없이 상태와 반응형 크기를 확인합니다. */
export default function ButtonExamplePage() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-10">
      <h1 className="text-2xl-bold">Button / Etc 공통 컴포넌트</h1>
      <ButtonExamples />
    </main>
  );
}
