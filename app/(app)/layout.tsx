import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { signOut } from "@/actions/auth";
import { getProfile, getSession } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const profile = await getProfile(user.id);

  return (
    <div className="min-h-screen">
      <AppNav name={profile?.name ?? user.email} onSignOut={signOut} />
      <main className="mx-auto max-w-xl px-5 py-6 pb-16 flex flex-col gap-5">{children}</main>
    </div>
  );
}
