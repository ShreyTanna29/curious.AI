import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "../ui/avatar";
import { useSession } from "next-auth/react";

function UserAvatar() {
  const session = useSession()
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={session.data?.user?.image || ""} />
      <AvatarFallback>
        {session.data?.user?.name?.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar;
