"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  getCurrentPasswordMismatchError,
} from "@/common/api/get-error-message";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
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
  const t = useTranslations("Account");
  const apiErrorMessage = useApiErrorMessage();
  const common = useTranslations("Common");
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

  if (myPageQuery.isPending) return <LoadingState message={t("basicInfoLoading")} />;
  if (myPageQuery.isError || !myPageQuery.data) {
    return (
      <ErrorState
        title={t("basicInfoLoadError")}
        description={apiErrorMessage(myPageQuery.error, common("errorDescription"))}
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
          ? apiErrorMessage(mutation.error, t("basicInfoUpdateError"))
          : undefined
      }
      onCurrentPasswordChange={() => mutation.reset()}
      onSubmit={(values) => mutation.mutateAsync(values)}
    />
  );
}
