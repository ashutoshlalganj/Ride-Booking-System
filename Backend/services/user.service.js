import userModel from "../models/user.model.js";

export async function createUser({ firstname, lastname, email, password }) {
  if (!firstname || !email || !password) {
    throw new Error("All fields are required");
  }

  // ✅ Step 1 — hash password before saving
  const hashedPassword = await userModel.hashPassword(password);

  // ✅ Step 2 — save hashed password in DB
  const user = await userModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password: hashedPassword,
  });

  return user;
}
