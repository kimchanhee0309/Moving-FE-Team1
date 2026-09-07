"use client";

import { useState } from "react";

import { Input, SearchInput, Textarea } from "@/common/components/Input";

/**
 * 공통 Input의 Figma size와 필수 상태를 한 화면에서 검수하기 위한 client 예시입니다.
 * 실제 인증·프로필 form 로직을 흉내 내지 않고 컴포넌트 자체의 상호작용만 확인합니다.
 */
export function InputExamples() {
  // 입력·비밀번호·검색·textarea가 실제 controlled props로 동작하는지 확인하는 로컬 예시 상태입니다.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [introduction, setIntroduction] = useState("");

  return (
    <div className="flex flex-col gap-12">
      {/* Outlined input: 기본 크기, 비밀번호, disabled, error, loading 상태를 한 번에 비교합니다. */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl-bold text-[var(--black-400)]">Outlined input</h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            입력하거나 Tab 키로 이동해 hover와 focus 상태를 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-8 min-[1200px]:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-md-semibold text-[var(--black-300)]">Default · SM</p>
            <Input
              label="이메일"
              type="email"
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-md-semibold text-[var(--black-300)]">Default · MD</p>
            <Input
              inputSize="md"
              label="별명"
              placeholder="별명을 입력해 주세요"
              helperText="최대 10자까지 입력할 수 있습니다."
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-md-semibold text-[var(--black-300)]">Disabled</p>
            <Input label="이메일" defaultValue="moving@example.com" disabled />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-md-semibold text-[var(--black-300)]">Error</p>
            <Input
              label="이메일"
              defaultValue="moving@"
              error="올바른 이메일 형식으로 입력해 주세요."
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-md-semibold text-[var(--black-300)]">Loading</p>
            <Input label="주소" defaultValue="주소를 확인하고 있습니다." isLoading />
          </div>
        </div>
      </section>

      {/* Search input: sm/md 크기, controlled value, clear callback, loading 우선순위를 확인합니다. */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl-bold text-[var(--black-400)]">Search input</h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            값이 있으면 오른쪽 지우기 버튼이 표시됩니다.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-8">
          <SearchInput
            placeholder="기사님을 검색해 보세요"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onClear={() => setSearchKeyword("")}
          />
          <SearchInput
            inputSize="md"
            placeholder="기사님을 검색해 보세요"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onClear={() => setSearchKeyword("")}
          />
          <SearchInput inputSize="sm" placeholder="검색 중" value="검색 중" isLoading readOnly />
        </div>
      </section>

      {/* Textarea: sm/md 크기와 default, error, disabled, loading 상태를 비교합니다. */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl-bold text-[var(--black-400)]">Textarea</h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            Figma의 SM 327px, MD 560px 너비와 160px 높이를 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-8">
          <Textarea
            label="한 줄 소개"
            placeholder="소개를 입력해 주세요"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
          />
            <Textarea
              inputSize="md"
              label="상세 설명"
              defaultValue="입력된 내용이 오류 상태일 때의 예시입니다."
              error="상세 설명을 다시 확인해 주세요."
          />
          <Textarea label="상세 설명" defaultValue="수정할 수 없는 내용입니다." disabled />
          <Textarea label="상세 설명" defaultValue="내용을 불러오고 있습니다." isLoading />
        </div>
      </section>
    </div>
  );
}
