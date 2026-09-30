export interface KakaoShareDefaultFeed {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
}

export interface KakaoSDK {
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (settings: KakaoShareDefaultFeed) => void;
  };
}

// Window.Kakao 전역 선언은 실제 SDK 로더인 common/utils/kakao-share.ts에서 단일 관리합니다.
