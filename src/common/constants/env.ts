const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL이 설정되지 않았습니다.");
}

export const ENV = {
  API_URL: apiUrl,
} as const;
