// app/posts/create/page.tsx
import { Shell } from "@/components/Shells/shell";
import { CreatePost } from "@/components/User/CreatePost";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


export default async function CreatePostPage() {
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login")
  }
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-36">
        <div className="w-full max-w-3xl">
          <CreatePost />
        </div>
      </div>
    </Shell>
  );
}