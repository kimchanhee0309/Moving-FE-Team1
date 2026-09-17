"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import {
  getMoverProfile,
  moverProfileKeys,
  toMoverProfileInitialValues,
  updateMoverProfile,
} from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileEditContent() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: moverProfileKeys.current(),
    queryFn: ({ signal }) => getMoverProfile(signal),
  });
  const mutation = useMutation({
    mutationFn: updateMoverProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(moverProfileKeys.current(), profile);
      void queryClient.invalidateQueries({ queryKey: ["mover-mypage"] });
    },
  });

  if (profileQuery.isPending) return <LoadingState message="기사님 프로필을 불러오는 중이에요." />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="기사님 프로필을 불러오지 못했어요."
        description={getApiErrorMessage(profileQuery.error, "잠시 후 다시 시도해 주세요.")}
        onRetry={() => { void profileQuery.refetch(); }}
      />
    );
  }

  return (
    <MoverProfileForm
      mode="edit"
      initialValues={toMoverProfileInitialValues(profileQuery.data)}
      isLoading={mutation.isPending}
      submissionError={mutation.error ? getApiErrorMessage(mutation.error, "기사님 프로필을 수정하지 못했습니다.") : undefined}
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
