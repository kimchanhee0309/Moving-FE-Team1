import { ProfileSelectionChipExamples } from "./_components/ProfileSelectionChipExamples";

/** 디자인 시스템 Chip 전체를 독립적으로 육안 검수하는 예시 라우트입니다. */
export default function ProfileSelectionChipExamplePage() {
  return (
    <main className="min-h-screen bg-[var(--background-100)] px-6 py-10 min-[744px]:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 rounded-3xl bg-[var(--gray-50)] p-6 min-[744px]:p-10">
        <header>
          <h1 className="text-2xl-bold text-[var(--black-400)]">
            Chip 공통 컴포넌트
          </h1>
          <p className="text-md-regular mt-2 text-[var(--gray-500)]">
            이사 유형·지정 견적·주소 형식·프로필 선택 Chip의 크기와 상태를 확인합니다.
          </p>
        </header>
        <ProfileSelectionChipExamples />
      </div>
    </main>
  );
}
