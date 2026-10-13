"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CopyLinkToast } from "@/common/components/CopyLinkToast";
import { ROUTES } from "@/common/constants/routes";
import { useRouter } from "@/i18n/navigation";

type UpdatedTarget = "profile" | "basic-info";

function readUpdatedTarget(value: string | null): UpdatedTarget | null {
  return value === "profile" || value === "basic-info" ? value : null;
}

/**
 * 프로필·기본 정보 수정을 마치고 마이페이지로 돌아왔을 때 완료 안내를 한 번 보여 줍니다.
 * 수정 화면이 ROUTES.MOVER.MY_PAGE_UPDATED로 이동하며 남긴 updated 값을 읽으며, 저장 요청과 캐시 갱신은 담당하지 않습니다.
 * useSearchParams를 쓰므로 호출부에서 Suspense로 감싸야 합니다.
 */
export function MoverMyPageUpdateNotice() {
  const profile = useTranslations("Profile");
  const account = useTranslations("Account");
  const router = useRouter();
  const updatedParam = useSearchParams().get("updated");
  // 아래에서 주소의 updated 값을 지워도 안내는 남아야 하므로 처음 읽은 값을 state로 보관합니다.
  const [target] = useState(() => readUpdatedTarget(updatedParam));
  const [isVisible, setIsVisible] = useState(target !== null);

  useEffect(() => {
    // 값이 주소에 남아 있으면 새로고침이나 뒤로가기 때 안내가 다시 뜨므로 읽은 뒤 바로 지웁니다.
    if (updatedParam !== null) router.replace(ROUTES.MOVER.MY_PAGE, { scroll: false });
  }, [router, updatedParam]);

  if (!target) return null;

  return (
    <CopyLinkToast
      isVisible={isVisible}
      message={target === "profile" ? profile("moverUpdated") : account("basicInfoUpdated")}
      onClose={() => setIsVisible(false)}
    />
  );
}
