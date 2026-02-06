"use server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
export const onBoardUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    const { id, firstName, lastName, emailAddresses, imageUrl } = user;
    const newUser = await prisma.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        email: emailAddresses[0]?.emailAddress || "",
        imageUrl: imageUrl || "",
      },
      create: {
        clerkId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        email: emailAddresses[0]?.emailAddress || "",
        imageUrl: imageUrl || "",
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
      message: "Error onboarding user",
      error,
    };
  }
};
