export type PaginationSize = "sm" | "lg";

export interface PaginationProps {
  /** 현재 페이지입니다. 1부터 시작하며 상태는 호출부가 소유합니다. */
  currentPage: number;
  /** API pagination의 전체 페이지 수입니다. 0이면 컴포넌트를 표시하지 않습니다. */
  totalPages: number;
  /** 유효한 페이지 버튼을 눌렀을 때 이동할 페이지를 전달합니다. */
  onPageChange: (page: number) => void;
  /** Figma component/pagination의 sm(34px)·lg(48px) 규격입니다. lg도 모바일에서는 34px로 축소됩니다. */
  size?: PaginationSize;
  /** 목록 갱신 중 기존 페이지를 유지하면서 중복 이동만 막습니다. */
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}
