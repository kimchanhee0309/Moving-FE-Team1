import { CustomerProfileRegisterContent } from "@/features/customer-profile/components";
import { safeAuthRedirect } from "@/features/auth/auth.utils";

export default async function CustomerProfileRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect } = await searchParams;
  return <CustomerProfileRegisterContent redirectTo={safeAuthRedirect(redirect)} />;
}
