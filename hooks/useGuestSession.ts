"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { getGuestRemainingMs, isGuestExpired } from "@/lib/guest-session";

export function useGuestSession() {
  const sessionState = useSession();
  const { data: session, status } = sessionState;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!session?.user?.isGuest) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [session?.user?.isGuest]);

  const isGuest = Boolean(session?.user?.isGuest);
  const guestExpiresAt = session?.guestExpiresAt || null;
  const remainingMs = getGuestRemainingMs(guestExpiresAt, now);
  const hasExpired =
    isGuest &&
    (session?.error === "GuestSessionExpired" ||
      isGuestExpired(guestExpiresAt, now));

  return {
    ...sessionState,
    session,
    status,
    isGuest,
    guestId: session?.user?.guestId || null,
    guestExpiresAt,
    remainingMs,
    hasExpired,
  };
}
