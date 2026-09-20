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

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export {};
