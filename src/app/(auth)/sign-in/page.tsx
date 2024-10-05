"use client";

import AuthFormError from "@/components/auth/AuthFormError";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/actions/users";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

export default function SignInPage() {
	return (
		<div className="container relative h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<Link
				href="/examples/authentication"
				className={cn(
					buttonVariants({ variant: "ghost" }),
					"absolute top-4 right-4 md:top-8 md:right-8",
				)}
			>
				Login
			</Link>
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					BS Email
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;This library has saved me countless hours of work and
							helped me deliver stunning designs to my clients faster than ever
							before.&rdquo;
						</p>
						<footer className="text-sm">Sofia Davis</footer>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="font-semibold text-2xl tracking-tight">
							Create an account
						</h1>
						<p className="text-muted-foreground text-sm">
							Enter your email below to create your account
						</p>
					</div>
					<UserAuthForm />
					<p className="px-8 text-center text-muted-foreground text-sm">
						By clicking continue, you agree to our{" "}
						<Link
							href="/terms"
							className="underline underline-offset-4 hover:text-primary"
						>
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link
							href="/privacy"
							className="underline underline-offset-4 hover:text-primary"
						>
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

export function UserAuthForm() {
	const [state, formAction] = useFormState(signInAction, {
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
				<SubmitButton />
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

const SubmitButton = () => {
	const { pending } = useFormStatus();
	return (
		<Button className="w-full" type="submit" disabled={pending}>
			Sign{pending ? "ing" : ""} in
		</Button>
	);
};
