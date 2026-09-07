"use client";

import {
  ProfileDropdown,
  type ProfileDropdownAction,
  type ProfileDropdownProps,
} from "./ProfileDropdown";

export type MoverProfileDropdownProps = Omit<
  ProfileDropdownProps,
  "items" | "menuLabel" | "profileType"
> & {
  moverName: string;
  myPageAction: ProfileDropdownAction;
  logoutAction: ProfileDropdownAction;
  menuLabel?: string;
};

/**
 * Figma `Component/dropdown-list_기사님`의 sm/md 전체 항목을 제공한다.
 * 호출부는 기사님 이름과 마이페이지·로그아웃 동작만 전달한다.
 */
export function MoverProfileDropdown({
  moverName,
  myPageAction,
  logoutAction,
  menuLabel = "기사님 프로필 메뉴",
  ...props
}: MoverProfileDropdownProps) {
  return (
    <ProfileDropdown
      {...props}
      items={[
        {
          id: "mover-name",
          label: `${moverName} 기사님`,
          variant: "label",
        },
        { id: "my-page", label: "마이페이지", ...myPageAction },
        { id: "logout", label: "로그아웃", ...logoutAction, variant: "logout" },
      ]}
      menuLabel={menuLabel}
      profileType="mover"
    />
  );
}
