"use client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
	const [date, setDate] = useState<Date>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = () => {
		if (!date) {
			alert("Please select a date before submitting.");
			return;
		}
		setIsSubmitting(true);
		// Simulating API call
		setTimeout(() => {
			alert(`Job created to parse emails from ${format(date, "PPP")} onwards.`);
			setIsSubmitting(false);
		}, 2000);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<header className="flex h-14 items-center px-4 lg:px-6">
				<Logo />
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<Link
						className="font-medium text-sm underline-offset-4 hover:underline"
						href="#features"
					>
						Features
					</Link>
					<Link
						className="font-medium text-sm underline-offset-4 hover:underline"
						href="/sign-in"
					>
						Sign In
					</Link>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full py-6 sm:py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className="font-bold text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none">
										Automate Your Event Extraction from Emails
									</h1>

									<p className="max-w-[600px] text-neutral-500 md:text-xl dark:text-neutral-400">
										Select a date and let our AI parse your emails to extract
										events automatically. Save time and never miss an important
										appointment again.
									</p>
								</div>
								<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant={"outline"}
												className={cn(
													"w-full justify-start text-left font-normal sm:w-[280px]",
													!date && "text-gray-500",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{date ? (
													format(date, "PPP")
												) : (
													<span>Select start date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={date}
												onSelect={setDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<Button
										className="w-full sm:w-auto"
										onClick={handleSubmit}
										disabled={!date || isSubmitting}
									>
										{isSubmitting ? "Processing..." : "Parse Emails"}
									</Button>
								</div>
							</div>
							<div className="mx-auto aspect-video overflow-hidden rounded-xl bg-gray-200 object-cover sm:w-full lg:order-last lg:aspect-square">
								{/* Placeholder for an illustrative image or animation */}
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
				<p>© 2024 YEEMail. All rights reserved.</p>
			</footer>
		</div>
	);
}
