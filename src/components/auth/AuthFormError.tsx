export default function AuthFormError({ state }: { state: { error: string } }) {
	if (state.error)
		return (
			<div className="my-4 w-full bg-destructive p-4 text-destructive-foreground text-xs">
				<h3 className="font-bold">Error</h3>
				<p>{state.error}</p>
			</div>
		);
	return null;
}
