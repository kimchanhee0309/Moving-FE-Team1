"use client";

import { useState } from "react";

import { Gnb, type GnbNotificationItem } from "@/common/components/gnb";

/**
 * customer 알림 데모 데이터. AGENTS.md 12번의 customer 알림 3종(새 견적/견적 확정/이사 당일)을
 * 각각 하나씩 담았다. Notification API 계약이 아직 없어(AGENTS.md 11번) `href`는 비워 두었다.
 */
const CUSTOMER_NOTIFICATION_ITEMS: GnbNotificationItem[] = [
  {
    id: "customer-new-quote",
    segments: [
      { text: "김코드 기사님의 " },
      { text: "소형이사 견적", emphasis: true },
      { text: "이 도착했어요" },
    ],
    timeAgo: "2시간 전",
  },
  {
    id: "customer-quote-confirmed",
    segments: [
      { text: "김코드 기사님의 견적이 " },
      { text: "확정", emphasis: true },
      { text: "되었어요" },
    ],
    timeAgo: "3시간 전",
  },
  {
    id: "customer-moving-day",
    segments: [
      { text: "내일은 " },
      { text: "경기(일산) → 서울(영등포) 이사 예정일", emphasis: true },
      { text: "이에요." },
    ],
    timeAgo: "5시간 전",
  },
  {
    id: "customer-read-example",
    segments: [
      { text: "박기사 기사님의 " },
      { text: "가정이사 견적", emphasis: true },
      { text: "이 도착했어요" },
    ],
    timeAgo: "1일 전",
    isRead: true,
  },
];

/**
 * mover 알림 데모 데이터. AGENTS.md 12번의 mover 알림 3종(새 요청/견적 확정/이사 당일)을 담았다.
 */
const MOVER_NOTIFICATION_ITEMS: GnbNotificationItem[] = [
  {
    id: "mover-new-request",
    segments: [
      { text: "홍길동 고객님의 " },
      { text: "소형이사 견적 요청", emphasis: true },
      { text: "이 도착했어요" },
    ],
    timeAgo: "1시간 전",
  },
  {
    id: "mover-quote-confirmed",
    segments: [
      { text: "홍길동 고객님과의 견적이 " },
      { text: "확정", emphasis: true },
      { text: "되었어요" },
    ],
    timeAgo: "4시간 전",
  },
  {
    id: "mover-moving-day",
    segments: [
      { text: "내일은 " },
      { text: "경기(일산) → 서울(영등포) 이사 예정일", emphasis: true },
      { text: "이에요." },
    ],
    timeAgo: "6시간 전",
  },
];

export default function GnbPreviewPage() {
  // 데모용 로컬 state. 실제로는 이 자리가 TanStack Query 캐시(알림 목록 조회 + 읽음 처리 mutation)가
  // 될 자리다. GNB는 이 state를 props로 받아 그리기만 하고, "닫으면 읽음 처리"는 onNotificationsRead
  // 콜백을 통해 이 페이지(호출부)가 결정한다.
  const [customerNotifications, setCustomerNotifications] = useState(CUSTOMER_NOTIFICATION_ITEMS);
  const hasUnreadCustomerNotification = customerNotifications.some((item) => !item.isRead);

  const handleCustomerNotificationsRead = () => {
    setCustomerNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "300px" }}>
      <div>
        <p style={{ padding: "8px 24px" }}>비회원(로그아웃)</p>
        <Gnb isAuthenticated={false} />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>
          로그인 (customer) — 아바타 클릭 시 프로필 드롭다운(프로필 수정/찜한 기사님/이사 리뷰/로그아웃),
          알림 벨 클릭 시 알림 드롭다운(새 견적/견적 확정/이사 당일 + 읽음 처리된 알림 1건). 알림을 열었다가
          닫으면 전부 읽음 처리되고, 알림 뱃지(점)도 사라진다.
        </p>
        <Gnb
          isAuthenticated
          user={{ role: "CUSTOMER", name: "홍길동" }}
          hasUnreadNotification={hasUnreadCustomerNotification}
          notificationItems={customerNotifications}
          onNotificationsRead={handleCustomerNotificationsRead}
          onLogout={() => alert("로그아웃 클릭됨 (데모용 콜백)")}
        />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>
          로그인 (mover) — 아바타 클릭 시 프로필 드롭다운(마이페이지/로그아웃), 알림 벨 클릭 시 알림
          드롭다운(새 요청/견적 확정/이사 당일 데모 데이터 3건)
        </p>
        <Gnb
          isAuthenticated
          user={{ role: "MOVER", name: "김기사" }}
          notificationItems={MOVER_NOTIFICATION_ITEMS}
          onLogout={() => alert("로그아웃 클릭됨 (데모용 콜백)")}
        />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>
          로그인 (customer) — 알림이 없는 경우(빈 상태). Figma에 빈 상태 디자인이 없어 팀 확인 전
          임시로 만든 문구다.
        </p>
        <Gnb isAuthenticated user={{ role: "CUSTOMER", name: "이영희" }} notificationItems={[]} />
      </div>
    </div>
  );
}
