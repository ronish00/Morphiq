//we moved this page.tsx for Home into root because we want to have the root layout for this homepage

import { UserButton } from "@clerk/nextjs";


const Home = () => {
  return (
    <div>
      <p>
        Home
      </p>

      {/* <UserButton afterSignOutUrl="/" /> */}
    </div>
  );
}
 
export default Home;