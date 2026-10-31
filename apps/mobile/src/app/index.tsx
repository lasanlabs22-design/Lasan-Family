import { Redirect } from "expo-router";
import { useSession } from "@/lib/session";

/** Routes by role: customers land on Home, service providers on Today. */
export default function Index() {
  const { state, user } = useSession();
  if (state.status !== "signedIn") return <Redirect href="/welcome" />;
  return <Redirect href={user?.role === "provider" ? "/today" : "/home"} />;
}
