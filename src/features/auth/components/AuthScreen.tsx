import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/common/constants/routes";

import type { AuthScreenProps } from "../auth.types";
import { authHref } from "../auth.utils";
import { AuthController } from "./AuthController";
import styles from "./AuthScreen.module.css";

/** 역할별 문구/이미지와 화면 배치만 담당하고 입력 상태는 AuthForm에 한정합니다. */
export function AuthScreen({ role, mode, redirectTo }: AuthScreenProps) {
  const isCustomer = role === "CUSTOMER";
  const alternateRole = isCustomer ? "MOVER" : "CUSTOMER";
  const alternatePath = mode === "login" ? ROUTES.AUTH.LOGIN[alternateRole] : ROUTES.AUTH.SIGNUP[alternateRole];
  const roleLabel = isCustomer ? "일반 유저" : "기사님";

  return (
    <main className={styles.background} data-auth-mode={mode}>
      <section className={styles.panel} aria-labelledby="auth-title">
        <h1 id="auth-title" className="sr-only">{roleLabel} {mode === "login" ? "로그인" : "회원가입"}</h1>
        <header className={styles.header}>
          <Link href={ROUTES.HOME} aria-label="무빙 홈으로 이동" className={styles.wordmark}>
            <Image src="/images/auth/wordmark.svg" alt="무빙" width={107} height={56} priority />
          </Link>
          <p className={styles.roleSwitch}>
            {isCustomer ? "기사님이신가요?" : "일반 유저라면?"}{" "}
            <Link href={authHref(alternatePath, redirectTo)}>{isCustomer ? "기사님" : "일반 유저"} 전용 페이지</Link>
          </p>
        </header>
        <AuthController key={`${role}-${mode}`} role={role} mode={mode} redirectTo={redirectTo} />
        <Image className={styles.character} src={`/images/auth/${isCustomer ? "customer" : "mover"}.png`} alt="" width={392} height={392} />
      </section>
    </main>
  );
}
