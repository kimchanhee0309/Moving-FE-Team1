import type { UserRole } from "@/common/constants/domain";

export interface GnbNavItem {
  label: string;
  href: string;
}

export interface GnbAuthenticatedUser {
  role: UserRole;
  name: string;
  profileHref: string;
}

interface GnbBaseProps {
  hasUnreadNotification?: boolean;
  loginHref?: string;
  onNotificationClick?: () => void;
  className?: string;
}

export type GnbProps =
  | (GnbBaseProps & { isAuthenticated?: false })
  | (GnbBaseProps & { isAuthenticated: true; user: GnbAuthenticatedUser });
