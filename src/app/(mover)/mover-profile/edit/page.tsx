import { MoverProfileForm } from "@/features/mover-profile/components";

/** API 조회 계약 확정 전에는 Figma의 기사님 프로필 예시를 초기 표시값으로 사용합니다. */
export default function MoverProfileEditPage() {
  return (
    <MoverProfileForm
      mode="edit"
      initialValues={{
        profileImageUrl: "/images/mover-profile-placeholder.png",
        nickname: "김코드",
        careerYears: "8",
        shortIntroduction: "꼼꼼한 이사를 도와드립니다.",
        description: "안녕하세요. 이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다. 고객님의 물품을 소중하고 안전하게 운송하여 드립니다.",
        serviceTypeIds: ["SMALL"],
        regions: ["서울", "경기", "인천"],
      }}
    />
  );
}
