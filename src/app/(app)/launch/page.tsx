"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const loadingStates = [
	{ text: "Authenticating with Gmail", duration: 2000 },
	{ text: "Fetching recent emails", duration: 5000 },
	{ text: "Processing email content", duration: 6000 },
	{ text: "Extracting relevant information", duration: 8000 },
	{ text: "Preparing data for display", duration: 3000 },
];

export default function LandingPage() {
	const [date, setDate] = useState<Date>();
	const router = useRouter();
	const { mutate: launchEmails, isLoading: isLaunchingEmails } =
		trpc.launch.launchEmails.useMutation({
			onSuccess: (res) => {
				toast.success(`Processed ${res.emails.length} emails!`, {
					description: `${res.events.length} events extracted!`,
					action: {
						label: "View Suggested Events",
						onClick: () => {
							router.push("/suggested-events");
						},
					},
				});
			},
			onError: (err) => {
				toast.error("Error processing emails", {
					description: err.message,
				});
			},
		});

	return (
		<div className="flex min-h-screen flex-col">
			<MultiStepLoader
				loadingStates={loadingStates}
				loading={isLaunchingEmails}
				loop={false}
			/>

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
										onClick={() => {
											if (!date) {
												alert("Please select a date before submitting.");
												return;
											}
											return launchEmails({ startDate: date });
										}}
										disabled={!date || isLaunchingEmails}
									>
										{isLaunchingEmails ? "Processing..." : "Launch Emails"}
									</Button>
								</div>
							</div>
							<Image
								src="/logo.jpg"
								alt="EventFlow illustration"
								width={700} // Adjust as needed
								height={500} // Adjust as needed
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
							/>
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
