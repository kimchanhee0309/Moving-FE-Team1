"use client";

import { useState } from "react";

import { Button, IconButton } from "@/common/components/Button";

/** 예시 상태만 관리합니다. 공유 버튼은 외부 전송 없이 콜백 전달 여부를 보여줍니다. */
export function ButtonExamples() {
  const [clicks, setClicks] = useState(0);
  const [submits, setSubmits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [message, setMessage] = useState("버튼을 눌러 동작을 확인하세요.");

  return (
    <>
      {(["solid", "outlined"] as const).map((variant) => (
        <section key={variant} className="flex flex-col gap-4">
          <h2 className="text-xl-semibold">{variant === "solid" ? "Solid CTA" : "Outlined CTA"}</h2>
          {(["sm", "md"] as const).map((size) => (
            <div key={size} className="flex flex-col items-start gap-3">
              <p className="text-md-regular">{size} · {size === "sm" ? "54px" : "60px"}</p>
              <Button variant={variant} size={size} onClick={() => setClicks((value) => value + 1)}>Primary CTA 버튼</Button>
              <Button variant={variant} size={size} disabled onClick={() => setClicks((value) => value + 1)}>비활성 버튼</Button>
              {variant === "solid" && <Button size={size} withWritingIcon onClick={() => setMessage("글쓰기 버튼 클릭")}>리뷰 작성하기</Button>}
            </div>
          ))}
        </section>
      ))}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl-semibold">Etc</h2>
        {(["xs", "sm", "md"] as const).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-4">
            <span className="text-md-regular">{size}</span>
            {size !== "xs" && <IconButton kind="like" size={size} aria-label="기사님 찜" aria-pressed={isLiked} onClick={() => setIsLiked((value) => !value)} />}
            <IconButton kind="clip" size={size} aria-label="링크 복사" onClick={() => setMessage("링크 복사 콜백 호출")} />
            <IconButton kind="kakao" size={size} aria-label="카카오로 공유" onClick={() => setMessage("카카오 공유 콜백 호출")} />
            <IconButton kind="facebook" size={size} aria-label="페이스북으로 공유" onClick={() => setMessage("페이스북 공유 콜백 호출")} />
          </div>
        ))}
        <div className="flex gap-4">
          <IconButton kind="clip" aria-label="복사 비활성" disabled />
          <IconButton kind="clip" aria-label="복사 진행 중" isLoading />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl-semibold">로딩 · 폼 · 긴 문구</h2>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isLoading} onChange={(event) => setIsLoading(event.target.checked)} />로딩 상태</label>
        <form className="flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); setSubmits((value) => value + 1); }}>
          <Button isLoading={isLoading} onClick={() => setClicks((value) => value + 1)}>기본 버튼 (폼 제출 없음)</Button>
          <Button type="submit" variant="outlined">폼 제출</Button>
        </form>
        <div className="w-full max-w-[240px]"><Button fullWidth>긴 한국어 문구도 작은 화면에서 잘리지 않고 표시됩니다</Button></div>
        <output className="text-md-regular" aria-live="polite">클릭 {clicks}회 · 제출 {submits}회 · 찜 {isLiked ? "선택" : "해제"} · {message}</output>
      </section>
    </>
  );
}
