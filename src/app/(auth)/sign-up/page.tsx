"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction } from "@/lib/actions/users";

import AuthFormError from "@/components/auth/AuthFormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
	const [state, formAction, pending] = useActionState(signUpAction, {
		error: "",
	});

	return (
		<main className="mx-auto my-4 max-w-lg bg-popover p-10">
			<h1 className="text-center font-bold text-2xl">Create an account</h1>
			<AuthFormError state={state} />
			<form action={formAction}>
				<Label htmlFor="email" className="text-muted-foreground">
					Email
				</Label>
				<Input name="email" type="email" id="email" required />
				<br />
				<Label htmlFor="password" className="text-muted-foreground">
					Password
				</Label>
				<Input type="password" name="password" id="password" required />
				<br />
				<Button className="w-full" type="submit" disabled={pending}>
					Sign{pending ? "ing" : ""} up
				</Button>
			</form>
			<div className="mt-4 text-center text-muted-foreground text-sm">
				Already have an account?{" "}
				<Link href="/sign-in" className="text-secondary-foreground underline">
					Sign in
				</Link>
			</div>
		</main>
	);
}
