"use server"

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils"
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

const populateUser = (query: any) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName'
})

//add image
export async function addImage({ image, userId, path}: AddImageParams) {
    try {
        await connectToDatabase();

        const author = await User.findById(userId);
        if(!author) throw new Error("User not found");

        const newImage = await Image.create({
            ...image,
            author: author._id
        })

        revalidatePath(path)

        return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
        handleError(error);
    }
}

//update image
export async function updateImage({ image, userId, path}: UpdateImageParams) {
    try {
        await connectToDatabase();

        const imageToUpdate = await Image.findById(image._id);

        if( !imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized or image not found");
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            {new: true }
        )

        revalidatePath(path)

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
        redirect("/")
    }
}

//get image
export async function getImageById(imageId: string) {
    try {
        await connectToDatabase();

        const image = await populateUser(Image.findById(imageId));

        if(!image) throw new Error("Image not found");

        return JSON.parse(JSON.stringify(image));
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
