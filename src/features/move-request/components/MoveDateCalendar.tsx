"use client";

import Image from "next/image";
import { useState } from "react";

import type { MoveDateCalendarProps } from "./MoveDateCalendar.types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

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

  const config = SIZE_CONFIG[size];
  const weeks = buildCalendarWeeks(viewingMonth);

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
          aria-label="이전 달"
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
          aria-label="다음 달"
          onClick={goToNextMonth}
          className="flex size-6 shrink-0 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary-400)"
        >
          <Image src="/icons/common-chip-mypage/chevron-right.svg" alt="" width={24} height={24} unoptimized />
        </button>
      </div>

      <div className="flex flex-col items-center" role="group" aria-label="날짜 선택">
        <div className="flex items-center">
          {WEEKDAY_LABELS.map((label) => (
            <span
              key={label}
              className={`flex ${config.cellClass} items-center justify-center ${config.weekdayText}`}
            >
              {label}
            </span>
          ))}
        </div>

        {weeks.map((week) => (
          <div key={week[0].date.toISOString()} className="flex items-center">
            {week.map((cell) => {
              const selected = cell.isCurrentMonth && isSameDay(value, cell.date);
              return (
                <button
                  key={cell.date.toISOString()}
                  type="button"
                  disabled={!cell.isCurrentMonth}
                  aria-pressed={selected}
                  aria-label={`${cell.date.getFullYear()}년 ${cell.date.getMonth() + 1}월 ${cell.date.getDate()}일`}
                  onClick={() => onSelect(cell.date)}
                  className={[
                    "flex items-center justify-center rounded-xl transition-colors",
                    config.cellClass,
                    selected
                      ? `bg-(--primary-400) ${config.selectedText}`
                      : cell.isCurrentMonth
                        ? `${config.dayText} hover:bg-(--background-200)`
                        : "cursor-default text-(--gray-300)",
                  ].join(" ")}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
