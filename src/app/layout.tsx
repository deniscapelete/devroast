import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "DevRoast",
	description: "Get your code roasted",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${jetbrainsMono.variable}`}>
			<body>
				<Navbar />
				{children}
			</body>
		</html>
	);
}
