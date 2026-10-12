"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assertProfileCompleted, isProfileCompletionError } from "@/features/auth/auth.cache";

import { createMoverProfile, moverProfileKeys } from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileRegisterContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const mutation = useMutation({
    mutationFn: createMoverProfile,
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
            : apiErrorMessage(mutation.error, t("moverRegisterError"))
          : undefined
      }
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
