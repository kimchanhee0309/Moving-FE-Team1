import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/common/constants/routes";

import type { AuthScreenProps } from "../auth.types";
import { authHref } from "../auth.utils";
import { AuthController } from "./AuthController";

/** 역할별 문구/이미지와 화면 배치만 담당하고 입력 상태는 AuthForm에 한정합니다. */
export function AuthScreen({ role, mode, redirectTo }: AuthScreenProps) {
  const isCustomer = role === "CUSTOMER";
  const alternateRole = isCustomer ? "MOVER" : "CUSTOMER";
  const alternatePath = mode === "login" ? ROUTES.AUTH.LOGIN[alternateRole] : ROUTES.AUTH.SIGNUP[alternateRole];
  const roleLabel = isCustomer ? "일반 유저" : "기사님";

  // 기존 Auth 시안의 744/1200px 분기를 유지합니다. 카드/내용 너비는 태블릿 640/560px, PC 740/640px입니다.
  const backgroundClass = "min-h-[calc(100svh-54px)] overflow-x-clip bg-(--gray-50) px-6 pt-[58px] pb-[104px] min-[744px]:bg-(--primary-400) min-[744px]:pt-[75px] min-[744px]:pb-[88px] min-[1200px]:min-h-[calc(100svh-88px)] min-[1200px]:pt-[45px] min-[1200px]:pb-[76px]";
  const panelClass = "relative mx-auto w-full max-w-[560px] bg-(--gray-50) min-[744px]:max-w-[640px] min-[744px]:rounded-[40px] min-[744px]:px-10 min-[744px]:py-[68px] min-[1200px]:max-w-[740px] min-[1200px]:px-[50px] min-[1200px]:py-12 [&_a:focus-visible]:rounded [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-(--primary-400)";

  return (
    <main className={backgroundClass} data-auth-mode={mode}>
      <section className={panelClass} aria-labelledby="auth-title">
        <h1 id="auth-title" className="sr-only">{roleLabel} {mode === "login" ? "로그인" : "회원가입"}</h1>
        <header className={`flex flex-col items-center gap-0 ${mode === "signup" ? "mb-8" : "mb-10"} min-[744px]:mb-12 min-[744px]:gap-2`}>
          <Link href={ROUTES.HOME} aria-label="무빙 홈으로 이동" className="flex h-[84px] w-full items-center justify-center min-[744px]:h-[100px]">
            <Image className="h-[46px] w-[88px] min-[744px]:h-14 min-[744px]:w-[107px]" src="/images/auth/wordmark.svg" alt="무빙" width={107} height={56} priority />
          </Link>
          <p className="text-center text-xs leading-5 text-(--black-100) min-[744px]:text-xl min-[744px]:leading-8 min-[744px]:text-(--black-200) [&_a]:font-semibold [&_a]:text-(--primary-400) [&_a]:underline [&_a]:underline-offset-[3px]">
            {isCustomer ? "기사님이신가요?" : "일반 유저라면?"}{" "}
            <Link href={authHref(alternatePath, redirectTo)}>{isCustomer ? "기사님" : "일반 유저"} 전용 페이지</Link>
          </p>
        </header>
        <AuthController key={`${role}-${mode}`} role={role} mode={mode} redirectTo={redirectTo} />
        <Image className="pointer-events-none absolute hidden object-contain min-[744px]:bottom-[-74px] min-[744px]:left-[calc(100%-137px)] min-[744px]:block min-[744px]:h-[246px] min-[744px]:w-[240px] min-[1200px]:bottom-[-52px] min-[1200px]:left-[calc(100%-60px)] min-[1200px]:size-[392px]" src={`/images/auth/${isCustomer ? "customer" : "mover"}.png`} alt="" width={392} height={392} />
      </section>
    </main>
  );
}
