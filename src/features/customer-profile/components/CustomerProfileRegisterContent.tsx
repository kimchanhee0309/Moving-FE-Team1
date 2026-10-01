"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assertProfileCompleted } from "@/features/auth/auth.cache";

import { createCustomerProfile, customerProfileKeys } from "../customer-profile.api";
import { CustomerProfileForm } from "./CustomerProfileForm";

export function CustomerProfileRegisterContent() {
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
      submissionError={mutation.error ? getApiErrorMessage(mutation.error, "프로필을 등록하지 못했습니다.") : undefined}
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
