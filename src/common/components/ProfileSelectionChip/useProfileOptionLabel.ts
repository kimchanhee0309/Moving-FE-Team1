import { useMessages, useTranslations, type Messages } from "next-intl";

type OptionKey = keyof Messages["Options"];

function isOptionKey(options: Messages["Options"], value: string): value is OptionKey {
  return Object.hasOwn(options, value);
}

/** API에 보내는 option.value는 유지하고 화면에 보이는 라벨만 번역합니다. */
export function useProfileOptionLabel() {
  const t = useTranslations("Options");
  const options = useMessages().Options;
  return (value: string, fallback: string) => isOptionKey(options, value) ? t(value) : fallback;
}
