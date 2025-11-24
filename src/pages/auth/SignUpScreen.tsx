import { SignUp } from "@clerk/clerk-react";

export const SignUpScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        fallbackRedirectUrl="/onboarding/welcome"
      />
    </div>
  );
}