import type { SidebarLink } from "@/components/SidebarItems";
import {
	Bookmark,
	Calendar,
	Cog,
	HomeIcon,
	Mail,
	Rocket,
	User,
} from "lucide-react";

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
				href: "/launch",
				title: "Launch",
				icon: Rocket,
			},
			{
				href: "/emails",
				title: "Emails",
				icon: Mail,
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
			{
				href: "/saved-events",
				title: "Saved Events",
				icon: Bookmark,
			},
		],
	},
];
