"use client";

import Image from "next/image";
import { redirect, useSearchParams } from "next/navigation";
import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { useUser } from "@/context/UserContext";
import { useImages } from "@/context/ImageContext";
import React from "react";

const Profile = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const user = useUser();

  if (!user) redirect("/sign-in");

  const { images, totalPages } = useImages();

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection images={images} totalPages={totalPages} page={page} />
      </section>
    </>
  );
};

export default Profile;
