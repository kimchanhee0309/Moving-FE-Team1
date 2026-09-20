import { ENV } from "@/common/constants/env";

const KAKAO_SDK_SRC =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoSDK {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Share: {
    sendDefault: (settings: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: KakaoShareLink;
      };
      buttons?: Array<{
        title: string;
        link: KakaoShareLink;
      }>;
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

let sdkLoadPromise: Promise<KakaoSDK> | null = null;

function loadKakaoScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(
      new Error("Kakao SDK는 브라우저에서만 로드할 수 있습니다."),
    );
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${KAKAO_SDK_SRC}"]`,
  );
  if (existing) {
    if (window.Kakao) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Kakao SDK 스크립트 로드에 실패했습니다.")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Kakao SDK 스크립트 로드에 실패했습니다.")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

async function getKakaoSDK(): Promise<KakaoSDK> {
  if (!ENV.KAKAO_JAVASCRIPT_KEY) {
    throw new Error("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY가 설정되지 않았습니다.");
  }

  if (window.Kakao?.isInitialized()) {
    return window.Kakao;
  }

  if (!sdkLoadPromise) {
    sdkLoadPromise = (async () => {
      await loadKakaoScript();
      if (!window.Kakao) {
        throw new Error("Kakao SDK를 초기화할 수 없습니다.");
      }
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(ENV.KAKAO_JAVASCRIPT_KEY);
      }
      return window.Kakao;
    })().catch((error: unknown) => {
      sdkLoadPromise = null;
      throw error;
    });
  }

  return sdkLoadPromise;
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${normalizedPath}`;
}

export interface ShareToKakaoTalkParams {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonTitle?: string;
}

/** 카카오톡 피드 공유. JavaScript 키로 SDK를 초기화한 뒤 sendDefault를 호출합니다. */
export async function shareToKakaoTalk({
  url,
  title,
  description,
  imageUrl,
  buttonTitle = "자세히 보기",
}: ShareToKakaoTalkParams): Promise<void> {
  const kakao = await getKakaoSDK();
  const link: KakaoShareLink = {
    mobileWebUrl: url,
    webUrl: url,
  };

  kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl: toAbsoluteUrl(imageUrl),
      link,
    },
    buttons: [
      {
        title: buttonTitle,
        link,
      },
    ],
  });
}
