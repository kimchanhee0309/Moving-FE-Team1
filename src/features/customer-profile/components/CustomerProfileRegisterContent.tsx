"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ROUTES } from "@/common/constants/routes";
import { resolveAuthenticatedPath } from "@/features/auth/auth.utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { patchCachedAuthUser } from "@/features/auth/auth.cache";

import { createCustomerProfile, customerProfileKeys } from "../customer-profile.api";
import { CustomerProfileForm } from "./CustomerProfileForm";

export function CustomerProfileRegisterContent({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, refetchUser } = useAuth();
  const mutation = useMutation({
    mutationFn: createCustomerProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(customerProfileKeys.current(), profile);
      patchCachedAuthUser(queryClient, { profileCompleted: true });
      let completedUser = user ? { ...user, profileCompleted: true } : null;
      try {
        completedUser = (await refetchUser()) ?? completedUser;
      } catch {
        patchCachedAuthUser(queryClient, { profileCompleted: true });
      }
      router.replace(completedUser ? resolveAuthenticatedPath(completedUser, redirectTo) : ROUTES.PUBLIC.MOVER_SEARCH);
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
