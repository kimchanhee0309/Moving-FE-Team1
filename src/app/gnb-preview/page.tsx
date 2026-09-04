"use client";

import { Gnb } from "@/common/components/gnb";

export default function GnbPreviewPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "300px" }}>
      <div>
        <p style={{ padding: "8px 24px" }}>비회원(로그아웃)</p>
        <Gnb isAuthenticated={false} />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>
          로그인 (customer) — 아바타 클릭 시 프로필 드롭다운(프로필 수정/찜한 기사님/이사 리뷰/로그아웃)
        </p>
        <Gnb
          isAuthenticated
          user={{ role: "CUSTOMER", name: "홍길동" }}
          hasUnreadNotification
          onLogout={() => alert("로그아웃 클릭됨 (데모용 콜백)")}
        />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>
          로그인 (mover) — 아바타 클릭 시 프로필 드롭다운(마이페이지/로그아웃)
        </p>
        <Gnb
          isAuthenticated
          user={{ role: "MOVER", name: "김기사" }}
          onLogout={() => alert("로그아웃 클릭됨 (데모용 콜백)")}
        />
      </div>
    </div>
  );
}
