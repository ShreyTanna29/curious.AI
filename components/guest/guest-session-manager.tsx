"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useGuestSession } from "@/hooks/useGuestSession";
import {
  buildGuestUpgradePayload,
  clearGuestStore,
  ensureGuestStore,
} from "@/lib/guest-session";

export default function GuestSessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isGuest, guestId, guestExpiresAt, hasExpired, session } =
    useGuestSession();
  const handledExpiryRef = useRef(false);
  const syncingUpgradeRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !isGuest || !guestId || !guestExpiresAt) {
      return;
    }

    try {
      ensureGuestStore({
        guestId,
        expiresAt: guestExpiresAt,
      });
    } catch (error) {
      console.error("Failed to initialize guest storage.", error);
    }
  }, [guestExpiresAt, guestId, isGuest, status]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !isGuest ||
      !hasExpired ||
      handledExpiryRef.current
    ) {
      return;
    }

    handledExpiryRef.current = true;
    toast.error("Your guest session ended. Sign in or sign up to keep going.");

    void signOut({ redirect: false }).finally(() => {
      if (
        pathname?.startsWith("/signin") ||
        pathname?.startsWith("/signup")
      ) {
        return;
      }

      router.replace("/signin?guestExpired=1");
    });
  }, [hasExpired, isGuest, pathname, router, status]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      isGuest ||
      !session?.user?.id ||
      syncingUpgradeRef.current
    ) {
      return;
    }

    const payload = buildGuestUpgradePayload();
    if (!payload) {
      return;
    }

    syncingUpgradeRef.current = true;

    void fetch("/api/guest/upgrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "We could not move your guest work yet."
          );
        }

        if ((data?.chatsImported || 0) + (data?.codeEntriesImported || 0) > 0) {
          toast.success("Imported your guest work into this account.");
        }

        clearGuestStore();
      })
      .catch((error) => {
        console.error("[GUEST_UPGRADE_SYNC_ERROR]", error);
        toast.error("We kept your guest work locally and will retry import.");
      })
      .finally(() => {
        syncingUpgradeRef.current = false;
      });
  }, [isGuest, session?.user?.id, status]);

  return null;
}
