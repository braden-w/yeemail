"use client";

import {
	type Email,
	type NewEmailParams,
	insertEmailParams,
} from "@/lib/db/schema/emails";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";

const EmailForm = ({
	email,
	closeModal,
}: {
	email?: Email;
	closeModal?: () => void;
}) => {
	const editing = !!email?.id;

	const router = useRouter();
	const utils = trpc.useUtils();

	const form = useForm<z.infer<typeof insertEmailParams>>({
		// latest Zod release has introduced a TS error with zodResolver
		// open issue: https://github.com/colinhacks/zod/issues/2663
		// errors locally but not in production
		resolver: zodResolver(insertEmailParams),
		defaultValues: email ?? {
			subject: "",
			content: "",
			sender: "",
			receivedAt: "",
			links: "",
		},
	});

	const onSuccess = async (
		action: "create" | "update" | "delete",
		data?: { error?: string },
	) => {
		if (data?.error) {
			toast.error(data.error);
			return;
		}

		await utils.emails.getEmails.invalidate();
		router.refresh();
		if (closeModal) closeModal();
		toast.success(`Email ${action}d!`);
	};

	const { mutate: createEmail, isLoading: isCreating } =
		trpc.emails.createEmail.useMutation({
			onSuccess: (res) => onSuccess("create"),
			onError: (err) => onError("create", { error: err.message }),
		});

	const { mutate: updateEmail, isLoading: isUpdating } =
		trpc.emails.updateEmail.useMutation({
			onSuccess: (res) => onSuccess("update"),
			onError: (err) => onError("update", { error: err.message }),
		});

	const { mutate: deleteEmail, isLoading: isDeleting } =
		trpc.emails.deleteEmail.useMutation({
			onSuccess: (res) => onSuccess("delete"),
			onError: (err) => onError("delete", { error: err.message }),
		});

	const handleSubmit = (values: NewEmailParams) => {
		if (editing) {
			updateEmail({ ...values, id: email.id });
		} else {
			createEmail(values);
		}
	};
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-8"}>
				<FormField
					control={form.control}
					name="subject"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Subject</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Content</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="sender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Sender</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="receivedAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Received At</FormLabel>
							<br />
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-[240px] pl-3 text-left font-normal",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value ? (
												format(new Date(field.value), "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={new Date(field.value)}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="links"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Links</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="mr-1"
					disabled={isCreating || isUpdating}
				>
					{editing
						? `Sav${isUpdating ? "ing..." : "e"}`
						: `Creat${isCreating ? "ing..." : "e"}`}
				</Button>
				{editing ? (
					<Button
						type="button"
						variant={"destructive"}
						onClick={() => deleteEmail({ id: email.id })}
					>
						Delet{isDeleting ? "ing..." : "e"}
					</Button>
				) : null}
			</form>
		</Form>
	);
};

export default EmailForm;
