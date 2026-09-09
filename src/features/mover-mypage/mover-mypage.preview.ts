import type { MoverMyPageData } from "./mover-mypage.types";

/** API 응답 계약이 To Do인 동안 Figma의 success 화면을 검수하기 위한 표시 전용 데이터입니다. */
export const MOVER_MY_PAGE_PREVIEW: MoverMyPageData = {
  nickname: "김코드",
  profileImageUrl: "/images/mover-profile-placeholder.png",
  shortIntroduction: "고객님의 물품을 안전하게 운송해 드립니다.",
  description:
    "안녕하세요. 이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.\n고객님의 물품을 소중하고 안전하게 운송하여 드립니다. 소형이사 및 가정이사 서비스를 제공하며 서비스 가능 지역은 서울과 경기권입니다.",
  careerYears: 7,
  confirmedCount: 334,
  favoriteCount: 136,
  rating: 5,
  reviewCount: 178,
  serviceLabels: ["소형이사", "가정이사"],
  regionLabels: ["서울", "경기"],
  ratingCounts: [
    { score: 5, count: 170 },
    { score: 4, count: 8 },
    { score: 3, count: 0 },
    { score: 2, count: 0 },
    { score: 1, count: 0 },
  ],
  reviews: [
    {
      id: "review-preview-1",
      reviewerName: "kim****",
      writtenAt: "2024-07-01",
      rating: 5,
      content: "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
    },
    {
      id: "review-preview-2",
      reviewerName: "kim****",
      writtenAt: "2024-07-01",
      rating: 5,
      content: "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
    },
    {
      id: "review-preview-3",
      reviewerName: "kim****",
      writtenAt: "2024-07-01",
      rating: 5,
      content: "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
    },
    {
      id: "review-preview-4",
      reviewerName: "kim****",
      writtenAt: "2024-07-01",
      rating: 5,
      content: "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
    },
    {
      id: "review-preview-5",
      reviewerName: "kim****",
      writtenAt: "2024-07-01",
      rating: 5,
      content: "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
    },
  ],
};
