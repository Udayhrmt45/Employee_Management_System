import { SignIn } from "@clerk/clerk-react";
import AuthLayout, { clerkAppearance } from "./AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your HR SaaS account"
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
