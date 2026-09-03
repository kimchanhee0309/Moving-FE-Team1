import { Gnb } from "@/common/components/gnb";

export default function GnbPreviewPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <p style={{ padding: "8px 24px" }}>비회원(로그아웃)</p>
        <Gnb isAuthenticated={false} />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>로그인 (customer)</p>
        <Gnb
          isAuthenticated
          user={{ role: "CUSTOMER", name: "홍길동", profileHref: "/customer/profile" }}
          hasUnreadNotification
        />
      </div>
      <div>
        <p style={{ padding: "8px 24px" }}>로그인 (mover)</p>
        <Gnb
          isAuthenticated
          user={{ role: "MOVER", name: "김기사", profileHref: "/mover/mypage" }}
        />
      </div>
    </div>
  );
}
