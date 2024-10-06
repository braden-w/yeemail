"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SavedEvent } from "@/lib/db/schema";
import { trpc } from "@/lib/trpc/client";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, CheckIcon, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const columns: ColumnDef<SavedEvent>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "title",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Title
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div>{row.getValue("title")}</div>,
	},
	{
		accessorKey: "start",
		header: "Start Date",
		cell: ({ row }) => (
			<div>{format(new Date(row.getValue("start")), "PP 'at' p")}</div>
		),
	},
	{
		accessorKey: "end",
		header: "End Date",
		cell: ({ row }) => (
			<div>{format(new Date(row.getValue("end")), "PP 'at' p")}</div>
		),
	},
	{
		accessorKey: "location",
		header: "Location",
		cell: ({ row }) => <div>{row.getValue("location")}</div>,
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const event = row.original;

			const utils = trpc.useUtils();

			const { mutate: exportSavedEvent, isLoading: isExporting } =
				trpc.savedEvents.exportSavedEvent.useMutation({
					onSuccess: async (data) => {
						await utils.savedEvents.getPendingSavedEvents.invalidate();
						toast.success("Exported Event!");
					},
				});

			return (
				<div className="flex gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0"
									onClick={() => exportSavedEvent({ id: event.id })}
									disabled={isExporting}
								>
									<span className="sr-only">Open menu</span>
									{isExporting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CheckIcon className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isExporting ? "Exporting..." : "Export Event"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			);
		},
	},
];

export function DataTableDemo({ savedEvents }: { savedEvents: SavedEvent[] }) {
	const { data, isLoading } = trpc.savedEvents.getPendingSavedEvents.useQuery();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

	const utils = trpc.useUtils();

	const { mutate: bulkExportSavedEvents, isLoading: isExportingBulk } =
		trpc.savedEvents.bulkExportSavedEvents.useMutation({
			onSuccess: async () => {
				toast.success("Exported selected events!");
			},
		});

	const table = useReactTable({
		data: data?.pendingSavedEvents ?? [],
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		getRowId: (row) => row.id,
	});

	const selectedEventIds = Object.keys(rowSelection);

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter emails..."
					value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("email")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				{selectedEventIds.length > 0 && (
					<div className="ml-4 flex gap-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											bulkExportSavedEvents({ ids: selectedEventIds })
										}
										disabled={isExportingBulk}
									>
										{isExportingBulk ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<CheckIcon className="mr-2 h-4 w-4" />
										)}
										Export All
									</Button>
								</TooltipTrigger>
								<TooltipContent>Export all selected events</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
