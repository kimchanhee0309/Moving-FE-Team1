import { AuthCallback } from "@/features/auth/components/AuthCallback";

export default async function OAuthCallbackPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params=await searchParams;
  return <AuthCallback error={typeof params.error==="string"?params.error:undefined} role={typeof params.role==="string"?params.role:undefined} redirect={typeof params.redirect==="string"?params.redirect:undefined}/>;
}
