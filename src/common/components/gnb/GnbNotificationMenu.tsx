"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

import type { GnbNotificationItem, GnbNotificationMenuProps } from "./gnb.types";
import styles from "./GnbNotificationMenu.module.css";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

/**
 * 알림 드롭다운의 치수/타이포그래피는 `GnbProfileMenu`와 마찬가지로 role(customer/mover)이 아니라
 * **화면 폭**에 따라 달라진다. Figma 컴포넌트(`Componenet/dropdown/알림`)의 `size` variant는
 * "sm"(태블릿/모바일, 312px 폭)과 "md"(PC, 359px 폭)이며, 이 저장소의 다른 GNB 반응형 기준과 맞춰
 * 1200px 미만(모바일+태블릿, 드로어 유지 구간)은 sm, 1200px 이상(PC)은 md 스타일을 쓴다.
 *
 * 색상은 `src/styles/colors.css` 토큰을 사용한다. Figma 변수 값과 완전히 일치하지 않는 항목은
 * `GnbProfileMenu`와 같은 방식으로 가장 가까운 기존 토큰을 사용했다(세부 내용은 컴포넌트 작업 보고 참고):
 * - Figma `black/black-400`(#262524) → 저장소 `--black-400`(#1e1e1e)로 근사
 * - Figma `gray/gray-300`(#ababab, 시간 텍스트) → 저장소 `--gray-400`(#b3b3b3)로 근사
 *   (저장소 `--gray-300`은 #d9d9d9라 이름은 같지만 값 차이가 훨씬 커서 값 기준으로 더 가까운 토큰을 선택했다)
 */
const NOTIFICATION_MENU_SIZE = {
  /** 드롭다운 전체(카드) 폭. sm(기본) → md(1200px 이상) */
  panelWidth: "w-[312px] min-[1200px]:w-[359px]",
  /** 상단 "알림" 헤더 행의 안쪽 여백. */
  headerPadding: "pl-4 pr-3 py-3.5 min-[1200px]:pl-6",
  /** 알림 항목/빈 상태 행의 안쪽 여백. */
  itemPadding: "px-4 py-3 min-[1200px]:px-6 min-[1200px]:py-4",
  /** 헤더 타이포그래피/색상. */
  titleText: "text-lg-bold text-(--black-300) min-[1200px]:text-2lg-bold min-[1200px]:text-(--black-400)",
  /**
   * 알림 문구 타이포그래피(크기만). 색상은 읽음 여부에 따라 달라져서 여기 포함하지 않는다
   * ({@link NotificationItemContent}에서 `isRead`에 따라 별도로 붙인다) — 같은 요소에 색상 유틸리티
   * 두 개를 동시에 넣으면 어느 게 이길지 클래스 선언 순서가 아니라 Tailwind 생성 순서에 좌우돼
   * 예측하기 어렵기 때문이다.
   */
  itemText: "text-md-medium min-[1200px]:text-lg-medium",
  /** 상대 시간(예: "2시간 전") 타이포그래피/색상. */
  timeText: "text-sm-medium text-(--gray-400) min-[1200px]:text-md-medium",
  /**
   * 알림 목록 영역의 최대 높이(5건 분량) — 그 이상은 스크롤로 본다. 알림 문구가 1줄이라고
   * 가정하고 `itemPadding` + (`itemText`/`timeText` line-height 합 + `gap-0.5` 2px) + 구분선
   * 1px(4건)을 5건치 더한 근사치다(Figma 수치 아님): sm = (12*2 + 24+2+22)*5 + 4 = 364px,
   * md = (16*2 + 26+2+24)*5 + 4 = 424px. 문구가 길어 2줄 이상이 되면 실제로는 5건보다 적게
   * 보일 수 있다.
   */
  listMaxHeight: "max-h-[364px] min-[1200px]:max-h-[424px]",
};

function NotificationItemContent({ item }: { item: GnbNotificationItem }) {
  // 읽은 알림은 강조색(emphasis)도 포함해 전체적으로 흐리게 보이도록, 텍스트 자체에 muted 톤을 준다
  // (opacity로 배경까지 옅어지면 hover 배경 등 다른 요소와 간섭할 수 있어 색상만 낮춘다).
  const isRead = item.isRead ?? false;

  return (
    <>
      <p
        className={`m-0 ${NOTIFICATION_MENU_SIZE.itemText} ${
          isRead ? "text-(--gray-400)" : "text-(--black-400)"
        }`}
      >
        {item.segments.map((segment, index) => (
          // 한 알림 문장을 구성하는 정적 텍스트 조각이라 순서가 바뀌거나 추가/삭제되지 않으므로 index를
          // key로 사용해도 안전하다(개별 알림 항목 자체의 key는 `item.id`를 쓴다).
          <span
            key={index}
            className={segment.emphasis && !isRead ? "text-(--primary-400)" : undefined}
          >
            {segment.text}
          </span>
        ))}
      </p>
      <p className={`m-0 ${NOTIFICATION_MENU_SIZE.timeText}`}>{item.timeAgo}</p>
    </>
  );
}

