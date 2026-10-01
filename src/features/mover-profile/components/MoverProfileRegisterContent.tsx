"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assertProfileCompleted } from "@/features/auth/auth.cache";

import { createMoverProfile, moverProfileKeys } from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileRegisterContent() {
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
      submissionError={mutation.error ? getApiErrorMessage(mutation.error, "기사님 프로필을 등록하지 못했습니다.") : undefined}
      onSubmit={async (values) => { await mutation.mutateAsync(values); }}
    />
  );
}
