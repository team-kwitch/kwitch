import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function SignInButton() {
  return (
    <Button asChild>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  );
}