/**
 * GNB 알림 벨을 클릭하면 트리거 바로 아래에 나타나는 anchored 드롭다운.
 *
 * `Gnb`가 열림 상태를 소유하는 controlled 컴포넌트이며, 열려 있을 때만 부모에 의해 마운트된다.
 * 알림 목록/문구는 전부 props로 받는 순수 표시 컴포넌트이고(API 호출/조회 로직 없음), 치수/타이포그래피는
 * 화면 폭(`lg` 기준 PC vs 태블릿/모바일)에 따라 달라진다({@link NOTIFICATION_MENU_SIZE} 참고).
 */
export function GnbNotificationMenu({
  menuId,
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  closeButtonRef,
  triggerRef,
  onNavigate,
  onClose,
}: GnbNotificationMenuProps) {
  const t = useTranslations("Common");
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 알림 목록은 패널 안의 내부 스크롤 영역이라(페이지 전체 스크롤이 아니라) root를 뷰포트가
  // 아닌 이 스크롤 컨테이너로 지정해야 바닥에 닿았을 때만 정확히 트리거된다.
  useEffect(() => {
    if (!hasMore) return;

    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root, rootMargin: "80px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onClose, triggerRef]);

  useEffect(() => {
    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  return (
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-label={t("notificationList")}
      className={`absolute top-full right-0 z-10 mt-2 flex flex-col items-start rounded-3xl border border-(--line-200) bg-(--gray-50) px-4 py-2.5 shadow-[2px_2px_8px_rgba(0,0,0,0.06)] ${NOTIFICATION_MENU_SIZE.panelWidth}`}
    >
      <div
        role="none"
        className={`flex w-full items-center justify-between border-b border-(--line-200) ${NOTIFICATION_MENU_SIZE.headerPadding}`}
      >
        <p className={`m-0 ${NOTIFICATION_MENU_SIZE.titleText}`}>{t("notifications")}</p>
        <button
          ref={closeButtonRef}
          type="button"
          role="menuitem"
          onClick={onClose}
          aria-label={t("closeNotifications")}
          className={`inline-flex size-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 ${FOCUS_RING}`}
        >
          <Image src="/images/gnb/icon-x.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      </div>

      {items.length === 0 ? (
        <p
          role="none"
          className={`m-0 w-full text-center ${NOTIFICATION_MENU_SIZE.itemText} text-(--gray-400) ${NOTIFICATION_MENU_SIZE.itemPadding}`}
        >
          {t("noNotifications")}
        </p>
      ) : (
        <div
          ref={listRef}
          className={`w-full overflow-y-auto overscroll-contain ${styles.notificationList} ${NOTIFICATION_MENU_SIZE.listMaxHeight}`}
        >
          {items.map((item, index) => {
            const isLastItem = index === items.length - 1;
            const rowClassName = `flex w-full flex-col gap-0.5 ${
              isLastItem ? "" : "border-b border-(--line-200)"
            } ${NOTIFICATION_MENU_SIZE.itemPadding}`;

            return item.href ? (
              <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                onClick={onNavigate}
                className={`no-underline hover:bg-(--background-200) ${rowClassName} ${FOCUS_RING}`}
              >
                <NotificationItemContent item={item} />
              </Link>
            ) : (
              <div key={item.id} role="none" className={rowClassName}>
                <NotificationItemContent item={item} />
              </div>
            );
          })}

          {/* 뷰포트가 아닌 이 스크롤 영역을 기준으로 바닥 근접을 감지하는 빈 sentinel. hasMore가
              아니면 관찰 자체를 하지 않으므로(위 effect) 평소엔 아무 영향이 없다. */}
          {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full shrink-0" />}

          {isLoadingMore && (
            <p
              role="none"
              className={`m-0 w-full text-center ${NOTIFICATION_MENU_SIZE.timeText} ${NOTIFICATION_MENU_SIZE.itemPadding}`}
            >
              {t("loadingMore")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
