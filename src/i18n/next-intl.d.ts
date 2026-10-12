import type messages from "../../messages/ko.json";

// ko.json을 기준 스키마로 삼아 useTranslations/getTranslations의 namespace·key 오타를 타입 단계에서 막습니다.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
