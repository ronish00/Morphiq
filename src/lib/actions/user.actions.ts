"use server"

import { connectToDatabase } from "../database/mongoose";
import User from "../database/models/user.model";
import { CreateUserParams, UpdateUserParams } from "../../../types";

//CreateUser
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
}

//GetUser
export async function getUser(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new Error(`Failed to get user: ${error}`);
  }
}

//UpdateUser
export async function updateUser(userId: string, updates: UpdateUserParams) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    throw new Error(`Failed to update user: ${error}`);
  }
}


//DeleteUser
export async function deleteUser(userId: string) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(userId);
    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    throw new Error(`Failed to delete user: ${error}`);
  }
}
