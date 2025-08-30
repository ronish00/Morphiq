"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

//add image
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);
    if (!author) throw new Error("User not found");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

//update image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

//delete image
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

//get image
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

//get all images
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    // Build MongoDB query
    let query: any = {};
    if (searchQuery) {
      // Search by title (case-insensitive)
      query.title = { $regex: searchQuery, $options: "i" };
    }

    const skipAmount = (Number(page) - 1) * limit;

    // Fetch paginated images
    const images = await populateUser(
      Image.find(query).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit)
    );

    // Total images matching search
    const totalImages = await Image.find(query).countDocuments();

    // Total images saved in DB (all-time)
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

//search user images
export async function searchUserImages({
  userId,
  searchQuery = "",
  limit = 9,
  page = 1,
}: {
  userId: string;
  searchQuery: string;
  limit?: number;
  page: number;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    // Build query: user + search
    const query: any = { author: userId };
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" }; // case-insensitive
    }

    const images = await populateUser(
      Image.find(query).sort({ updatedAt: -1 }).skip(skipAmount).limit(limit)
    );

    const totalImages = await Image.find(query).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}


//save image in cloudinary
export async function uploadImageToCloudinary(
  dataUrl: string,
  folder = "morphiq"
) {
  const formData = new FormData();
  formData.append("file", dataUrl);
  formData.append("upload_preset", "morphiq");
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const responseBody = await res.text();

  if (!res.ok) throw new Error(`Failed to upload image: ${responseBody}`);

  return JSON.parse(responseBody);
}
