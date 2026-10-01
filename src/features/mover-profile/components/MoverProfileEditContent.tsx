"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { MOVER_MY_PAGE_QUERY_KEY } from "@/common/api/query-keys";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import {
  getMoverProfile,
  moverProfileKeys,
  toMoverProfileInitialValues,
  updateMoverProfile,
} from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileEditContent() {
  const t = useTranslations("Profile");
  const common = useTranslations("Common");
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: moverProfileKeys.current(),
    queryFn: ({ signal }) => getMoverProfile(signal),
  });
  const mutation = useMutation({
    mutationFn: updateMoverProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(moverProfileKeys.current(), profile);
      void queryClient.invalidateQueries({ queryKey: MOVER_MY_PAGE_QUERY_KEY });
    },
  });

  if (profileQuery.isPending) return <LoadingState message={t("moverLoading")} />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title={t("moverLoadError")}
        description={getApiErrorMessage(profileQuery.error, common("errorDescription"))}
        onRetry={() => { void profileQuery.refetch(); }}
      />
    );
  }

  return (
    <MoverProfileForm
      mode="edit"
      initialValues={toMoverProfileInitialValues(profileQuery.data)}
      isLoading={mutation.isPending}
      submissionError={mutation.error ? getApiErrorMessage(mutation.error, t("moverUpdateError")) : undefined}
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
