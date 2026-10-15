import { useState } from "react";

interface LoadableImageSrc {
  /** 불러올 수 있는 이미지 주소입니다. 주소가 없거나 불러오기에 실패했으면 null입니다. */
  loadableSrc: string | null;
  /** next/image의 onError에 연결합니다. 실패한 주소를 기억해 이후 렌더에서 기본 이미지로 바꿉니다. */
  handleError: () => void;
}

/**
 * 사용자 프로필 이미지처럼 DB에 주소만 남고 파일이 사라질 수 있는 이미지를 안전하게 보여 줍니다.
 * 불러오기에 실패하면 loadableSrc가 null이 되어 호출부가 기본 이미지·기본 스타일로 전환할 수 있습니다.
 * 실패한 주소만 기억하므로 src가 새 주소로 바뀌면 다시 불러오기를 시도합니다. 기본 이미지 선택은 호출부가 담당합니다.
 */
export function useLoadableImageSrc(src: string | null | undefined): LoadableImageSrc {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const loadableSrc = src && src !== failedSrc ? src : null;

  return {
    loadableSrc,
    handleError: () => {
      if (src) setFailedSrc(src);
    },
  };
}
