"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export function RoastForm() {
	const [code, setCode] = useState("");

	return (
		<>
			{/* Code Editor */}
			<div className="w-full max-w-[780px]">
				<div className="overflow-hidden border border-border-primary bg-bg-input">
					{/* Window chrome */}
					<div className="flex h-10 items-center border-b border-border-primary px-4">
						<div className="flex items-center gap-1.5">
							<span className="size-2.5 rounded-full bg-accent-red" />
							<span className="size-2.5 rounded-full bg-accent-amber" />
							<span className="size-2.5 rounded-full bg-accent-green" />
						</div>
					</div>
					{/* Editable area */}
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						className="w-full min-h-[280px] resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-text-primary outline-none placeholder:text-text-tertiary"
						placeholder={"// paste your code here..."}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
					/>
				</div>
			</div>

			{/* Actions Bar */}
			<div className="w-full max-w-[780px] flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Toggle defaultChecked label="roast mode" />
					<span className="font-mono text-[12px] text-text-tertiary">
						{"// maximum sarcasm enabled"}
					</span>
				</div>
				<Button variant="primary" disabled={code.trim().length === 0}>
					{"$ roast_my_code"}
				</Button>
			</div>
		</>
	);
}
