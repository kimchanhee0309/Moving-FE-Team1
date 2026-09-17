"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { patchCachedAuthUser } from "@/features/auth/auth.cache";

import {
  customerProfileKeys,
  getCustomerProfile,
  toCustomerEditInitialValues,
  updateCustomerProfile,
} from "../customer-profile.api";
import { CustomerProfileEditForm } from "./CustomerProfileEditForm";

export function CustomerProfileEditContent() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const profileQuery = useQuery({
    queryKey: customerProfileKeys.current(),
    queryFn: ({ signal }) => getCustomerProfile(signal),
  });
  const mutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(customerProfileKeys.current(), profile);
      const userChanges = { name: profile.name, email: profile.email, phone: profile.phone };
      patchCachedAuthUser(queryClient, userChanges);
      try {
        await refetchUser();
      } catch {
        patchCachedAuthUser(queryClient, userChanges);
      }
    },
  });

  if (profileQuery.isPending) return <LoadingState message="프로필을 불러오는 중이에요." />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="프로필을 불러오지 못했어요."
        description={getApiErrorMessage(profileQuery.error, "잠시 후 다시 시도해 주세요.")}
        onRetry={() => { void profileQuery.refetch(); }}
      />
    );
  }

  return (
    <CustomerProfileEditForm
      initialValues={toCustomerEditInitialValues(profileQuery.data)}
      isPending={mutation.isPending}
      submissionError={mutation.error ? getApiErrorMessage(mutation.error, "프로필을 수정하지 못했습니다.") : undefined}
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
