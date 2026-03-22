import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { TableRow } from "@/components/ui/table-row";
import { Toggle } from "@/components/ui/toggle";

const VARIANTS = ["primary", "secondary", "ghost", "destructive"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const VARIANT_LABELS: Record<(typeof VARIANTS)[number], string> = {
	primary: "$ roast_my_code",
	secondary: "$ share_roast",
	ghost: "$ view_all >>",
	destructive: "$ delete_code",
};

function Section({
	title,
	path,
	children,
}: {
	title: string;
	path: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-3">
					<span className="text-accent-green font-bold text-lg">{"// "}</span>
					<h2 className="text-text-primary font-bold text-lg">{title}</h2>
				</div>
				<span className="font-mono text-[11px] text-text-tertiary pl-8">
					{path}
				</span>
			</div>
			{children}
		</section>
	);
}

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<span className="text-text-tertiary text-xs uppercase tracking-widest">
				{label}
			</span>
			<div className="flex flex-wrap items-center gap-4">{children}</div>
		</div>
	);
}

const SAMPLE_CODE = `function roastScore(code: string): number {
  const issues = lint(code);
  return Math.max(0, 10 - issues.length * 0.5);
}`;

export default async function UIPreviewPage() {
	return (
		<main className="min-h-screen bg-bg-page px-20 py-16 flex flex-col gap-16">
			<header className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="text-accent-green font-bold text-2xl">{"// "}</span>
					<h1 className="text-text-primary font-bold text-2xl">
						component_library
					</h1>
				</div>
				<p className="text-text-secondary text-sm">
					Visual reference for all UI components and their variants.
				</p>
			</header>

			{/* ── Button ─────────────────────────────────────────────────────── */}
			<Section title="button" path="src/components/ui/button.tsx">
				<Row label="variants — size md">
					{VARIANTS.map((variant) => (
						<Button key={variant} variant={variant}>
							{VARIANT_LABELS[variant]}
						</Button>
					))}
				</Row>

				<Row label="sizes — primary variant">
					{SIZES.map((size) => (
						<Button key={size} variant="primary" size={size}>
							{`$ size_${size}`}
						</Button>
					))}
				</Row>

				<Row label="disabled state">
					{VARIANTS.map((variant) => (
						<Button key={variant} variant={variant} disabled>
							{VARIANT_LABELS[variant]}
						</Button>
					))}
				</Row>
			</Section>

			{/* ── Badge ──────────────────────────────────────────────────────── */}
			<Section title="badge" path="src/components/ui/badge.tsx">
				<Row label="variants">
					<Badge variant="good" />
					<Badge variant="warning" />
					<Badge variant="critical" />
					<Badge variant="info" />
				</Row>

				<Row label="custom label">
					<Badge variant="good" label="no issues found" />
					<Badge variant="warning" label="3 warnings" />
					<Badge variant="critical" label="10 errors" />
					<Badge variant="info" label="typescript" />
				</Row>
			</Section>

			{/* ── Toggle ─────────────────────────────────────────────────────── */}
			<Section title="toggle" path="src/components/ui/toggle.tsx">
				<Row label="states">
					<Toggle />
					<Toggle defaultChecked />
					<Toggle label="show_diff" />
					<Toggle defaultChecked label="auto_roast" />
				</Row>
			</Section>

			{/* ── ScoreRing ──────────────────────────────────────────────────── */}
			<Section title="score_ring" path="src/components/ui/score-ring.tsx">
				<Row label="score ranges">
					<ScoreRing score={8.5} />
					<ScoreRing score={5.0} />
					<ScoreRing score={2.3} />
				</Row>

				<Row label="sizes">
					<ScoreRing score={7.5} size={80} />
					<ScoreRing score={7.5} size={120} />
					<ScoreRing score={7.5} size={160} />
				</Row>
			</Section>

			{/* ── Card ───────────────────────────────────────────────────────── */}
			<Section title="card" path="src/components/ui/card.tsx">
				<Row label="with badge variants">
					<Card.Root>
						<Badge variant="good" label="no issues" />
						<Card.Title>clean_function.ts</Card.Title>
						<Card.Description>
							No linting errors found. Code follows all best practices.
						</Card.Description>
					</Card.Root>

					<Card.Root>
						<Badge variant="warning" label="3 warnings" />
						<Card.Title>utils.ts</Card.Title>
						<Card.Description>
							Some unused variables and missing return types detected.
						</Card.Description>
					</Card.Root>

					<Card.Root>
						<Badge variant="critical" label="10 errors" />
						<Card.Title>legacy_code.js</Card.Title>
						<Card.Description>
							Multiple critical issues found. Refactor recommended.
						</Card.Description>
					</Card.Root>

					<Card.Root>
						<Badge variant="info" label="typescript" />
						<Card.Title>types.d.ts</Card.Title>
						<Card.Description>
							Type definitions file. No executable code to roast.
						</Card.Description>
					</Card.Root>
				</Row>

				<Row label="without badge">
					<Card.Root>
						<Card.Title>anonymous_snippet</Card.Title>
						<Card.Description>
							Submitted without a filename. Analysis applied to raw content.
						</Card.Description>
					</Card.Root>
				</Row>
			</Section>

			{/* ── DiffLine ───────────────────────────────────────────────────── */}
			<Section title="diff_line" path="src/components/ui/diff-line.tsx">
				<Row label="types">
					<div className="w-full border border-border-primary">
						<DiffLine type="context" content="function calculateScore(n) {" />
						<DiffLine
							type="removed"
							content="  return n > 5 ? 'good' : 'bad';"
						/>
						<DiffLine
							type="added"
							content="  return Math.min(10, Math.max(0, n));"
						/>
						<DiffLine type="context" content="}" />
					</div>
				</Row>
			</Section>

			{/* ── TableRow ───────────────────────────────────────────────────── */}
			<Section title="table_row" path="src/components/ui/table-row.tsx">
				<Row label="score ranges">
					<div className="w-full border border-border-primary">
						<div className="flex items-center gap-6 border-b border-border-primary px-5 py-3">
							<span className="w-10 shrink-0 font-mono text-[11px] text-text-tertiary uppercase">
								rank
							</span>
							<span className="w-[60px] shrink-0 font-mono text-[11px] text-text-tertiary uppercase">
								score
							</span>
							<span className="min-w-0 flex-1 font-mono text-[11px] text-text-tertiary uppercase">
								preview
							</span>
							<span className="w-[100px] shrink-0 font-mono text-[11px] text-text-tertiary uppercase">
								lang
							</span>
						</div>
						<TableRow
							rank={1}
							score={9.2}
							codePreview="function isPrime(n) { if (n < 2) return false; ... }"
							lang="javascript"
						/>
						<TableRow
							rank={2}
							score={5.5}
							codePreview="const getData = async () => { const res = await fetch... }"
							lang="typescript"
						/>
						<TableRow
							rank={3}
							score={2.1}
							codePreview="var x = 1; var y = 2; console.log(x+y); eval(input);"
							lang="javascript"
						/>
					</div>
				</Row>
			</Section>

			{/* ── CodeBlock ──────────────────────────────────────────────────── */}
			<Section title="code_block" path="src/components/ui/code-block.tsx">
				<Row label="with filename">
					<div className="w-full">
						<CodeBlock.Root>
							<CodeBlock.Header>
								<span className="font-mono text-[12px] text-text-tertiary">
									score.ts
								</span>
							</CodeBlock.Header>
							<CodeBlock.Body code={SAMPLE_CODE} lang="typescript" />
						</CodeBlock.Root>
					</div>
				</Row>

				<Row label="without filename">
					<div className="w-full">
						<CodeBlock.Root>
							<CodeBlock.Header />
							<CodeBlock.Body
								code={`const msg = "hello, world";\nconsole.log(msg);`}
								lang="javascript"
							/>
						</CodeBlock.Root>
					</div>
				</Row>
			</Section>
		</main>
	);
}
