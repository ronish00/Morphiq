"use client";

import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { useImages } from "@/context/ImageContext";
import { useUser } from "@/context/UserContext";
import { searchUserImages } from "@/lib/actions/image.action";
import Image from "next/image";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Home = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const searchQuery = searchParams.get("query");
  const user = useUser();

  const { images: contextImages, totalPages: contextTotalPages } = useImages();

  const [images, setImages] = useState(contextImages || []);
  const [totalPages, setTotalPages] = useState(contextTotalPages || 1);

  useEffect(() => {
    if (searchQuery) {
      if (!user) {
        redirect("/sign-in");
      }

      const fetchSearchImages = async () => {
        try {
          const result = await searchUserImages({
            userId: user._id,
            searchQuery,
            page,
          });
          setImages(result?.data || []);
          setTotalPages(result?.totalPages || 1);
        } catch (err) {
          throw new Error("Failed to fetch images");
        }
      };

      fetchSearchImages();
    } else {
      setImages(contextImages || []);
      setTotalPages(contextTotalPages || 1);
    }
  }, [searchQuery, user, page, contextImages, contextTotalPages]);

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Morphiq
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection
          hasSearch={true}
          images={images}
          totalPages={totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Home;
