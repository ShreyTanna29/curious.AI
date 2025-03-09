import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession } from "next-auth/react";

export default function UserProfileCard() {
  const session = useSession();
  const userEmail = session.data?.user?.email;
  const userName = session.data?.user?.name;
  return (
    <>
      <Card className="bg-black/10 w-full dark:bg-white/10 border-0  dark:text-white overflow-clip flex items-center">
        <CardContent className="py-6 w-full ">
          <div className="flex">
            <Avatar>
              <AvatarImage src={session.data?.user?.image!} alt="User" />
              <AvatarFallback>
                {userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p>{userName}</p>
              <p className=" text-sm text-ellipsis overflow-hidden whitespace-nowrap ">
                {userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
