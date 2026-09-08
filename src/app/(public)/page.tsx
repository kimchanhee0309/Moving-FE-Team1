import { LandingPage } from "./_components/LandingPage";

/** 홈 경로는 public 그룹에서만 정의해 공통 GNB와 랜딩을 함께 표시합니다. */
export default function HomePage() {
  return <LandingPage />;
}
