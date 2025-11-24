import { SignIn } from "@clerk/clerk-react";

export const SignInScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
        <SignIn
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            fallbackRedirectUrl="/"
        />
    </div>
  );
}