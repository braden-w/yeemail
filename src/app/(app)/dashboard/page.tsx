import SignOutBtn from "@/components/auth/SignOutBtn";
import { getUserAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function Home() {
	const { session } = await getUserAuth();
	redirect("/launch");
	return (
		<main className="">
			<h1 className="my-2 font-bold text-2xl">Profile</h1>
			<pre className="my-2 rounded-lg bg-secondary p-4">
				{JSON.stringify(session, null, 2)}
			</pre>
			<SignOutBtn />
		</main>
	);
}
