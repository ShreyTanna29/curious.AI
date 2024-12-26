export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/image(.*)",
    "/code(.*)",
    "/marketplace(.*)",
    "/settings(.*)",
    "/chat(.*)",
  ],
};
