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

import { createMoverProfile, moverProfileKeys } from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileRegisterContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const imageText = useTranslations("ProfileImage");
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const mutation = useMutation({
    // 업로드 요청만 감싸 onSuccess의 후속 요청 실패를 이미지 업로드 실패로 안내하지 않게 합니다.
    mutationFn: (values: Parameters<typeof createMoverProfile>[0]) =>
      runImageUploadRequest(values.profileImage, () => createMoverProfile(values)),
    onSuccess: async (profile) => {
      queryClient.setQueryData(moverProfileKeys.current(), profile);
      const completedUser = await refetchUser();
      assertProfileCompleted(completedUser);
    },
  });

  return (
    <MoverProfileForm
      mode="register"
      isLoading={mutation.isPending}
      submissionError={
        mutation.error
          ? isProfileCompletionError(mutation.error)
            ? t("profileConfirmError")
            : mutation.error instanceof BlockedImageUploadError
              ? imageText("uploadBlocked")
              : apiErrorMessage(mutation.error, t("moverRegisterError"))
          : undefined
      }
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
