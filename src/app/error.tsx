"use client";

import { useEffect } from "react";
import { ErrorState } from "@/common/components/page-state";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="페이지를 불러오지 못했어요."
      description="일시적인 문제가 발생했습니다."
      onRetry={reset}
    />
  );
}
