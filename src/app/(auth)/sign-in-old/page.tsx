"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction } from "@/lib/actions/users";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthFormError from "@/components/auth/AuthFormError";

export default function SignInPage() {
	const [state, formAction, pending] = useActionState(signInAction, {
		error: "",
	});

	return (
		<main className="mx-auto my-4 max-w-lg bg-popover p-10">
			<h1 className="text-center font-bold text-2xl">
				Sign in to your account
			</h1>
			<AuthFormError state={state} />
			<form action={formAction}>
				<Label htmlFor="email" className="text-muted-foreground">
					Email
				</Label>
				<Input name="email" id="email" type="email" required />
				<br />
				<Label htmlFor="password" className="text-muted-foreground">
					Password
				</Label>
				<Input type="password" name="password" id="password" required />
				<br />
				<Button className="w-full" type="submit" disabled={pending}>
					Sign{pending ? "ing" : ""} in
				</Button>
			</form>
			<div className="mt-4 text-center text-muted-foreground text-sm">
				Don&apos;t have an account yet?{" "}
				<Link
					href="/sign-up"
					className="text-accent-foreground underline hover:text-primary"
				>
					Create an account
				</Link>
			</div>
		</main>
	);
}
