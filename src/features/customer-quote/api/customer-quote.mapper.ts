import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

import {
  DEFAULT_MOVER_PROFILE_IMAGE,
  type CustomerQuoteDetail,
} from "../model/customer-quote.model";
import type {
  ApiActiveMoveRequest,
  ApiQuoteListItem,
  ApiQuoteStatus,
  CustomerQuoteHistoryGroupView,
  CustomerQuoteListItemView,
  CustomerQuoteMoveRequestView,
} from "./customer-quote.types";

function toServiceType(value: string): ServiceType {
  if (value === SERVICE_TYPE.SMALL) return SERVICE_TYPE.SMALL;
  if (value === SERVICE_TYPE.HOME) return SERVICE_TYPE.HOME;
  if (value === SERVICE_TYPE.OFFICE) return SERVICE_TYPE.OFFICE;
  throw new Error(`Unsupported serviceType: ${value}`);
}

/** BE PROPOSED → FE PENDING. 지원 값만 매핑하고 그 외는 거부합니다. */
export function mapApiQuoteStatus(status: ApiQuoteStatus | string): QuoteStatus {
  if (status === "PROPOSED") return QUOTE_STATUS.PENDING;
  if (status === "CONFIRMED") return QUOTE_STATUS.CONFIRMED;
  if (status === "REJECTED") return QUOTE_STATUS.REJECTED;
  throw new Error(`Unsupported quote status: ${status}`);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateShortDots(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yy = String(date.getFullYear()).slice(2);
  return `${yy}. ${pad2(date.getMonth() + 1)}. ${pad2(date.getDate())}.`;
}

export function formatDateCompact(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yy = String(date.getFullYear()).slice(2);
  return `${yy}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

/** BE 주소 앞 `[06236]` 같은 우편번호 표기를 화면용으로 제거합니다. */
export function stripPostalCodePrefix(address: string): string {
  return address.replace(/^\[[\d-]+\]\s*/, "").trim();
}

export function mapQuoteListItem(
  item: ApiQuoteListItem,
): CustomerQuoteListItemView {
  return {
    id: item.id,
    serviceType: toServiceType(item.moveRequest.serviceType),
    isDesignated: item.isDesignated,
    status: mapApiQuoteStatus(item.status),
    // 둘 다 비어 있으면 빈 문자열을 두고, 화면이 현재 locale의 기본 소개 문구를 표시합니다.
    message:
      item.comment?.trim() ||
      item.mover.shortIntroduction?.trim() ||
      "",
    moverName: item.mover.nickname,
    moverProfileImageUrl: resolveApiAssetUrl(item.mover.profileImageUrl),
    rating: item.mover.averageRating ?? 0,
    reviewCount: item.mover.reviewCount,
    careerYears: item.mover.careerYears,
    confirmedCount: 0,
    favoriteCount: item.mover.favoriteCount,
    price: item.price ?? 0,
  };
}

export function mapActiveMoveRequest(
  moveRequest: ApiActiveMoveRequest,
): CustomerQuoteMoveRequestView {
  return {
    id: moveRequest.id,
    serviceType: toServiceType(moveRequest.serviceType),
    requestedAt: moveRequest.createdAt,
    from: stripPostalCodePrefix(moveRequest.fromAddress),
    to: stripPostalCodePrefix(moveRequest.toAddress),
    moveDate: moveRequest.moveDate,
  };
}

export function groupHistoryQuotes(
  items: ApiQuoteListItem[],
): CustomerQuoteHistoryGroupView[] {
  const groups = new Map<string, CustomerQuoteHistoryGroupView>();

  for (const item of items) {
    const moveRequestId = item.moveRequest.id;
    const existing = groups.get(moveRequestId);
    const quote = mapQuoteListItem(item);

    if (existing) {
      existing.quotes.push(quote);
      continue;
    }

    groups.set(moveRequestId, {
      id: moveRequestId,
      requestedAt: formatDateShortDots(item.moveRequest.createdAt),
      serviceType: toServiceType(item.moveRequest.serviceType),
      from: stripPostalCodePrefix(item.moveRequest.fromAddress),
      to: stripPostalCodePrefix(item.moveRequest.toAddress),
      moveDate: item.moveRequest.moveDate,
      quotes: [quote],
    });
  }

  return [...groups.values()];
}

export function mapQuoteDetail(
  item: ApiQuoteListItem,
  options?: { requestedAtIso?: string },
): CustomerQuoteDetail {
  const serviceType = toServiceType(item.moveRequest.serviceType);
  const requestedAtIso =
    options?.requestedAtIso ?? item.moveRequest.createdAt;

  return {
    id: item.id,
    serviceType,
    isDesignated: item.isDesignated,
    status: mapApiQuoteStatus(item.status),
    // 둘 다 비어 있으면 빈 문자열을 두고, 화면이 현재 locale의 기본 소개 문구를 표시합니다.
    message:
      item.comment?.trim() ||
      item.mover.shortIntroduction?.trim() ||
      "",
    moverName: item.mover.nickname,
    profileImageUrl:
      resolveApiAssetUrl(item.mover.profileImageUrl) ??
      DEFAULT_MOVER_PROFILE_IMAGE,
    rating: item.mover.averageRating ?? 0,
    reviewCount: item.mover.reviewCount,
    careerYears: item.mover.careerYears,
    confirmedCount: 0,
    favoriteCount: item.mover.favoriteCount,
    price: item.price ?? 0,
    requestedAt: formatDateCompact(requestedAtIso),
    moveDate: item.moveRequest.moveDate,
    from: stripPostalCodePrefix(item.moveRequest.fromAddress),
    to: stripPostalCodePrefix(item.moveRequest.toAddress),
  };
}
