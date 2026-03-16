
import { onBoardUser } from "@/module/auth/actions";
import { UserButton } from "@clerk/nextjs";

export default async function Home() {
  await onBoardUser();
  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <UserButton />
    </div>
  );
}
