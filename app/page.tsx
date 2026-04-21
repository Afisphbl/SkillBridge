import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE_KEY } from "@/utils/constants";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;

  if (!token) {
    redirect("/login");
  }

  redirect("/home");
}
