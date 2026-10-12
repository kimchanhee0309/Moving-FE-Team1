"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { ApiError } from "@/common/api/error";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { Button } from "@/common/components/button";
import { Modal } from "@/common/components/MoverModal/Modal";
import { ROUTES } from "@/common/constants/routes";
import { MOVE_REQUEST_STATUS } from "@/common/constants/domain";
import { useDeleteMoveRequest } from "@/features/move-request/hooks/useMoveRequest";
import type { MoveRequestDto } from "@/features/move-request/move-request.types";
import { formatMoveDateLabel, parseAddressFromApi } from "@/features/move-request/move-request.utils";

/**
 * 이사 유형(`ServiceType`) 표시용 한글 라벨입니다. `MoveTypeCard`/`QuoteCard`가 이미 각자
 * 화면 전용으로 같은 라벨을 로컬로 들고 있는 것과 같은 패턴으로, 여기서도 카드 한 곳에서만
 * 쓰는 표시용 문구라 공용 상수로 올리지 않고 이 파일 안에 둔다.
 */
interface MoveRequestBlockedStateProps {
  /** 지금 진행 중인 활성 견적 요청(`useActiveMoveRequest`). 카드에 그대로 표시한다. */
  moveRequest: MoveRequestDto;
  /** "수정하기"를 눌렀을 때 호출된다. 실제 수정 폼 전환은 `MoveRequestPage`가 담당한다. */
  onEditRequest: () => void;
}

/**
 * 이미 활성 견적 요청이 있을 때 보여주는 화면입니다.
 *
 * 원래 Figma `견적요청_disabled/Mobile·Tablet·Desktop`(node 1:7668, 1:7651, 1:7659)를 그대로 옮긴
 * 정적 안내 문구뿐이었지만, 이번 작업(고객이 활성 요청을 수정/삭제할 수 있어야 함)으로 "현재 요청
 * 카드 + 수정하기/삭제하기" 버튼이 추가됐다.
 *
 * 중요: 2026-09-29 기준 Figma MCP(`get_design_context`, node 1:7659/1:7651)로 다시 확인했지만
 * 두 노드 모두 여전히 기존 정적 안내 문구만 있고 카드·수정하기·삭제하기 UI는 없었다(Mobile
 * node 1:7668은 이번엔 확인하지 않음). 즉 이 파일의 카드/버튼 레이아웃은 실제 Figma 디자인을
 * 그대로 옮긴 것이 아니라, 이 저장소의 다른 카드 UI(`features/customer-quote/components/QuoteCard`의
 * rounded-[20px] 카드 톤, 공용 `Button`, 기존 이 파일의 배경/타이포 토큰)를 참고해 만든 임시
 * 레이아웃이다. Figma가 실제로 갱신되면(또는 다른 node를 확인하면) 간격·색상·구조를 다시 맞춰야
 * 한다 — 사용자가 화면을 본 뒤 같이 다듬기로 합의했다.
 */
