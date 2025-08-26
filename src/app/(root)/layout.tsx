import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/context/UserContext";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const {userId} = await auth();
    
  let user = null;
  if (userId) {
    user =  await getUserById(userId);
  }
    
  return (
    <main className="root">
        <Sidebar />
        <MobileNav />
        <div className="root-container">
          <div className="wrapper">
            <UserProvider user={user}>
              {children}
            </UserProvider>
          </div>
        </div>
        <Toaster richColors duration={5000} position="top-right" />
      </main>
  );
};

export default Layout;
