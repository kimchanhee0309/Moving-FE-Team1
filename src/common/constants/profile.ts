import type { ProfileSelectionChipOption } from "@/common/components/ProfileSelectionChip";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

export const PROFILE_SERVICE_OPTIONS: ReadonlyArray<ProfileSelectionChipOption<ServiceType>> = [
  { value: SERVICE_TYPE.SMALL, label: "소형이사" },
  { value: SERVICE_TYPE.HOME, label: "가정이사" },
  { value: SERVICE_TYPE.OFFICE, label: "사무실이사" },
];

export const PROFILE_REGION_OPTIONS = [
  { value: "서울", label: "서울" },
  { value: "경기", label: "경기" },
  { value: "인천", label: "인천" },
  { value: "강원", label: "강원" },
  { value: "충북", label: "충북" },
  { value: "충남", label: "충남" },
  { value: "세종", label: "세종" },
  { value: "대전", label: "대전" },
  { value: "전북", label: "전북" },
  { value: "전남", label: "전남" },
  { value: "광주", label: "광주" },
  { value: "경북", label: "경북" },
  { value: "경남", label: "경남" },
  { value: "대구", label: "대구" },
  { value: "울산", label: "울산" },
  { value: "부산", label: "부산" },
  { value: "제주", label: "제주" },
] as const;

export type ProfileRegion = (typeof PROFILE_REGION_OPTIONS)[number]["value"];
