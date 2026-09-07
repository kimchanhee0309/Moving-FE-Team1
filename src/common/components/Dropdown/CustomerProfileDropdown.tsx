"use client";

import {
  ProfileDropdown,
  type ProfileDropdownAction,
  type ProfileDropdownProps,
} from "./ProfileDropdown";

export type CustomerProfileDropdownProps = Omit<
  ProfileDropdownProps,
  "items" | "menuLabel" | "profileType"
> & {
  customerName: string;
  profileEditAction: ProfileDropdownAction;
  favoriteMoversAction: ProfileDropdownAction;
  movingReviewsAction: ProfileDropdownAction;
  logoutAction: ProfileDropdownAction;
  menuLabel?: string;
};

/**
 * Figma `Component/dropdown-list_고객님`의 sm/md 전체 항목을 제공한다.
 * 호출부는 고객 이름과 각 메뉴가 실행할 이동 또는 클릭 동작만 전달한다.
 */
export function CustomerProfileDropdown({
  customerName,
  profileEditAction,
  favoriteMoversAction,
  movingReviewsAction,
  logoutAction,
  menuLabel = "일반 유저 프로필 메뉴",
  ...props
}: CustomerProfileDropdownProps) {
  return (
    <ProfileDropdown
      {...props}
      items={[
        {
          id: "customer-name",
          label: `${customerName} 고객님`,
          variant: "label",
        },
        { id: "profile-edit", label: "프로필 수정", ...profileEditAction },
        {
          id: "favorite-movers",
          label: "찜한 기사님",
          ...favoriteMoversAction,
        },
        {
          id: "moving-reviews",
          label: "이사 리뷰",
          ...movingReviewsAction,
        },
        { id: "logout", label: "로그아웃", ...logoutAction, variant: "logout" },
      ]}
      menuLabel={menuLabel}
      profileType="customer"
    />
  );
}
