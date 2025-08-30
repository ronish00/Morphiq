import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ImageProvider } from "@/context/ImageContext";
import { UserProvider } from "@/context/UserContext";
import { getUserImages } from "@/lib/actions/image.action";
import { getUserById } from "@/lib/actions/user.action";
import { IImage } from "@/lib/database/models/image.model";
import { auth } from "@clerk/nextjs/server";

const Layout = async ({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: SearchParamProps["searchParams"];
}) => {
  const page = Number(searchParams?.page) || 1;

  const { userId } = await auth();

  let user = null;
  let images: IImage[] = [];
  let totalPages = 1;

  if (userId) {
    user = await getUserById(userId);
    const result = await getUserImages({ page, userId: user._id });
    images = result?.data || [];
    totalPages = result?.totalPages || 1;
  }
  

  return (
    <main className="root">
      <Sidebar />
      <MobileNav />
      <div className="root-container">
        <div className="wrapper">
          <UserProvider user={user}>
            <ImageProvider images={images} totalPages={totalPages}>
              {children}
            </ImageProvider>
          </UserProvider>
        </div>
      </div>
      <Toaster richColors duration={5000} position="top-right" />
    </main>
  );
};

export default Layout;
