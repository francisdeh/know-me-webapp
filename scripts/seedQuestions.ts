import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

type Question = {
	text: string;
	category: string;
	depth: string;
};

const questions: Question[] = [
	// Faith & Spirituality
	{
		text: "Which part of church service do you enjoy or connect with the most and why?",
		category: "faith",
		depth: "light",
	},
	{
		text: "If you could ask God one question and get a direct answer, what would it be?",
		category: "faith",
		depth: "light",
	},
	{
		text: "How important is it that your partner shares your exact denomination or beliefs?",
		category: "faith",
		depth: "medium",
	},
	{
		text: "What is one lesson you learned from the Bible that applies to your life beyond your spiritual walk?",
		category: "faith",
		depth: "medium",
	},
	{
		text: "What do you think is happening in the world right now that could be a fulfilment of biblical prophecy?",
		category: "faith",
		depth: "medium",
	},
	{
		text: "How do you think faith should show up in how a couple handles conflict?",
		category: "faith",
		depth: "medium",
	},
	{ text: "How do you handle seasons when God feels distant?", category: "faith", depth: "deep" },
	{
		text: "What does a spiritually healthy home look like to you?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How important is it to you that your family attends the same church as you?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "Is there anything about your current church experience that you feel you could not give up?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How much weight do you give a prophetic word spoken over you — would it influence a major life decision?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "If a prophet gave a word over our marriage or family, how would you want us to process that together?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "Could you see yourself being spiritually fulfilled in a church that is very different from your current one?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How would you want us to handle having different home churches if we couldn't agree on one?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "What do you think the spiritual home of a family should look like — one church, one pastor, one community?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How do you handle theological disagreements between you and your partner — do you see them as something to resolve or something to coexist with?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "What is one theological belief you hold that you think most people in your church may not fully understand or agree with?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "Is a wedding ring important to you — what does it mean to you symbolically?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "Does your church have any spoken or unspoken expectations about how women dress or present themselves? How do you personally relate to those expectations?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How important is it to you that your partner is comfortable with how you dress and present yourself?",
		category: "faith",
		depth: "deep",
	},
	{
		text: "How would you feel if your partner had a strong opinion about your jewellery, makeup, or hair choices?",
		category: "faith",
		depth: "deep",
	},

	// Family & Roots
	{ text: "Describe your family growing up in a sentence.", category: "family", depth: "light" },
	{
		text: "What is your relationship like with your siblings, if you have any?",
		category: "family",
		depth: "light",
	},
	{
		text: "Is there a family name — first or last — you feel strongly about passing on?",
		category: "family",
		depth: "light",
	},
	{
		text: "How was love expressed — or not expressed — in your home growing up?",
		category: "family",
		depth: "medium",
	},
	{
		text: "What is one family ritual or tradition that meant a lot to you?",
		category: "family",
		depth: "medium",
	},
	{
		text: "What does your family think makes a good partner or spouse?",
		category: "family",
		depth: "medium",
	},
	{
		text: "How much influence do you think extended family should have in your relationship?",
		category: "family",
		depth: "medium",
	},
	{
		text: "How do you handle family members who overstep boundaries?",
		category: "family",
		depth: "medium",
	},
	{
		text: "What is one thing your parents did that you want to carry into your own home?",
		category: "family",
		depth: "deep",
	},
	{
		text: "What is one thing your parents did that you want to do differently?",
		category: "family",
		depth: "deep",
	},

	// Marriage & Future
	{
		text: "What does your dream wedding look like — big, intimate, destination, traditional?",
		category: "marriage",
		depth: "light",
	},
	{
		text: "Where in the world would you want to honeymoon? If that's even a thing you are considering.",
		category: "marriage",
		depth: "light",
	},
	{
		text: "Would you prefer boys or girls, and what is your honest reason?",
		category: "marriage",
		depth: "light",
	},
	{
		text: "Does age play a role in who you'd consider dating — would you date someone younger than you, older, or does it not factor in?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "How many children do you want, if any? And at what pace?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "How do you think finances should be handled in a marriage — joint, separate, or both?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "How do you feel about a spouse who travels frequently for work?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "Is there a place you want to live long term, or are you open to moving?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "What is one lifetime experience you want to share with your partner before you are old?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "What does a healthy division of household responsibilities look like to you?",
		category: "marriage",
		depth: "medium",
	},
	{
		text: "What do you expect marriage to feel like on an ordinary Tuesday — not just the highlights?",
		category: "marriage",
		depth: "deep",
	},
	{
		text: "What role do you see yourself playing in the home — practically and emotionally?",
		category: "marriage",
		depth: "deep",
	},
	{
		text: "How do you think a couple should handle disagreements about extended family expectations?",
		category: "marriage",
		depth: "deep",
	},

	// Career & Purpose
	{
		text: "What are three skills you believe will survive the AI wave and remain valuable?",
		category: "career",
		depth: "light",
	},
	{
		text: "How do you define success in your career five years from now?",
		category: "career",
		depth: "light",
	},
	{
		text: "What problem do you most want your work to solve in the world?",
		category: "career",
		depth: "medium",
	},
	{
		text: "How do you balance ambition with rest and presence at home?",
		category: "career",
		depth: "medium",
	},
	{
		text: "What would you do with your time if money was completely off the table?",
		category: "career",
		depth: "medium",
	},
	{
		text: "How do you feel about your partner earning significantly more or less than you?",
		category: "career",
		depth: "medium",
	},
	{
		text: "Would you ever sacrifice career advancement for family — under what conditions?",
		category: "career",
		depth: "deep",
	},
	{
		text: "If your career had to have a legacy, what would you want it to be?",
		category: "career",
		depth: "deep",
	},

	// Personal Growth
	{
		text: "What is one area of your life you are actively working to improve right now?",
		category: "growth",
		depth: "light",
	},
	{
		text: "What is the most recent thing that genuinely changed how you think?",
		category: "growth",
		depth: "light",
	},
	{
		text: "What is one habit you have tried to build and failed at? What happened?",
		category: "growth",
		depth: "light",
	},
	{
		text: "How do you respond when you are wrong — in private and in public?",
		category: "growth",
		depth: "medium",
	},
	{ text: "Who has shaped who you are the most, and how?", category: "growth", depth: "medium" },
	{
		text: "What does lifelong improvement look like practically in your day to day?",
		category: "growth",
		depth: "medium",
	},
	{
		text: "How do you handle criticism — from people close to you versus strangers?",
		category: "growth",
		depth: "medium",
	},
	{
		text: "What has been your hardest season in life and what did it teach you?",
		category: "growth",
		depth: "deep",
	},

	// Interests & Lifestyle
	{
		text: "What genre of music do you listen to most, and what does it do for you?",
		category: "interests",
		depth: "light",
	},
	{
		text: "What sport do you play or follow, and how seriously do you take it?",
		category: "interests",
		depth: "light",
	},
	{
		text: "What is the last movie or series that genuinely moved you?",
		category: "interests",
		depth: "light",
	},
	{
		text: "Do you bake or cook? What is your signature dish?",
		category: "interests",
		depth: "light",
	},
	{
		text: "What is your favourite food — and what is one meal you would love someone to cook for you?",
		category: "interests",
		depth: "light",
	},
	{
		text: "Do you play games — board games, video games, card games? What is your favourite?",
		category: "interests",
		depth: "light",
	},
	{
		text: "Do you have any unusual or niche hobbies? Bird watching, collecting, something people wouldn't guess?",
		category: "interests",
		depth: "light",
	},
	{
		text: "What does a perfect weekend look like to you from Friday evening to Sunday night?",
		category: "interests",
		depth: "medium",
	},
	{
		text: "How do you recharge — alone, with a few close people, or in a crowd?",
		category: "interests",
		depth: "medium",
	},
	{
		text: "What kind of environment do you thrive in — city, suburb, rural, or somewhere else?",
		category: "interests",
		depth: "medium",
	},
	{
		text: "Is there something you want to learn or experience in the next two years?",
		category: "interests",
		depth: "medium",
	},

	// Money & Finances
	{
		text: "Would you describe yourself as a saver, a spender, or somewhere in between?",
		category: "money",
		depth: "light",
	},
	{
		text: "Do you have a budget — formal or informal — that you actually follow?",
		category: "money",
		depth: "light",
	},
	{
		text: "What is your current relationship with money — is it a source of stress, security, or something else?",
		category: "money",
		depth: "light",
	},
	{
		text: "What did money look like growing up in your home — was it talked about openly or kept quiet?",
		category: "money",
		depth: "medium",
	},
	{
		text: "Do you invest? If yes, where — stocks, real estate, business, savings plans?",
		category: "money",
		depth: "medium",
	},
	{
		text: "How do you think about building wealth — is it something you actively plan for or something you hope happens?",
		category: "money",
		depth: "medium",
	},
	{
		text: "How important is it that your partner is financially disciplined?",
		category: "money",
		depth: "medium",
	},
	{
		text: "Do you believe in giving — tithing, charity, supporting family? How do you practice that currently?",
		category: "money",
		depth: "medium",
	},
	{
		text: "How do you think finances should be structured in a marriage — fully joint, fully separate, or a hybrid?",
		category: "money",
		depth: "medium",
	},
	{
		text: "What does financial freedom mean to you practically — what does that life look like?",
		category: "money",
		depth: "medium",
	},
	{
		text: "Do you currently have any debt — loans, credit cards, family obligations? How are you managing it?",
		category: "money",
		depth: "deep",
	},
	{
		text: "How do you feel about supporting extended family financially — parents, siblings, relatives?",
		category: "money",
		depth: "deep",
	},
	{
		text: "If your partner had significant debt coming into a marriage, how would you approach that?",
		category: "money",
		depth: "deep",
	},
	{
		text: "What is your honest money weakness — overspending, avoidance, impulsive decisions, something else?",
		category: "money",
		depth: "deep",
	},
	{
		text: "How do you think a couple should handle financial disagreements — who has the final say, or is it always consensus?",
		category: "money",
		depth: "deep",
	},

	// Health & Fitness
	{
		text: "How active are you day to day — do you exercise regularly or is it something you're working on?",
		category: "health",
		depth: "light",
	},
	{
		text: "Do you have a sport, workout routine, or physical activity you genuinely enjoy?",
		category: "health",
		depth: "light",
	},
	{
		text: "Are you more of a gym person, an outdoor person, or neither?",
		category: "health",
		depth: "light",
	},
	{
		text: "How important is it to you that your partner is physically active?",
		category: "health",
		depth: "light",
	},
	{
		text: "How do you think about food — is it fuel, culture, pleasure, or all three?",
		category: "health",
		depth: "medium",
	},
	{
		text: "Do you have any dietary preferences or restrictions — vegetarian, clean eating, anything faith-based?",
		category: "health",
		depth: "medium",
	},
	{
		text: "How do you handle stress physically — does it affect your sleep, appetite, or energy?",
		category: "health",
		depth: "medium",
	},
	{
		text: "Do you think couples should work out together, or is that personal territory?",
		category: "health",
		depth: "medium",
	},
	{
		text: "Do you know your blood group? Is that something you think couples should share early on?",
		category: "health",
		depth: "medium",
	},
	{
		text: "Do you know your rhesus factor — and do you understand what it could mean for pregnancy?",
		category: "health",
		depth: "medium",
	},
	{
		text: "Do you know your sickle cell status — AS, AA, SS? Have you ever been tested?",
		category: "health",
		depth: "deep",
	},
	{
		text: "How do you think a couple should approach the sickle cell conversation before deciding to have children?",
		category: "health",
		depth: "deep",
	},
	{
		text: "Is there a hereditary condition or significant medical history in your family you feel a serious partner should know about?",
		category: "health",
		depth: "deep",
	},
	{
		text: "Have you ever struggled with your body image — how do you relate to your body now?",
		category: "health",
		depth: "deep",
	},
	{
		text: "How do you handle seasons of low motivation, poor sleep, or burnout — what does that look like for you?",
		category: "health",
		depth: "deep",
	},
	{
		text: "How do you think a couple should approach health decisions together — personal autonomy or shared accountability?",
		category: "health",
		depth: "deep",
	},
	{
		text: "If your partner gained significant weight or let their health go, how would you handle that conversation?",
		category: "health",
		depth: "deep",
	},

	// Love & Intimacy
	{
		text: "What is your love language — and do you feel it is actually met in your close relationships?",
		category: "intimacy",
		depth: "light",
	},
	{
		text: "How do you prefer to communicate day to day — calls, texts, voice notes, in person?",
		category: "intimacy",
		depth: "light",
	},
	{
		text: "How often do you need to talk to someone you care about to feel connected?",
		category: "intimacy",
		depth: "light",
	},
	{
		text: "What is one small thing someone can do consistently that makes you feel valued?",
		category: "intimacy",
		depth: "light",
	},
	{
		text: "What kind of quality time means the most to you — doing something together or just being present?",
		category: "intimacy",
		depth: "light",
	},
	{
		text: "How do you show love — what does affection naturally look like from you?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "How do you like to be comforted when you are going through something difficult?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "Do you find it easy or hard to express how you feel — and has that changed over time?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "How do you handle it when the person you care about goes quiet or pulls back emotionally?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "What does emotional safety mean to you in a relationship — what does it feel like when it is present?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "How important is physical touch and affection in a relationship to you — daily, occasional, or only when it feels right?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "How do you like to spend time with someone you are close to — active, social, quiet, creative?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "How do you navigate the balance between independence and closeness in a relationship?",
		category: "intimacy",
		depth: "medium",
	},
	{
		text: "What is your communication style when there is tension — do you confront, withdraw, or process alone first?",
		category: "intimacy",
		depth: "deep",
	},
	{
		text: "How do you repair after a disagreement — what does reconciliation look like for you?",
		category: "intimacy",
		depth: "deep",
	},
	{
		text: "What does a deeply connected relationship look like to you at its best — what is present that most relationships don't have?",
		category: "intimacy",
		depth: "deep",
	},

	// World & Big Thinking
	{
		text: "What is one thing you genuinely like or find fascinating about pandas?",
		category: "world",
		depth: "light",
	},
	{
		text: "What is one thing you find interesting about snakes — even if they scare you?",
		category: "world",
		depth: "light",
	},
	{
		text: "Do you think humans will ever live on Mars? Would you go if you could?",
		category: "world",
		depth: "light",
	},
	{
		text: "What are three things you know are happening globally or nationally right now that matter to you?",
		category: "world",
		depth: "medium",
	},
	{
		text: "If you could fix one broken system in your country, what would it be and how?",
		category: "world",
		depth: "medium",
	},
	{
		text: "What is one unpopular opinion you hold about society that you are willing to defend?",
		category: "world",
		depth: "medium",
	},
	{
		text: "Do you think social media is doing more harm than good to relationships? Why?",
		category: "world",
		depth: "medium",
	},
	{
		text: "What is one invention or technology you think the world is not ready for?",
		category: "world",
		depth: "medium",
	},
	{
		text: "How do you think the world will end — scientifically, spiritually, or both?",
		category: "world",
		depth: "medium",
	},
	{
		text: "If you had to make one case — just one — in defence of Lucifer, what would it be?",
		category: "world",
		depth: "light",
	},

	// Fun & Random
	{
		text: "Who are your top three comedians — and what is it about their style that gets you?",
		category: "fun",
		depth: "light",
	},
	{
		text: "Are you currently reading anything — what is it and what pulled you to it?",
		category: "fun",
		depth: "light",
	},
	{
		text: "What is a skill you have that would genuinely surprise people?",
		category: "fun",
		depth: "light",
	},
	{
		text: "If you could live anywhere in the world for exactly one year, where and why?",
		category: "fun",
		depth: "light",
	},
	{
		text: "What is something small that consistently makes your day better?",
		category: "fun",
		depth: "light",
	},
	{
		text: "If someone were to cook you one meal to win your heart, what would it be?",
		category: "fun",
		depth: "light",
	},
	{
		text: "What is the most spontaneous thing you have ever done?",
		category: "fun",
		depth: "light",
	},
	{
		text: "What is a film, book, or song that you think everyone should experience once?",
		category: "fun",
		depth: "light",
	},
	{
		text: "How do you feel about makeup — do you wear it, when, and why or why not?",
		category: "fun",
		depth: "medium",
	},
	{
		text: "What does femininity mean to you — how do you express or define it in your own life?",
		category: "fun",
		depth: "medium",
	},
	{
		text: "What is one thing about yourself that takes people time to understand?",
		category: "fun",
		depth: "medium",
	},
	{
		text: "What is a question you wish someone would ask you that nobody ever does?",
		category: "fun",
		depth: "deep",
	},
];

async function seed() {
	const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
	const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

	// Admin SDK picks up FIRESTORE_EMULATOR_HOST automatically when set
	if (useEmulator) {
		console.log("→ Using Firestore emulator at localhost:8080");
	} else {
		console.log(`→ Using production Firestore (project: ${projectId})`);
	}

	const sa = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
	if (!useEmulator && !sa) {
		console.error("FIREBASE_ADMIN_SERVICE_ACCOUNT is required when not using the emulator");
		process.exit(1);
	}
	const app = useEmulator
		? initializeApp({ projectId })
		: initializeApp({ credential: cert(JSON.parse(sa as string)) });
	const db = getFirestore(app);

	console.log(`→ Seeding ${questions.length} questions…`);

	for (const q of questions) {
		await db.collection("questions").add({
			...q,
			suggestedBy: "system",
			createdAt: FieldValue.serverTimestamp(),
		});
	}

	console.log(`✓ Seeded ${questions.length} questions successfully`);
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
