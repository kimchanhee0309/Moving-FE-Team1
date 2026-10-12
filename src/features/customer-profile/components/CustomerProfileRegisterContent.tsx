"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assertProfileCompleted, isProfileCompletionError } from "@/features/auth/auth.cache";

import { createCustomerProfile, customerProfileKeys } from "../customer-profile.api";
import { CustomerProfileForm } from "./CustomerProfileForm";

export function CustomerProfileRegisterContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const mutation = useMutation({
    mutationFn: createCustomerProfile,
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
            : apiErrorMessage(mutation.error, t("registerError"))
          : undefined
      }
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
