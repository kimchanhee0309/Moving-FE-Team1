"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ROUTES } from "@/common/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { patchCachedAuthUser } from "@/features/auth/auth.cache";

import { createMoverProfile, moverProfileKeys } from "../mover-profile.api";
import { MoverProfileForm } from "./MoverProfileForm";

export function MoverProfileRegisterContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  const mutation = useMutation({
    mutationFn: createMoverProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(moverProfileKeys.current(), profile);
      patchCachedAuthUser(queryClient, { profileCompleted: true });
      try {
        await refetchUser();
      } catch {
        patchCachedAuthUser(queryClient, { profileCompleted: true });
      }
      router.replace(ROUTES.MOVER.MY_PAGE);
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
