import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";

export const editorTheme = createTheme({
	theme: "dark",
	settings: {
		background: "var(--color-bg-input)",
		foreground: "var(--color-text-primary)",
		caret: "var(--color-accent-green)",
		selection: "var(--color-bg-elevated)",
		selectionMatch: "var(--color-bg-elevated)",
		lineHighlight: "transparent",
		gutterBackground: "var(--color-bg-input)",
		gutterForeground: "var(--color-text-tertiary)",
		gutterBorder: "transparent",
		gutterActiveForeground: "var(--color-text-secondary)",
	},
	styles: [
		{ tag: t.keyword, color: "var(--color-syn-keyword)" },
		{
			tag: [t.name, t.deleted, t.character, t.macroName],
			color: "var(--color-syn-variable)",
		},
		{ tag: [t.propertyName], color: "var(--color-syn-property)" },
		{
			tag: [
				t.function(t.variableName),
				t.function(t.propertyName),
				t.labelName,
			],
			color: "var(--color-syn-function)",
		},
		{
			tag: [t.color, t.constant(t.name), t.standard(t.name)],
			color: "var(--color-syn-number)",
		},
		{
			tag: [t.definition(t.name), t.separator],
			color: "var(--color-text-primary)",
		},
		{
			tag: [
				t.typeName,
				t.className,
				t.number,
				t.changed,
				t.annotation,
				t.self,
				t.namespace,
			],
			color: "var(--color-syn-type)",
		},
		{
			tag: [
				t.operator,
				t.operatorKeyword,
				t.url,
				t.escape,
				t.regexp,
				t.link,
				t.special(t.string),
			],
			color: "var(--color-syn-operator)",
		},
		{
			tag: [t.meta, t.comment],
			color: "var(--color-text-tertiary)",
			fontStyle: "italic",
		},
		{ tag: t.strong, fontWeight: "bold" },
		{ tag: t.emphasis, fontStyle: "italic" },
		{ tag: t.strikethrough, textDecoration: "line-through" },
		{
			tag: t.link,
			color: "var(--color-syn-function)",
			textDecoration: "underline",
		},
		{ tag: t.heading, fontWeight: "bold", color: "var(--color-syn-variable)" },
		{
			tag: [t.atom, t.bool, t.special(t.variableName)],
			color: "var(--color-syn-number)",
		},
		{
			tag: [t.processingInstruction, t.string, t.inserted],
			color: "var(--color-syn-string)",
		},
		{ tag: t.invalid, color: "var(--color-accent-red)" },
	],
});
