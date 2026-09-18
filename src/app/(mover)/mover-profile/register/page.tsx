import { MoverProfileRegisterContent } from "@/features/mover-profile/components";
import { safeAuthRedirect } from "@/features/auth/auth.utils";

export default async function MoverProfileRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect } = await searchParams;
  return <MoverProfileRegisterContent redirectTo={safeAuthRedirect(redirect)} />;
}
