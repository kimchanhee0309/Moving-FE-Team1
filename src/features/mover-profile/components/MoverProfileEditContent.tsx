"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  BlockedImageUploadError,
  runImageUploadRequest,
} from "@/common/api/image-upload-error";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { MOVER_MY_PAGE_QUERY_KEY } from "@/common/api/query-keys";
import { ErrorState, LoadingState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import { useRouter } from "@/i18n/navigation";

import {
  getMoverProfile,
  moverProfileKeys,
  toMoverProfileInitialValues,
  updateMoverProfile,
} from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileEditContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const imageText = useTranslations("ProfileImage");
  const common = useTranslations("Common");
  const queryClient = useQueryClient();
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: moverProfileKeys.current(),
    queryFn: ({ signal }) => getMoverProfile(signal),
  });
  const mutation = useMutation({
    // 업로드 요청만 감싸 onSuccess의 후속 요청 실패를 이미지 업로드 실패로 안내하지 않게 합니다.
    mutationFn: (values: Parameters<typeof updateMoverProfile>[0]) =>
      runImageUploadRequest(values.profileImage, () => updateMoverProfile(values)),
    onSuccess: async (profile) => {
      queryClient.setQueryData(moverProfileKeys.current(), profile);
      // 저장 직후 마이페이지로 이동하므로, 도착했을 때 예전 닉네임·이미지가 완료 안내와 함께 보이지 않도록
      // 화면에 없는(비활성) 마이페이지 캐시까지 지금 다시 받아 둡니다. 기본 무효화는 비활성 쿼리를 만료 표시만 합니다.
      // 다시 받기에 실패해도 저장은 끝났으므로 오류로 만들지 않으며, 마이페이지가 열릴 때 한 번 더 조회합니다.
      await queryClient.invalidateQueries({ queryKey: MOVER_MY_PAGE_QUERY_KEY, refetchType: "all" });
    },
  });

  if (profileQuery.isPending) return <LoadingState message={t("moverLoading")} />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title={t("moverLoadError")}
        description={apiErrorMessage(profileQuery.error, common("errorDescription"))}
        onRetry={() => { void profileQuery.refetch(); }}
      />
    );
  }

  return (
    <MoverProfileForm
      mode="edit"
      initialValues={toMoverProfileInitialValues(profileQuery.data)}
      isLoading={mutation.isPending}
      submissionError={
        mutation.error
          ? mutation.error instanceof BlockedImageUploadError
            ? imageText("uploadBlocked")
            : apiErrorMessage(mutation.error, t("moverUpdateError"))
          : undefined
      }
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
        // 저장이 끝나면 수정 화면에 머물지 않고, 바뀐 프로필을 바로 확인할 수 있는 마이페이지로 돌아갑니다.
        router.push(ROUTES.MOVER.MY_PAGE_UPDATED("profile"));
      }}
    />
  );
}
