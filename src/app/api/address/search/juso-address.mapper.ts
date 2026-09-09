import type { AddressResult } from "@/common/components/AddressCard";

/**
 * 행정안전부 도로명주소 API(`GET /addrlink/addrLinkApi.do`, `resultType=json`) 응답의
 * 주소 한 건입니다. 실제 응답에는 행정동/건물관리번호 등 더 많은 필드가 있지만, 매핑에
 * 쓰는 필드만 선언합니다.
 */
export interface JusoAddressItem {
  /** 도로명주소 전체 문자열. */
  roadAddr: string;
  /** 지번주소 전체 문자열. */
  jibunAddr: string;
  /** 5자리 우편번호. */
  zipNo: string;
}

export interface JusoSearchResponse {
  results: {
    common: {
      /** "0"이면 정상, 그 외는 오류(인증키 오류/쿼터 초과 등)입니다. */
      errorCode: string;
      errorMessage: string;
      totalCount: string;
      currentPage: string;
      countPerPage: string;
    };
    /** 오류 응답에는 이 배열 자체가 없을 수 있어 optional로 둡니다. */
    juso?: JusoAddressItem[];
  };
}

/**
 * juso.go.kr 응답 body가 우리가 사용하는 최소 계약(`results.common.errorCode`)을 만족하는지
 * 방어적으로 확인합니다. 응답 형식이 바뀌거나 오류 body가 온 경우 호출부가
 * "INVALID_JUSO_RESPONSE"로 처리하게 합니다.
 */
export function isJusoSearchResponse(body: unknown): body is JusoSearchResponse {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const results = (body as { results?: unknown }).results;
  if (typeof results !== "object" || results === null) {
    return false;
  }

  const common = (results as { common?: unknown }).common;
  return typeof common === "object" && common !== null && "errorCode" in common;
}

/** juso.go.kr 주소 한 건을 공용 `AddressResult`(`AddressCard.types.ts`)로 매핑합니다. */
export function mapJusoItemToAddressResult(item: JusoAddressItem): AddressResult {
  return {
    zonecode: item.zipNo,
    roadAddress: item.roadAddr,
    jibunAddress: item.jibunAddr,
  };
}
