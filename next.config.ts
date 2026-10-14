import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // 기본 목록에 480을 더했습니다. 모바일(DPR 1.75~2)에서 240px로 그리는 랜딩 캐릭터처럼 384px보다 조금 큰 이미지가
    // 640px 파일을 받지 않게 합니다. deviceSizes의 최솟값(640)보다 작아야 합니다.
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
    // Trusted, locally-bundled design-system icons (e.g. GNB logo/menu icons) are SVGs.
    // Only local/trusted assets should ever be served through next/image with this enabled.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default createNextIntlPlugin()(nextConfig);
