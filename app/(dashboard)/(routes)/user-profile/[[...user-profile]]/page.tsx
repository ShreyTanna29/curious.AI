import { UserProfile } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

const UserProfilePage = () => (
  <center >
    <div>
      <UserProfile appearance={{baseTheme: shadesOfPurple}} path="/user-profile" />
    </div>
  </center>
);

export default UserProfilePage;
