const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL이 설정되지 않았습니다.");
}

/** 카카오톡 공유용. 미설정이어도 앱은 기동하고, 공유 시에만 오류를 냅니다. */
const kakaoJavascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? "";

export const ENV = {
  API_URL: apiUrl,
  KAKAO_JAVASCRIPT_KEY: kakaoJavascriptKey,
} as const;
