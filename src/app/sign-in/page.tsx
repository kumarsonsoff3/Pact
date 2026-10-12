import { Shell } from "@/components/shell";
import { AuthForm } from "@/components/auth-form";
import { SetupRequired } from "@/components/setup-required";
import { isAuthConfigured } from "@/lib/config";
export const dynamic = "force-dynamic";
export default function SignIn() {
  return (
    <Shell section="Account">
      {isAuthConfigured() ? <AuthForm /> : <SetupRequired />}
    </Shell>
  );
}
