"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getApiErrorMessage,
  getCurrentPasswordMismatchError,
} from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { patchCachedAuthUser } from "@/features/auth/auth.cache";

import {
  getMoverMyPage,
  moverMyPageKeys,
  updateMoverBasicInfo,
} from "../mover-mypage.api";
import type { MoverMyPageData } from "../mover-mypage.types";
import { MoverBasicInfoForm } from "./MoverBasicInfoForm";

export function MoverBasicInfoContent() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const myPageQuery = useQuery({
    queryKey: moverMyPageKeys.detail(),
    queryFn: ({ signal }) => getMoverMyPage(signal),
  });
  const mutation = useMutation({
    mutationFn: updateMoverBasicInfo,
    onSuccess: async (basicInfo) => {
      queryClient.setQueryData<MoverMyPageData>(moverMyPageKeys.detail(), (current) =>
        current ? { ...current, ...basicInfo, phone: basicInfo.phone || null } : current,
      );
      const userChanges = { ...basicInfo, phone: basicInfo.phone || null };
      patchCachedAuthUser(queryClient, userChanges);
      try {
        await refetchUser();
      } catch {
        patchCachedAuthUser(queryClient, userChanges);
      }
    },
  });

  if (myPageQuery.isPending) return <LoadingState message="기본정보를 불러오는 중이에요." />;
  if (myPageQuery.isError || !myPageQuery.data) {
    return (
      <ErrorState
        title="기본정보를 불러오지 못했어요."
        description={getApiErrorMessage(myPageQuery.error, "잠시 후 다시 시도해 주세요.")}
        onRetry={() => { void myPageQuery.refetch(); }}
      />
    );
  }

  const currentPasswordError = getCurrentPasswordMismatchError(mutation.error);

  return (
    <MoverBasicInfoForm
      initialValues={{
        name: myPageQuery.data.name,
        email: myPageQuery.data.email,
        phone: myPageQuery.data.phone ?? "",
      }}
      isPending={mutation.isPending}
      currentPasswordError={currentPasswordError}
      submissionError={
        mutation.error && !currentPasswordError
          ? getApiErrorMessage(mutation.error, "기본정보를 수정하지 못했습니다.")
          : undefined
      }
      onCurrentPasswordChange={() => mutation.reset()}
      onSubmit={(values) => mutation.mutateAsync(values)}
    />
  );
}
