import SignUpForm from "@/components/auth/sign-up-form";

export default function SignUp() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="w-2/3 lg:w-1/4">
        <p className="text-3xl mb-5">Sign Up</p>
        <SignUpForm />
      </div>
    </div>
  );
}
