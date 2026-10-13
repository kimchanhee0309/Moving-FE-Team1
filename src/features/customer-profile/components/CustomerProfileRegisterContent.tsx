"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  BlockedImageUploadError,
  runImageUploadRequest,
} from "@/common/api/image-upload-error";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assertProfileCompleted, isProfileCompletionError } from "@/features/auth/auth.cache";

import { createCustomerProfile, customerProfileKeys } from "../customer-profile.api";
import { CustomerProfileForm } from "./CustomerProfileForm";

export function CustomerProfileRegisterContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const imageText = useTranslations("ProfileImage");
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const mutation = useMutation({
    // 업로드 요청만 감싸 onSuccess의 후속 요청 실패를 이미지 업로드 실패로 안내하지 않게 합니다.
    mutationFn: (values: Parameters<typeof createCustomerProfile>[0]) =>
      runImageUploadRequest(values.profileImage, () => createCustomerProfile(values)),
    onSuccess: async (profile) => {
      queryClient.setQueryData(customerProfileKeys.current(), profile);
      const completedUser = await refetchUser();
      assertProfileCompleted(completedUser);
    },
  });

  return (
    <CustomerProfileForm
      mode="register"
      isLoading={mutation.isPending}
      submissionError={
        mutation.error
          ? isProfileCompletionError(mutation.error)
            ? t("profileConfirmError")
            : mutation.error instanceof BlockedImageUploadError
              ? imageText("uploadBlocked")
              : apiErrorMessage(mutation.error, t("registerError"))
          : undefined
      }
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
