"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/common/api/error";
import { customerQuoteQueryKeys } from "@/features/customer-quote/api/customer-quote.keys";

import { moveRequestKeys } from "../constants/move-request.constants";
import {
  createMoveRequest,
  deleteMoveRequest,
  fetchActiveMoveRequest,
  updateMoveRequest,
} from "../move-request.api";
import type { CreateMoveRequestPayload, UpdateMoveRequestPayload } from "../move-request.types";

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

/**
 * 활성 이사 견적 요청을 수정합니다("수정하기" — `MoveRequestForm`을 edit 모드로 재사용).
 * 성공하면 활성 요청 캐시를 즉시 새 값으로 채워서, `MoveRequestPage`가 카드 화면으로 돌아갔을 때
 * 바로 수정된 내용을 보여준다(다시 GET을 기다리지 않는다).
 *
 * `customer-quote` 기능이 같은 활성 요청을 `customerQuoteQueryKeys.activeMoveRequest()`로
 * 완전히 별도 캐싱하고, "내 견적 관리"의 대기 견적 카드(`pendingList`)에도 이사일/주소가
 * 그대로 내려와 박혀 있다 — 여길 무효화하지 않으면 수정 직후 그 화면들이 예전 값을 계속
 * 보여준다(사용자가 직접 리랜더링/재방문해야만 새 GET이 일어나 바뀜). 두 기능이 같은 서버
 * 자원을 독립적으로 캐싱하는 구조 자체는 중복이라 근본적으로는 하나로 합쳐야 하지만, 그건
 * customer-quote 담당(권태현)과 협의할 범위 밖 리팩터링이라 지금은 무효화만 함께 건다.
 */
export function useUpdateMoveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moveRequestId,
      payload,
    }: {
      moveRequestId: string;
      payload: UpdateMoveRequestPayload;
    }) => updateMoveRequest(moveRequestId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(moveRequestKeys.active(), data);
      void queryClient.invalidateQueries({
        queryKey: customerQuoteQueryKeys.activeMoveRequest(),
      });
      void queryClient.invalidateQueries({
        queryKey: customerQuoteQueryKeys.pendingList(),
      });
    },
  });
}

/**
 * 활성 이사 견적 요청을 삭제합니다. 성공 응답은 204(body 없음)라 `data.moveRequest`를 받을 수
 * 없으므로, `fetchActiveMoveRequest`와 같은 shape(`{ moveRequest: null }`)을 직접 채워 넣는다 —
 * 이렇게 해야 `useActiveMoveRequest`의 `select`가 즉시 "활성 요청 없음"으로 읽고
 * `MoveRequestPage`가 다시 `MoveRequestForm`(생성 폼)으로 돌아간다.
 */
export function useDeleteMoveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moveRequestId: string) => deleteMoveRequest(moveRequestId),
    onSuccess: () => {
      queryClient.setQueryData(moveRequestKeys.active(), { moveRequest: null });
    },
  });
}
