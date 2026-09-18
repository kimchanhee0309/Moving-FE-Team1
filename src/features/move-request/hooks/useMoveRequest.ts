"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/common/api/error";

import { moveRequestKeys } from "../constants/move-request.constants";
import { createMoveRequest, fetchActiveMoveRequest } from "../move-request.api";
import type { CreateMoveRequestPayload } from "../move-request.types";

/**
 * 현재 로그인한 고객의 활성 이사 견적 요청 여부를 조회합니다.
 * `/move-request` 페이지가 이 값으로 입력 폼과 `MoveRequestBlockedState`를 분기합니다.
 */
export function useActiveMoveRequest() {
  return useQuery({
    queryKey: moveRequestKeys.active(),
    queryFn: fetchActiveMoveRequest,
    select: (data) => data.moveRequest,
    staleTime: 30_000,
  });
}

/**
 * 새 이사 견적 요청을 생성합니다. 성공하면 활성 요청 캐시를 즉시 채워서, 제출 직후
 * 같은 페이지가 다시 마운트돼도 "활성 요청 있음" 상태로 바로 분기되게 합니다.
 */
export function useCreateMoveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMoveRequestPayload) => createMoveRequest(payload),
    onSuccess: (data) => {
      // queryFn(fetchActiveMoveRequest)과 같은 raw 응답 shape(`{ moveRequest }`)을 그대로 캐시에 넣는다 —
      // useActiveMoveRequest의 `select`가 이 shape을 전제로 `.moveRequest`를 꺼내 쓴다.
      queryClient.setQueryData(moveRequestKeys.active(), data);
    },
    onError: (error) => {
      // 캐시엔 활성 요청이 없다고 남아있는데 서버가 409(이미 진행 중)를 반환하면, 다시 조회해서
      // MoveRequestPage가 MoveRequestBlockedState로 전환되게 한다.
      if (error instanceof ApiError && error.status === 409) {
        return queryClient.invalidateQueries({ queryKey: moveRequestKeys.active() });
      }
    },
  });
}
