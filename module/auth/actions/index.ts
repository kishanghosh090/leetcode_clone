"use server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { id, emailAddresses, firstName, lastName, imageUrl } = user;

    const newUser = await db.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
      },
      create: {
        clerkId: id,
        email: emailAddresses[0].emailAddress,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
      },
    });

    return {
      success: true,
      message: "User onboarded successfully",
      user: newUser,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while onboarding the user",
    };
  }
};
