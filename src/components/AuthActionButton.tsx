"use client";

import { signIn } from "next-auth/react";
import type { CSSProperties, ReactNode } from "react";

export default function AuthActionButton({
  callbackUrl,
  children,
  className,
  style,
}: {
  callbackUrl: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => signIn("consentkeys", { callbackUrl })}
    >
      {children}
    </button>
  );
}
