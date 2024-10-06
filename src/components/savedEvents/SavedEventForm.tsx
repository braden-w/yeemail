"use client";

import {
	type NewSavedEventParams,
	type SavedEvent,
	insertSavedEventParams,
} from "@/lib/db/schema/savedEvents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
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
