import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { isGuestExpired } from "@/lib/guest-session";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

type SessionAccessOptions = {
  allowGuest?: boolean;
  guestMessage?: string;
};

type SessionAccessResult =
  | {
      ok: true;
      session: Awaited<ReturnType<typeof getServerSession>>;
      userId: string;
      isGuest: boolean;
      guestId: string | null;
      guestExpiresAt: string | null;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function jsonAuthError(message: string, status: number, code: string) {
  return NextResponse.json(
    {
      code,
      message,
    },
    { status }
  );
}

export async function requireSessionAccess(
  options: SessionAccessOptions = {}
): Promise<SessionAccessResult> {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  const userId = session?.user?.id;

  if (!session || !userId) {
    return {
      ok: false,
      response: jsonAuthError("Please sign in to continue.", 401, "UNAUTHORIZED"),
    };
  }

  const isGuest = Boolean(session.user?.isGuest);
  const guestExpiresAt = session.guestExpiresAt || null;

  if (
    isGuest &&
    (session.error === "GuestSessionExpired" ||
      isGuestExpired(guestExpiresAt))
  ) {
    return {
      ok: false,
      response: jsonAuthError(
        "Your guest session expired. Sign in or create an account to keep going.",
        401,
        "GUEST_SESSION_EXPIRED"
      ),
    };
  }

  if (isGuest && !options.allowGuest) {
    return {
      ok: false,
      response: jsonAuthError(
        options.guestMessage ||
          "Create an account to use this feature outside guest mode.",
        403,
        "GUEST_UPGRADE_REQUIRED"
      ),
    };
  }

  return {
    ok: true,
    session,
    userId,
    isGuest,
    guestId: session.user?.guestId || null,
    guestExpiresAt,
  };
}
