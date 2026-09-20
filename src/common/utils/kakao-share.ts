import { ENV } from "@/common/constants/env";

const KAKAO_SDK_SRC =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

/** 기존 스크립트가 load/error를 이미 끝낸 뒤에도 리스너만 달면 Promise가 멈출 수 있어 제한 시간을 둡니다. */
const SCRIPT_LOAD_TIMEOUT_MS = 10_000;

const SCRIPT_LOAD_STATE_ATTR = "data-kakao-load-state";

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

function getExistingKakaoScript(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>(
    `script[src="${KAKAO_SDK_SRC}"]`,
  );
}

/** load/error가 이미 끝난 스크립트인지 확인합니다. 끝난 뒤엔 새 리스너가 실행되지 않습니다. */
function hasScriptFinishedLoading(script: HTMLScriptElement): boolean {
  const trackedState = script.getAttribute(SCRIPT_LOAD_STATE_ATTR);
  if (trackedState === "loaded" || trackedState === "error") {
    return true;
  }

  const readyState = (
    script as HTMLScriptElement & { readyState?: string }
  ).readyState;
  return readyState === "complete" || readyState === "loaded";
}

function markScriptLoadState(
  script: HTMLScriptElement,
  state: "loading" | "loaded" | "error",
) {
  script.setAttribute(SCRIPT_LOAD_STATE_ATTR, state);
}

function waitForExistingScript(script: HTMLScriptElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const settle = (result: () => void) => {
      window.clearTimeout(timeoutId);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      result();
    };

    const handleLoad = () => {
      markScriptLoadState(script, "loaded");
      settle(() => {
        if (window.Kakao) {
          resolve();
          return;
        }
        script.remove();
        reject(new Error("Kakao SDK를 초기화할 수 없습니다."));
      });
    };

    const handleError = () => {
      markScriptLoadState(script, "error");
      settle(() => {
        script.remove();
        reject(new Error("Kakao SDK 스크립트 로드에 실패했습니다."));
      });
    };

    const timeoutId = window.setTimeout(() => {
      settle(() => {
        script.remove();
        reject(
          new Error("Kakao SDK 스크립트 로드가 시간 초과되었습니다."),
        );
      });
    }, SCRIPT_LOAD_TIMEOUT_MS);

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
  });
}

function injectKakaoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    markScriptLoadState(script, "loading");

    const settle = (result: () => void) => {
      window.clearTimeout(timeoutId);
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      result();
    };

    const handleLoad = () => {
      markScriptLoadState(script, "loaded");
      settle(() => {
        if (window.Kakao) {
          resolve();
          return;
        }
        script.remove();
        reject(new Error("Kakao SDK를 초기화할 수 없습니다."));
      });
    };

    const handleError = () => {
      markScriptLoadState(script, "error");
      settle(() => {
        script.remove();
        reject(new Error("Kakao SDK 스크립트 로드에 실패했습니다."));
      });
    };

    const timeoutId = window.setTimeout(() => {
      settle(() => {
        script.remove();
        reject(
          new Error("Kakao SDK 스크립트 로드가 시간 초과되었습니다."),
        );
      });
    }, SCRIPT_LOAD_TIMEOUT_MS);

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });
}

function loadKakaoScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(
      new Error("Kakao SDK는 브라우저에서만 로드할 수 있습니다."),
    );
  }

  if (window.Kakao) {
    return Promise.resolve();
  }

  const existing = getExistingKakaoScript();
  if (existing) {
    // 이미 load/error가 끝난 스크립트에 리스너만 붙이면 pending으로 남습니다.
    if (hasScriptFinishedLoading(existing)) {
      existing.remove();
      return injectKakaoScript();
    }
    return waitForExistingScript(existing);
  }

  return injectKakaoScript();
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
