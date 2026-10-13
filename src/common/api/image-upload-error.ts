import { ApiError } from "./error";

/**
 * 이미지를 첨부한 요청이 서버 애플리케이션에 닿기 전에 막혔는지 판정합니다.
 * 요청 본문이 프록시(nginx 등)의 크기 제한을 넘으면 프록시가 CORS 헤더 없이 413으로 끊어,
 * 브라우저는 상태 코드를 알려 주지 않고 fetch를 TypeError로 실패시킵니다. 프록시가 CORS 헤더를 붙이는 환경에서는 413이 그대로 옵니다.
 * 두 경우 모두 서버가 보낸 오류 문구가 없으므로 호출부가 이미지 용량 안내 문구를 대신 보여 줄 때 사용합니다.
 * @param error mutation이 던진 오류
 * @param attachedFile 그 요청에 첨부한 이미지이며 없으면 이미지 때문이 아니므로 false
 * @remarks TypeError는 단순 네트워크 끊김에서도 발생하므로 안내 문구는 용량과 네트워크를 함께 언급해야 합니다.
 */
export function isBlockedImageUploadError(
  error: unknown,
  attachedFile: File | null | undefined,
): boolean {
  if (!attachedFile) return false;
  if (error instanceof ApiError) return error.status === 413;
  return error instanceof TypeError;
}

/** 이미지 업로드 요청 자체가 막혔음을 나타냅니다. 화면은 이 오류일 때만 이미지 용량 안내 문구를 보여 줍니다. */
export class BlockedImageUploadError extends Error {
  constructor(cause: unknown) {
    super("Image upload request was blocked.", { cause });
    this.name = "BlockedImageUploadError";
  }
}

/**
 * 이미지 업로드 요청을 실행하고, 그 요청이 막혀 실패한 경우에만 BlockedImageUploadError로 바꿔 던집니다.
 * mutationFn 안에서 업로드 요청만 감싸야 합니다. 저장이 끝난 뒤 onSuccess에서 실행하는 후속 요청(사용자 정보 재조회 등)도
 * 네트워크가 끊기면 TypeError로 실패하는데, mutation.error만 보면 둘을 구분할 수 없어 이미 저장된 프로필을
 * 업로드 실패로 잘못 안내하게 되기 때문입니다.
 * @param attachedFile 요청에 첨부한 이미지
 * @param request 업로드 요청 한 건
 * @throws 업로드가 막힌 경우 BlockedImageUploadError, 그 외에는 원래 오류
 */
export async function runImageUploadRequest<T>(
  attachedFile: File | null | undefined,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (isBlockedImageUploadError(error, attachedFile)) throw new BlockedImageUploadError(error);
    throw error;
  }
}
