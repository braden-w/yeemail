import type { SidebarLink } from "@/components/SidebarItems";
import { Calendar, Cog, Globe, HomeIcon, User } from "lucide-react";

type AdditionalLinks = {
	title: string;
	links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
	{ href: "/dashboard", title: "Home", icon: HomeIcon },
	{ href: "/account", title: "Account", icon: User },
	{ href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
	{
		title: "Emails",
		links: [
			{
				href: "/emails",
				title: "Emails",
				icon: Globe,
			},
		],
	},
	{
		title: "Events",
		links: [
			{
				href: "/suggested-events",
				title: "Suggested Events",
				icon: Calendar,
			},
		],
	},
];
