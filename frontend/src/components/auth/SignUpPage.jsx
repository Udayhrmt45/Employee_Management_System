import { SignUp } from "@clerk/clerk-react";
import AuthLayout, { clerkAppearance } from "./AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Create an account" 
      subtitle="Get started with your HR SaaS dashboard"
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
