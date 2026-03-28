"use client";

import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";
import { editorTheme } from "@/lib/editor-theme";
import { detectLang } from "@/lib/lang-detect";

function getLangExtension(lang: string) {
	switch (lang) {
		case "typescript":
			return javascript({ typescript: true, jsx: true });
		case "javascript":
			return javascript({ jsx: true });
		case "python":
			return python();
		case "sql":
			return sql();
		case "go":
			return go();
		case "rust":
			return rust();
		case "java":
			return java();
		case "cpp":
		case "c":
			return cpp();
		case "php":
			return php();
		case "css":
			return css();
		case "html":
			return html();
		default:
			return javascript();
	}
}

const MAX_CHARS = 5000;

export function RoastForm() {
	const [code, setCode] = useState("");
	const [lang, setLang] = useState("auto");

	function handleCodeChange(value: string) {
		setCode(value);
		if (value.trim().length === 0) setLang("auto");
	}

	const charCount = code.length;
	const isOverLimit = charCount > MAX_CHARS;

	// Use EditorView.domEventHandlers so the paste event is captured inside
	// CodeMirror's own event system — the outer div never receives it.
	const pasteHandler = useMemo(
		() =>
			EditorView.domEventHandlers({
				paste(event) {
					const text = event.clipboardData?.getData("text");
					if (text) {
						setLang(detectLang(text));
					}
				},
			}),
		[],
	);

	const extensions = useMemo(
		() => [
			getLangExtension(lang),
			autocompletion(),
			closeBrackets(),
			EditorView.lineWrapping,
			pasteHandler,
		],
		[lang, pasteHandler],
	);

	return (
		<>
			{/* Code Editor */}
			<div className="w-full max-w-[780px]">
				<div className="overflow-hidden border border-border-primary">
					{/* Window chrome */}
					<div className="flex h-10 items-center justify-between border-b border-border-primary bg-bg-input px-4">
						<div className="flex items-center gap-1.5">
							<span className="size-2.5 rounded-full bg-accent-red" />
							<span className="size-2.5 rounded-full bg-accent-amber" />
							<span className="size-2.5 rounded-full bg-accent-green" />
						</div>
						<div className="relative flex items-center gap-1">
							<select
								value={lang}
								onChange={(e) => setLang(e.target.value)}
								className="cursor-pointer appearance-none bg-transparent pr-4 font-mono text-[11px] text-text-tertiary outline-none"
							>
								<option value="auto" className="bg-bg-input">
									auto-detect
								</option>
								{[
									"javascript",
									"typescript",
									"python",
									"sql",
									"go",
									"rust",
									"java",
									"cpp",
									"c",
									"php",
									"css",
									"html",
								].map((l) => (
									<option key={l} value={l} className="bg-bg-input">
										{l}
									</option>
								))}
							</select>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="pointer-events-none absolute right-0 text-text-tertiary"
							>
								<path d="m6 9 6 6 6-6" />
							</svg>
						</div>
					</div>

					{/* Editor */}
					<CodeMirror
						value={code}
						onChange={handleCodeChange}
						theme={editorTheme}
						extensions={extensions}
						placeholder="// paste your code here..."
						basicSetup={{
							lineNumbers: true,
							highlightActiveLine: false,
							highlightActiveLineGutter: false,
							foldGutter: false,
							dropCursor: false,
							allowMultipleSelections: false,
							indentOnInput: true,
							bracketMatching: true,
							autocompletion: false,
							closeBrackets: false,
						}}
						className="min-h-[280px] text-[13px] [&_.cm-editor]:max-h-[480px] [&_.cm-editor.cm-focused]:outline-none [&_.cm-scroller]:overflow-auto [&_.cm-content]:py-4 [&_.cm-content]:leading-relaxed [&_.cm-line]:px-4 [&_.cm-gutters]:border-r [&_.cm-gutters]:border-r-border-primary [&_.cm-lineNumbers]:pr-3"
					/>

					{/* Char counter */}
					<div className="flex justify-end border-t border-border-primary bg-bg-input px-4 py-1.5">
						<span
							className={cn(
								"font-mono text-[11px]",
								isOverLimit ? "text-accent-red" : "text-text-tertiary",
							)}
						>
							{charCount}/{MAX_CHARS}
						</span>
					</div>
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
				<Button variant="primary" disabled={code.trim().length === 0 || isOverLimit}>
					{"$ roast_my_code"}
				</Button>
			</div>
		</>
	);
}
