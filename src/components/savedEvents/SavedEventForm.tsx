"use client";

import {
	type NewSavedEventParams,
	type SavedEvent,
	insertSavedEventParams,
} from "@/lib/db/schema/savedEvents";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { z } from "zod";

const SavedEventForm = ({
	savedEvent,
	closeModal,
}: {
	savedEvent?: SavedEvent;
	closeModal?: () => void;
}) => {
	const { data: suggestedEvents } =
		trpc.suggestedEvents.getSuggestedEvents.useQuery();
	const editing = !!savedEvent?.id;

	const router = useRouter();
	const utils = trpc.useUtils();

	const form = useForm<z.infer<typeof insertSavedEventParams>>({
		// latest Zod release has introduced a TS error with zodResolver
		// open issue: https://github.com/colinhacks/zod/issues/2663
		// errors locally but not in production
		resolver: zodResolver(insertSavedEventParams),
		defaultValues: savedEvent ?? {
			title: "",
			description: "",
			start: "",
			end: "",
			location: "",
			registrationLink: "",
			associatedOrganization: "",
			suggestedEventId: "",
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

		await utils.savedEvents.getSavedEvents.invalidate();
		router.refresh();
		if (closeModal) closeModal();
		toast.success(`Saved Event ${action}d!`);
	};

	const { mutate: createSavedEvent, isLoading: isCreating } =
		trpc.savedEvents.createSavedEvent.useMutation({
			onSuccess: (res) => onSuccess("create"),
			onError: (err) => onError("create", { error: err.message }),
		});

	const { mutate: updateSavedEvent, isLoading: isUpdating } =
		trpc.savedEvents.updateSavedEvent.useMutation({
			onSuccess: (res) => onSuccess("update"),
			onError: (err) => onError("update", { error: err.message }),
		});

	const { mutate: deleteSavedEvent, isLoading: isDeleting } =
		trpc.savedEvents.deleteSavedEvent.useMutation({
			onSuccess: (res) => onSuccess("delete"),
			onError: (err) => onError("delete", { error: err.message }),
		});

	const handleSubmit = (values: NewSavedEventParams) => {
		if (editing) {
			updateSavedEvent({ ...values, id: savedEvent.id });
		} else {
			createSavedEvent(values);
		}
	};
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-8"}>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="start"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Start</FormLabel>
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
					name="end"
					render={({ field }) => (
						<FormItem>
							<FormLabel>End</FormLabel>
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
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Location</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="registrationLink"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Registration Link</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="associatedOrganization"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Associated Organization</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="suggestedEventId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Suggested Event Id</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={String(field.value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a suggested event" />
									</SelectTrigger>
									<SelectContent>
										{suggestedEvents?.suggestedEvents.map((suggestedEvent) => (
											<SelectItem
												key={suggestedEvent.suggestedEvent.id}
												value={suggestedEvent.suggestedEvent.id.toString()}
											>
												{suggestedEvent.suggestedEvent.id}{" "}
												{/* TODO: Replace with a field from the suggestedEvent model */}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
						onClick={() => deleteSavedEvent({ id: savedEvent.id })}
					>
						Delet{isDeleting ? "ing..." : "e"}
					</Button>
				) : null}
			</form>
		</Form>
	);
};

export default SavedEventForm;
