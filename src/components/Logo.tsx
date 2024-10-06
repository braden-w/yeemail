import { MailIcon } from "lucide-react";
import Link from "next/link";

export function Logo() {
	return (
		<Link className="flex items-center justify-center" href="/dashboard">
			<MailIcon className="h-6 w-6 text-blue-600" />
			<span className="ml-2 font-bold text-xl">YEEMail</span>
		</Link>
	);
}
