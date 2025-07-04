

export interface CreateUserParams {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  photo: string;
}

export interface UpdateUserParams {
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
}
