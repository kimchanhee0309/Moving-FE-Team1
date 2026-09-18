import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

import {
  DEFAULT_MOVER_PROFILE_IMAGE,
  SERVICE_TYPE_LABEL,
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

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toServiceType(value: string): ServiceType {
<<<<<<< HEAD
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
=======
  if (value === SERVICE_TYPE.HOME) return SERVICE_TYPE.HOME;
  if (value === SERVICE_TYPE.OFFICE) return SERVICE_TYPE.OFFICE;
  return SERVICE_TYPE.SMALL;
}

/** BE PROPOSED → FE PENDING. UI/칩은 FE QUOTE_STATUS를 유지합니다. */
export function mapApiQuoteStatus(status: ApiQuoteStatus | string): QuoteStatus {
  if (status === "CONFIRMED") return QUOTE_STATUS.CONFIRMED;
  if (status === "REJECTED") return QUOTE_STATUS.REJECTED;
  return QUOTE_STATUS.PENDING;
>>>>>>> 277fef463f6fc7cf482ca60e34eb9afe8130f54d
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatMoveDateWithWeekday(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const week = DAY_LABELS[date.getDay()];
  return `${date.getFullYear()}년 ${pad2(date.getMonth() + 1)}월 ${pad2(date.getDate())}일 (${week})`;
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

export function formatMoveDateDetail(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const week = DAY_LABELS[date.getDay()];
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getFullYear()}. ${pad2(date.getMonth() + 1)}. ${pad2(date.getDate())}(${week}) ${period} ${pad2(hour12)}:${pad2(date.getMinutes())}`;
}

export function mapQuoteListItem(
  item: ApiQuoteListItem,
): CustomerQuoteListItemView {
  return {
    id: item.id,
    serviceType: toServiceType(item.moveRequest.serviceType),
    isDesignated: item.isDesignated,
    status: mapApiQuoteStatus(item.status),
    message:
      item.comment?.trim() ||
      item.mover.shortIntroduction?.trim() ||
      "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: item.mover.nickname,
    moverProfileImageUrl: item.mover.profileImageUrl,
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
    requestedAt: formatDateLong(moveRequest.createdAt),
    from: moveRequest.fromAddress,
    to: moveRequest.toAddress,
    moveDate: formatMoveDateWithWeekday(moveRequest.moveDate),
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
<<<<<<< HEAD
      requestedAt: formatDateShortDots(item.moveRequest.createdAt),
=======
      requestedAt: formatDateShortDots(item.createdAt),
>>>>>>> 277fef463f6fc7cf482ca60e34eb9afe8130f54d
      serviceType: toServiceType(item.moveRequest.serviceType),
      from: item.moveRequest.fromAddress,
      to: item.moveRequest.toAddress,
      moveDate: formatMoveDateWithWeekday(item.moveRequest.moveDate),
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
<<<<<<< HEAD
  const requestedAtIso =
    options?.requestedAtIso ?? item.moveRequest.createdAt;
=======
  const requestedAtIso = options?.requestedAtIso ?? item.createdAt;
>>>>>>> 277fef463f6fc7cf482ca60e34eb9afe8130f54d

  return {
    id: item.id,
    serviceType,
    isDesignated: item.isDesignated,
    status: mapApiQuoteStatus(item.status),
    message:
      item.comment?.trim() ||
      item.mover.shortIntroduction?.trim() ||
      "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: item.mover.nickname,
    profileImageUrl:
      item.mover.profileImageUrl ?? DEFAULT_MOVER_PROFILE_IMAGE,
    rating: item.mover.averageRating ?? 0,
    reviewCount: item.mover.reviewCount,
    careerYears: item.mover.careerYears,
    confirmedCount: 0,
    favoriteCount: item.mover.favoriteCount,
    price: item.price ?? 0,
    requestedAt: formatDateCompact(requestedAtIso),
    serviceLabel: SERVICE_TYPE_LABEL[serviceType],
    moveDateLabel: formatMoveDateDetail(item.moveRequest.moveDate),
    from: item.moveRequest.fromAddress,
    to: item.moveRequest.toAddress,
  };
}
