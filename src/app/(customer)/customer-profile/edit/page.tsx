import { CustomerProfileEditForm } from "@/features/customer-profile/components";

/** API 조회 계약 확정 전에는 Figma의 선택 상태만 초기 표시값으로 제공합니다. */
export default function CustomerProfileEditPage() {
  return (
    <CustomerProfileEditForm
      initialValues={{
        profileImageUrl: "/images/mover-profile-placeholder.png",
        name: "김코드",
        email: "codeit@email.com",
        phone: "010-1234-5678",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
        serviceTypeIds: ["SMALL", "HOME"],
        region: "서울",
      }}
    />
  );
}
