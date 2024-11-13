import { UserButton } from "@clerk/nextjs";
import { Card, CardContent } from "./ui/card";
import { useUser } from "@clerk/nextjs";

export default function UserProfileCard() {
  const user = useUser();
  const userEmail = user.user?.emailAddresses[0].emailAddress;
  const userName = user.user?.fullName;
  return (
    <>
      <div className="">
        <Card className="bg-black/10 dark:bg-white/10 border-0  dark:text-white overflow-clip flex items-center">
          <CardContent className="py-6 text-ellipsis ">
            <div className="flex">
              <UserButton afterSignOutUrl="/" />
              <div className="ml-3">
                <p>{userName}</p>
                <p className="text-ellipsis text-sm ">{userEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
