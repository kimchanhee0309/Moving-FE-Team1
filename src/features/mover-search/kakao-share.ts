import { isRemoteAssetUrl } from "@/common/api/asset-url";
import { ENV } from "@/common/constants/env";

import { KAKAO_SHARE_FALLBACK_IMAGE_PATH } from "./mover-search.constants";

function ensureKakaoReady(): boolean {
  if (!ENV.KAKAO_JAVASCRIPT_KEY) {
    return false;
  }

  const kakao = window.Kakao;
  if (!kakao) {
    return false;
  }

  if (!kakao.isInitialized()) {
    kakao.init(ENV.KAKAO_JAVASCRIPT_KEY);
  }

  return kakao.isInitialized();
}

export function getKakaoShareImageUrl(
  profileImageUrl: string | null | undefined,
  origin: string,
): string {
  if (
    typeof profileImageUrl === "string" &&
    isRemoteAssetUrl(profileImageUrl) &&
    profileImageUrl.startsWith("https://")
  ) {
    return profileImageUrl;
  }

  return `${origin}${KAKAO_SHARE_FALLBACK_IMAGE_PATH}`;
}

export function shareMoverDetailToKakao(params: {
  url: string;
  /** 호출부가 현재 locale로 만든 공유 카드 제목 */
  title: string;
  introduction: string;
  imageUrl: string;
}): boolean {
  if (!ensureKakaoReady()) {
    return false;
  }

  const kakao = window.Kakao;
  if (!kakao) {
    return false;
  }

  try {
    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: params.title,
        description: params.introduction,
        imageUrl: params.imageUrl,
        link: {
          mobileWebUrl: params.url,
          webUrl: params.url,
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}
