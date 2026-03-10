import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession } from "next-auth/react";

export default function UserProfileCard() {
  const session = useSession();
  const userEmail = session.data?.user?.email;
  const userName = session.data?.user?.name;
  return (
    <>
      <Card className="w-full overflow-hidden border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/70 dark:text-white">
        <CardContent className="w-full py-4">
          <div className="flex">
            <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/15">
              <AvatarImage src={session.data?.user?.image!} alt="User" />
              <AvatarFallback>
                {userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-ellipsis overflow-hidden whitespace-nowrap text-xs text-slate-500 dark:text-zinc-400">
                {userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
