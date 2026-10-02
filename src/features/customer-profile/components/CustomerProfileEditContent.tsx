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
  customerProfileKeys,
  getCustomerProfile,
  toCustomerEditInitialValues,
  updateCustomerProfile,
} from "../customer-profile.api";
import { CustomerProfileEditForm } from "./CustomerProfileEditForm";

export function CustomerProfileEditContent() {
  const t = useTranslations("Profile");
  const apiErrorMessage = useApiErrorMessage();
  const common = useTranslations("Common");
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

  if (profileQuery.isPending) return <LoadingState message={t("loading")} />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title={t("loadError")}
        description={apiErrorMessage(profileQuery.error, common("errorDescription"))}
        onRetry={() => { void profileQuery.refetch(); }}
      />
    );
  }

  const currentPasswordError = getCurrentPasswordMismatchError(mutation.error);

  return (
    <CustomerProfileEditForm
      initialValues={toCustomerEditInitialValues(profileQuery.data)}
      isPending={mutation.isPending}
      currentPasswordError={currentPasswordError}
      submissionError={
        mutation.error && !currentPasswordError
          ? apiErrorMessage(mutation.error, t("updateError"))
          : undefined
      }
      onCurrentPasswordChange={() => mutation.reset()}
      onSubmit={(values) => mutation.mutateAsync(values)}
    />
  );
}