export function MoveRequestBlockedState({
  moveRequest,
  onEditRequest,
}: MoveRequestBlockedStateProps) {
  const t = useTranslations("MoveRequest");
  const apiErrorMessage = useApiErrorMessage();
  const moveType = useTranslations("MoveType");
  const profile = useTranslations("Profile");
  const locale = useLocale();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMoveRequestMutation = useDeleteMoveRequest();

  // BE가 WAITING 상태만 수정·삭제를 허용한다(견적 확정 이후에는 요청 내용을 되돌릴 수 없게
  // 한다는 팀 결정). "활성 요청"으로 조회되는 상태는 WAITING/CONFIRMED뿐이라 여기서는
  // WAITING 여부만 확인하면 된다.
  const canEditOrDelete = moveRequest.status === MOVE_REQUEST_STATUS.WAITING;

  const openDeleteModal = () => {
    setDeleteError(null);
    deleteMoveRequestMutation.reset();
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteMoveRequestMutation.isPending) return;
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleteError(null);

    try {
      await deleteMoveRequestMutation.mutateAsync(moveRequest.id);
      // 성공하면 활성 요청 캐시가 null로 바뀌어 MoveRequestPage가 알아서 생성 폼으로 돌아간다 —
      // 이 컴포넌트 자체가 unmount되므로 모달을 별도로 닫을 필요가 없다.
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(apiErrorMessage(error, t("deleteError")));
        return;
      }
      setDeleteError(t("deleteError"));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--background-200)">
      {/*
        페이지 제목 바. Figma 마스터 컴포넌트(`Header`, size=lg)는 이사 종류/예정일/지역/완료
        4단계 progress bar를 포함하지만 이 disabled 인스턴스들에서는 전부 숨김 처리돼 있어
        제목 텍스트만 그린다. 이 진행 바가 실제 견적 요청 폼(위저드)에도 필요한지는 이번 작업
        범위(disabled 화면) 밖이라 그대로 두었다 — 작업 보고에 별도로 남긴다.

        컨테이너 폭·좌우 padding은 GNB(`Gnb.tsx`)의 `max-w-[1920px]` + `px-6/px-18/px-40`
        기준과 반드시 맞춰야 한다 — 예전에는 이 헤더만 `max-w-[1200px]`+`min-[1200px]:px-0`을
        써서, 1200px 이상 화면에서는 GNB 로고 왼쪽 끝과 이 제목의 왼쪽 끝 기준 컨테이너가
        서로 다른 폭으로 각자 중앙정렬돼(가운데 정렬 기준점이 다름) 화면이 커질수록 두 지점의
        간격이 한없이 벌어졌다(예: 2560px 화면에서 GNB 로고는 폭 1920px 기준으로 고정되는데
        제목은 폭 1200px 기준으로 더 오른쪽까지 밀려남).
      */}
      <header className="w-full shrink-0 bg-(--gray-50) shadow-[0px_2px_10px_rgba(248,248,248,0.1)] min-[744px]:shadow-none min-[1200px]:shadow-[0px_2px_10px_rgba(248,248,248,0.1)]">
        <div className="mx-auto flex w-full max-w-[1920px] items-center p-6 min-[744px]:h-[54px] min-[744px]:px-18 min-[744px]:py-0 min-[1200px]:h-auto min-[1200px]:px-40 min-[1200px]:py-8">
          <h1 className="m-0 text-2lg-semibold text-(--content-strong) min-[744px]:text-(--black-500) min-[1200px]:text-2xl-semibold">
            {t("activeTitle")}
          </h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16 min-[1200px]:gap-8">
        <div className="flex flex-col items-center">
          <div
            aria-hidden="true"
            className="relative h-[180px] w-[181px] min-[1200px]:h-[280px] min-[1200px]:w-[280px]"
          >
            {/*
              에셋 자체가 이미 30% 투명도로 export돼 있다(Figma 레이어 opacity가 export에 그대로
              반영됨) — 원본 100% 불투명 색상 에셋 위에 CSS `opacity-30`를 다시 걸면 두 번 겹쳐
              적용되어 Figma보다 훨씬 옅게 보인다. 그래서 이 이미지에는 추가 opacity를 주지 않는다.
            */}
            <Image
              src="/images/move-request/moving-car.png"
              alt=""
              fill
              sizes="(min-width: 1200px) 280px, 181px"
              className="object-contain"
            />
          </div>

          <div className="text-md-regular text-center text-(--input-placeholder) min-[1200px]:text-xl-regular">
            <p className="m-0">{t("activeDescription")}</p>
            <p className="m-0">
              {canEditOrDelete
                ? t("activeEditable")
                : t("activeConfirmed")}
            </p>
          </div>
        </div>

        {/*
          활성 요청 요약 카드. Figma에 아직 이 구조가 없어(위 컴포넌트 주석 참고) 카드 톤은
          `QuoteCard`(rounded-[20px], border-(--line-100), 동일한 그림자)를 그대로 따르고,
          내부 정보 배치(라벨-값 dl)는 이 페이지 전용으로 새로 구성했다.
        */}
        <article className="flex w-full max-w-[520px] flex-col gap-6 rounded-[20px] border-[0.5px] border-(--line-100) bg-(--gray-50) px-6 py-6 shadow-[-2px_-2px_10px_rgba(220,220,220,0.2),2px_2px_10px_rgba(220,220,220,0.2)] min-[744px]:px-10 min-[744px]:py-8">
          <span className="inline-flex w-fit items-center rounded-md bg-(--primary-100) px-2 py-1 text-md-semibold text-(--primary-400)">
            {moveType(moveRequest.serviceType)}
          </span>

          <dl className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-md-medium text-(--gray-400)">{t("date")}</dt>
              <dd className="text-md-semibold text-(--black-400)">
                {formatMoveDateLabel(new Date(moveRequest.moveDate), locale)}
              </dd>
            </div>

            <div className="h-px w-full bg-(--line-100)" aria-hidden="true" />

            {/*
              moveRequest.fromAddress/toAddress는 BE 저장 형식 그대로
              `[zonecode] roadAddress (jibunAddress)`라 우편번호·지번 괄호가 그대로 노출된다(실제
              주소 검색으로 만든 요청으로 재현·확인함 — seed 데이터는 이 형식을 안 따라 지금까지
              드러나지 않았다). parseAddressFromApi로 roadAddress만 뽑아 고객에게 보여준다.
            */}
            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-md-medium text-(--gray-400)">{t("from")}</dt>
              <dd className="min-w-0 flex-1 text-right text-md-regular text-(--black-400) [word-break:break-word]">
                {parseAddressFromApi(moveRequest.fromAddress).roadAddress}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-md-medium text-(--gray-400)">{t("to")}</dt>
              <dd className="min-w-0 flex-1 text-right text-md-regular text-(--black-400) [word-break:break-word]">
                {parseAddressFromApi(moveRequest.toAddress).roadAddress}
              </dd>
            </div>
          </dl>

          {canEditOrDelete ? (
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outlined" fullWidth onClick={onEditRequest}>
                {t("edit")}
              </Button>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={openDeleteModal}
                className="border-(--secondary-red-200)! text-(--secondary-red-200)! shadow-none!"
              >
                {t("delete")}
              </Button>
            </div>
          ) : null}
        </article>

        <Link
          href={ROUTES.CUSTOMER.QUOTE.PENDING}
          className="inline-flex h-[54px] items-center justify-center rounded-xl bg-(--primary-400) px-6 py-4 text-lg-semibold text-(--gray-50) min-[1200px]:h-16 min-[1200px]:rounded-2xl min-[1200px]:text-2lg-semibold"
        >
          {t("viewQuotes")}
        </Link>
      </main>

      {isDeleteModalOpen && typeof document !== "undefined"
        ? createPortal(
            <Modal
              isOpen={isDeleteModalOpen}
              title={t("deleteTitle")}
              mobileLayout="centered"
              closeOnBackdrop={!deleteMoveRequestMutation.isPending}
              onClose={closeDeleteModal}
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-(--black-300)">
                  <p className="text-lg-semibold">{t("deleteQuestion")}</p>
                  <p className="text-sm-regular text-(--gray-500)">
                    {t("deleteWarning")}
                  </p>
                </div>

                {deleteError ? (
                  <p
                    role="alert"
                    className="rounded-xl bg-(--secondary-red-100) px-4 py-3 text-sm-medium text-(--secondary-red-200)"
                  >
                    {deleteError}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    disabled={deleteMoveRequestMutation.isPending}
                    onClick={closeDeleteModal}
                  >
                    {profile("cancel")}
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    isLoading={deleteMoveRequestMutation.isPending}
                    onClick={handleDelete}
                    className="enabled:bg-(--secondary-red-200)! enabled:hover:bg-(--secondary-red-200)!"
                  >
                    {t("delete")}
                  </Button>
                </div>
              </div>
            </Modal>,
            document.body,
          )
        : null}
    </div>
  );
}
