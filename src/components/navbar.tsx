import Link from "next/link";

export function Navbar() {
	return (
		<header className="w-full h-14 flex items-center justify-between px-10 bg-bg-page border-b border-border-primary sticky top-0 z-50">
			<Link href="/" className="flex items-center gap-2">
				<span className="font-mono font-bold text-xl text-accent-green">{">"}</span>
				<span className="font-mono font-medium text-lg text-text-primary">
					devroast
				</span>
			</Link>

			<nav className="flex items-center gap-6">
				<Link
					href="/leaderboard"
					className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-150"
				>
					leaderboard
				</Link>
			</nav>
		</header>
	);
}
