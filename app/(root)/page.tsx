import { onBoardUser } from "@/module/auth/actions";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  await onBoardUser();
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to LeetCode Clone!</h1>
      <p className="mt-4 text-lg text-gray-600">
        This is a simple clone of LeetCode built with Next.js and Clerk for
        authentication.
      </p>
    </div>
  );
}
