"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { formatLongDate } from "@/common/utils/date-format";

import { formatMoveDateForApi } from "../move-request.utils";
import type { MoveDateCalendarProps } from "./MoveDateCalendar.types";

// 2023-01-01은 일요일이라 일~토 순서의 요일 이름을 locale별로 만들 때 기준일로 씁니다.
const WEEKDAY_REFERENCE_DATES = Array.from({ length: 7 }, (_, index) => new Date(2023, 0, 1 + index));

function getWeekdayLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return WEEKDAY_REFERENCE_DATES.map((date) => formatter.format(date));
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date | null, b: Date): boolean {
  return (
    a !== null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 로컬 자정 기준으로 날짜만 비교하기 위해 시:분:초를 버린다. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * `monthStart`가 속한 달의 날짜를 일~토 7열 그리드로 배열한다.
 * 첫 주/마지막 주의 빈 칸은 이전/다음 달의 실제 날짜로 채우되 `isCurrentMonth: false`로 표시해
 * (Figma 목업과 동일하게) 클릭할 수 없는 회색 칸으로 렌더링할 수 있게 한다.
 */
function buildCalendarWeeks(monthStart: Date): CalendarCell[][] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }

  let nextMonthDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
    });
    nextMonthDay += 1;
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** 셀 크기별 Figma 수치(색상·타이포그래피 토큰)를 모은 설정. MoveDateCalendarProps.size 참고. */
const SIZE_CONFIG = {
  "48": {
    cellClass: "size-12",
    headerText: "text-xl-semibold text-(--content-strong)",
    weekdayText: "text-lg-medium text-(--input-placeholder)",
    dayText: "text-lg-medium text-(--black-500)",
    selectedText: "text-lg-semibold text-(--gray-50)",
  },
  "40": {
    cellClass: "size-10",
    headerText: "text-2lg-semibold text-(--black-500)",
    weekdayText: "text-sm-medium text-(--input-placeholder)",
    dayText: "text-md-medium text-(--black-500)",
    selectedText: "text-md-semibold text-(--gray-50)",
  },
} as const;

/**
 * 월간 달력 그리드. 이전/다음 달 이동과 날짜 선택만 책임지고, 확인 버튼이나 바깥 테두리 같은
 * 틀(chrome)은 호출부가 감싼다 — 모바일은 테두리 없이 화면에 바로 삽입하고, 태블릿/데스크톱은
 * `DateDropdown`의 `panel`로 전달하면서 테두리와 "선택완료" 버튼을 함께 그린다.
 */
export function MoveDateCalendar({
  value,
  onSelect,
  size = "48",
  className,
}: MoveDateCalendarProps) {
  // 이 컴포넌트는 부모(DateDropdown의 panel, 모바일 wizard 2단계)가 열려 있는 동안만
  // 마운트되므로 마운트 시점의 value를 기준으로 보여줄 달을 한 번만 정하면 된다 — 이후 달 이동은
  // 이 state가 직접 관리하고, 날짜 선택은 항상 이 컴포넌트를 통해서만 일어나 value와 어긋나지
  // 않는다. 그래서 value 변화를 다시 동기화하는 effect 없이 lazy initializer만으로 충분하다.
  const [viewingMonth, setViewingMonth] = useState(() => startOfMonth(value ?? new Date()));

  const t = useTranslations("Calendar");
  const locale = useLocale();
  const weekdayLabels = getWeekdayLabels(locale);
  const config = SIZE_CONFIG[size];
  const weeks = buildCalendarWeeks(viewingMonth);
  // BE(`move-request.service.ts`)가 moveDate를 "오늘(UTC 기준)보다 미래"만 허용하므로,
  // 오늘 포함 과거 날짜를 여기서도 선택 못 하게 막아 제출 후 400을 미리 방지한다. 이 컴포넌트는
  // 로컬 자정 기준으로 비교한다 — 정확한 timezone 기준(UTC vs 로컬)은 BE 쪽에도 아직 팀 협의가
  // 필요하다고 남겨진 미정 사항이라, 사용자가 실제로 보는 "오늘"을 기준으로 삼는 통상적인
  // 날짜 선택기 관례를 따른다.
  const today = startOfDay(new Date());

  const goToPrevMonth = () => {
    setViewingMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewingMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  return (
    <div className={["flex flex-col items-center gap-4", className].filter(Boolean).join(" ")}>
      <div className="flex h-8 items-center justify-center gap-3">
        <button
          type="button"
          aria-label={t("previousMonth")}
          onClick={goToPrevMonth}
          className="flex size-6 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-400)"
        >
          <Image src="/icons/common-chip-mypage/chevron-left.svg" alt="" width={24} height={24} unoptimized />
        </button>
        <p className={config.headerText}>
          {viewingMonth.getFullYear()}. {String(viewingMonth.getMonth() + 1).padStart(2, "0")}
        </p>
        <button
          type="button"
          aria-label={t("nextMonth")}
          onClick={goToNextMonth}
          className="flex size-6 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-400)"
        >
          <Image src="/icons/common-chip-mypage/chevron-right.svg" alt="" width={24} height={24} unoptimized />
        </button>
      </div>

      {/*
        달력은 요일(열)과 주(행)로 읽는 표 데이터라 table로 마크업한다. 스크린 리더가 "수요일 열"처럼
        날짜가 속한 요일을 함께 읽어준다. 셀 크기는 기존과 같이 `cellClass`가 정하고, 표 기본 여백이
        끼어들지 않게 th/td의 padding을 0으로 둔다.
      */}
      <table aria-label={t("selectDate")} className="border-collapse">
        <thead>
          <tr>
            {weekdayLabels.map((label) => (
              <th
                key={label}
                scope="col"
                className={`${config.cellClass} p-0 text-center align-middle ${config.weekdayText}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].date.toISOString()}>
              {week.map((cell) => {
                const selected = cell.isCurrentMonth && isSameDay(value, cell.date);
                const isPastOrToday = cell.date.getTime() <= today.getTime();
                const isSelectable = cell.isCurrentMonth && !isPastOrToday;
                return (
                  <td key={cell.date.toISOString()} className="p-0">
                    <button
                      type="button"
                      disabled={!isSelectable}
                      aria-pressed={selected}
                      aria-label={formatLongDate(cell.date, locale)}
                      onClick={() => onSelect(cell.date)}
                      className={[
                        "flex items-center justify-center rounded-xl transition-colors",
                        config.cellClass,
                        selected
                          ? `bg-(--primary-400) ${config.selectedText}`
                          : isSelectable
                            ? `${config.dayText} hover:bg-(--background-200)`
                            : "cursor-default text-(--gray-300)",
                      ].join(" ")}
                    >
                      <time dateTime={formatMoveDateForApi(cell.date)}>{cell.date.getDate()}</time>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
