import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "./ui/avatar";

function UserAvatar() {
  const user = useUser();
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.user?.imageUrl} />
      <AvatarFallback>
        {user.user?.firstName?.charAt(0)}
        {user.user?.lastName?.charAt(0)}
        </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar;
