/**
 * seed-blogs.js
 * Adds demo blogs for every category WITHOUT deleting existing data.
 * Run with: node init/seed-blogs.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Listing  = require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URL;

// ─── Pick an owner: the first user found in DB ────────────────────────────────
const User = require("../models/user.js");

const blogs = [

  // ─── TECHNOLOGY ─────────────────────────────────────────────────────────────
  {
    title: "The Rise of Artificial Intelligence in Everyday Life",
    description: `Artificial Intelligence is no longer a concept confined to science fiction. From the voice assistant on your phone to the recommendation engine on your favourite streaming platform, AI has quietly woven itself into the fabric of daily life. Machine learning algorithms now help doctors detect cancer earlier, allow self-driving cars to navigate complex roads, and enable banks to flag fraudulent transactions in milliseconds.\n\nThe pace of progress is staggering. Just a decade ago, natural language processing was clunky and error-prone. Today, large language models can write poetry, debug code, and translate between hundreds of languages with near-human fluency. The question is no longer whether AI will change our world — it already has. The real conversation is about how we guide that change responsibly, ensuring that the benefits are distributed equitably and that the risks are managed with care and foresight.`,
    category: "Technology",
    image: { url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80", filename: "ai-blog" }
  },
  {
    title: "Quantum Computing: The Next Technological Frontier",
    description: `Quantum computers exploit the principles of quantum mechanics — superposition and entanglement — to perform calculations that would take classical computers millions of years. While still largely experimental, companies like IBM, Google, and a host of well-funded startups are racing toward the milestone of "quantum advantage" — the point where a quantum machine decisively outperforms any classical alternative.\n\nThe implications stretch across every industry. Drug discovery could be accelerated dramatically as researchers simulate molecular interactions at the quantum level. Financial institutions could optimise portfolios across billions of variables in real time. Cryptographers, meanwhile, are urgently developing "post-quantum" encryption standards to protect our digital infrastructure from the day a sufficiently powerful quantum computer arrives and renders today's security obsolete.`,
    category: "Technology",
    image: { url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80", filename: "quantum-blog" }
  },
  {
    title: "Why Every Developer Should Learn Rust in 2026",
    description: `Rust has gone from a niche Mozilla project to one of the most admired programming languages in the world. For seven years running, it has topped Stack Overflow's "most loved language" survey. The reason is simple: Rust gives you the raw performance of C and C++ while eliminating entire categories of bugs — null pointer dereferences, buffer overflows, data races — at compile time.\n\nMajor tech companies have taken notice. Microsoft is rewriting core Windows components in Rust. The Linux kernel now accepts Rust modules. Google uses it in Android and ChromeOS. Meta builds performance-critical infrastructure with it. If you write systems software, web backends, or embedded firmware, learning Rust isn't just a career enhancement — it may soon be a prerequisite.`,
    category: "Technology",
    image: { url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80", filename: "rust-blog" }
  },

  // ─── TRAVEL ─────────────────────────────────────────────────────────────────
  {
    title: "Exploring the Hidden Gems of Southeast Asia",
    description: `Most travellers arrive in Southeast Asia with a well-worn itinerary: Bangkok, Chiang Mai, Bali, Halong Bay. And while these places are popular for excellent reasons, the region rewards those willing to venture off the tourist trail. Tiny guesthouses in Kampot, Cambodia offer sunsets over pepper fields that rival anything in Santorini. The spice islands of Maluku in eastern Indonesia remain almost untouched by mass tourism, their coral reefs pristine and their streets blissfully unhurried.\n\nSlow travel is the philosophy that unlocks Southeast Asia's best kept secrets. Spend two weeks in one country instead of ticking off five in the same period. Learn ten words of the local language — locals will remember you for it. Eat where there are no English menus. Take the overnight bus instead of the budget airline. The discomforts are temporary; the memories last forever.`,
    category: "Travel",
    image: { url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", filename: "sea-blog" }
  },
  {
    title: "A Solo Journey Through the Andes Mountains",
    description: `There is something humbling about standing at 4,500 metres above sea level with nothing but sky above and endless peaks below. I set off from Cusco with a 14-kilogram pack and a rough plan: walk the Salkantay Trek to Machu Picchu, then continue south through Bolivia's Altiplano to the silver-domed city of Potosí.\n\nThe Andes teach you patience and presence. Altitude sickness is a great equaliser — it strikes fit athletes and couch potatoes alike, and the only cure is time. I spent two extra days acclimatising in Pisac, visiting the market, reading, watching llamas graze in terraced fields built five centuries ago. By the time I reached the Sun Gate above Machu Picchu at dawn, every aching muscle felt entirely worth it.`,
    category: "Travel",
    image: { url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80", filename: "andes-blog" }
  },
  {
    title: "Japan in Cherry Blossom Season: A Complete Guide",
    description: `Every spring, Japan undergoes a transformation that draws millions of visitors and stops the nation in its tracks. The sakura — cherry blossoms — bloom for roughly two fleeting weeks, and during that window every park, castle moat, and mountain slope bursts into clouds of pale pink and white. Hanami (flower-viewing) parties fill riverbanks from Kyushu to Hokkaido as friends and families lay picnic blankets under the blossoms.\n\nTiming your visit requires planning and a little luck. The Japan Meteorological Corporation publishes annual forecasts that track the "sakura front" as it moves northward, typically reaching Tokyo in late March and Sapporo in late April. Book accommodation at least three months ahead — rooms near Maruyama Park in Sapporo or Philosopher's Path in Kyoto sell out almost instantly once the forecast is released.`,
    category: "Travel",
    image: { url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80", filename: "japan-blog" }
  },

  // ─── FOOD ───────────────────────────────────────────────────────────────────
  {
    title: "The Art of Making Perfect Sourdough at Home",
    description: `Sourdough bread is alive. That's not metaphor — the wild yeast and bacteria cultures in a healthy starter are genuinely living organisms that you feed, nurture, and coax into action. The pandemic-era sourdough craze introduced millions of people to this ancient craft, and many have never looked back.\n\nThe key to great sourdough is patience and observation rather than rigid recipes. Learn to read your dough: a well-fermented loaf feels alive in your hands, gassy and extensible. The windowpane test — stretching a small piece until it's translucent without tearing — is your best indicator of sufficient gluten development. Score boldly before baking. Steam in the first 20 minutes creates the dramatic oven spring and blistered crust that makes a homemade sourdough indistinguishable from a high-end bakery loaf.`,
    category: "Food",
    image: { url: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80", filename: "sourdough-blog" }
  },
  {
    title: "Street Food Around the World: 10 Must-Try Dishes",
    description: `The best food in any city is rarely found in its Michelin-starred restaurants. It's ladled out of steaming woks in Bangkok's Chinatown, grilled over charcoal in Marrakech's Djemaa el-Fna, handed through a car window in Mexico City's taco alley. Street food is democracy on a plate — cheap, fast, and made by people who have perfected a single dish over decades.\n\nMy personal top ten spans every continent: pad see ew from a Bangkok hawker, arepas con queso from a Bogotá corner cart, takoyaki (octopus balls) from an Osaka festival stall, bunny chow from Durban, South Africa, gözleme from a Turkish market, bánh mì from a Saigon bicycle vendor, pani puri on a Mumbai beach, jerk chicken from a Kingston oil-drum smoker, poutine from a Montréal chip wagon, and — yes — a perfectly assembled New York hot dog at 2 a.m.`,
    category: "Food",
    image: { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", filename: "streetfood-blog" }
  },
  {
    title: "Mastering the Art of Indian Spices",
    description: `Indian cooking is an orchestra, and spices are the instruments. The difference between a mediocre curry and a transcendent one is not more spices — it is the right spices, in the right order, treated in the right way. Toasting whole cumin seeds in dry heat releases compounds that simply do not emerge when cumin powder is added cold to a sauce. Blooming turmeric in warm oil for thirty seconds deepens its colour and unlocks its earthy, slightly bitter notes.\n\nBegin with a manageable pantry: cumin, coriander, turmeric, cardamom, cinnamon, cloves, black pepper, red chilli, and a good-quality garam masala. From these nine ingredients you can cook hundreds of dishes. Add mustard seeds, curry leaves, and asafoetida for South Indian cooking; saffron and dried plums for Persian-influenced Mughal cuisine. The journey of learning Indian spices takes a lifetime — and every stage of that journey is delicious.`,
    category: "Food",
    image: { url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80", filename: "spices-blog" }
  },

  // ─── LIFESTYLE ──────────────────────────────────────────────────────────────
  {
    title: "How I Built a Morning Routine That Actually Sticks",
    description: `I used to roll out of bed five minutes before I needed to leave, spending the entire day feeling like I was perpetually catching up. The turning point came when I stopped trying to replicate the elaborate five-hour morning routines I'd seen on YouTube and designed something modest and realistic for my actual life.\n\nMy current routine takes 45 minutes. The first ten are spent without my phone — I make coffee, open a window, and simply sit. The next fifteen go to a brief workout: a few sets of push-ups, pull-ups, and a seven-minute jog around the block. Then a proper breakfast eaten at a table, not over a sink. Finally, fifteen minutes of reading — non-fiction, not news. The transformation has been remarkable not because the routine is extraordinary but because it is consistent. Three months in, I've missed fewer than five days.`,
    category: "Lifestyle",
    image: { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", filename: "morning-blog" }
  },
  {
    title: "Minimalism: Why Owning Less Gives You More",
    description: `Minimalism is not about living with nothing. It is about being intentional with everything. When I reduced my wardrobe from 140 items to 37, I didn't lose versatility — I gained mental clarity. The decision fatigue that had been silently draining my willpower every morning simply evaporated. The same principle applied when I sold my second car, cancelled streaming services I watched rarely, and stopped keeping "just in case" items cluttering my shelves.\n\nThe surprising dividend of owning less is more time. Fewer possessions means less to clean, organise, repair, insure, and think about. That reclaimed time and headspace flows naturally toward things that actually matter: long conversations, creative work, meaningful relationships, and experiences that leave no physical trace but endure as memories.`,
    category: "Lifestyle",
    image: { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", filename: "minimalism-blog" }
  },

  // ─── EDUCATION ──────────────────────────────────────────────────────────────
  {
    title: "How to Learn Anything Faster: The Science of Accelerated Learning",
    description: `Cognitive science has dramatically improved our understanding of how the brain encodes and retains information — yet most people still study the way their parents did: re-reading notes, highlighting textbooks, and cramming the night before. Research consistently shows these are among the least effective learning strategies available.\n\nSpaced repetition — reviewing information at increasing intervals just before you would otherwise forget it — is the single most evidence-backed technique for long-term retention. Combined with active recall (testing yourself rather than passively reviewing), interleaving (mixing topics instead of blocking them), and elaborative interrogation (asking "why" rather than just "what"), you can learn the same material in a fraction of the time while retaining it far longer. The Feynman Technique — explaining a concept in simple language as if teaching a child — remains the gold standard for identifying gaps in your own understanding.`,
    category: "Education",
    image: { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", filename: "learning-blog" }
  },
  {
    title: "The Future of Online Education: Beyond Video Lectures",
    description: `The MOOC revolution promised to democratise world-class education. And it did — sort of. Completion rates for free online courses stubbornly hover below 10%, suggesting that access is not the primary barrier to learning. Engagement, accountability, and community are.\n\nThe next generation of online education is addressing these gaps with a range of innovations. Cohort-based courses create peer accountability and social learning pressure. AI tutors provide instant, personalised feedback at a cost per student that would have been unimaginable five years ago. Adaptive learning platforms adjust the difficulty and sequence of content in real time based on individual performance data. Meanwhile, credential stacking — building recognised qualifications from modular micro-credentials across multiple providers — is beginning to challenge the dominance of the four-year degree in technical fields.`,
    category: "Education",
    image: { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", filename: "edtech-blog" }
  },

  // ─── ART ────────────────────────────────────────────────────────────────────
  {
    title: "The Psychology of Colour in Modern Art",
    description: `Colour is never neutral. When Mark Rothko painted those immense, luminous rectangles of red and orange and black, he wasn't simply making aesthetic choices — he was engineering emotional states. Viewers standing close to his canvases report feelings of awe, melancholy, and even existential vertigo. This is not accident or imagination; it reflects deep psychological mechanisms by which the visual cortex and limbic system process chromatic information.\n\nBlue consistently lowers heart rate and blood pressure across cultures. Red increases physiological arousal and — in certain contexts — competitive performance. Yellow at high saturation triggers mild anxiety in most subjects. Artists from Kandinsky to Koons have leveraged these responses deliberately. Understanding the psychology of colour doesn't reduce art to manipulation — it deepens appreciation of the invisible craft behind the visible surface.`,
    category: "Art",
    image: { url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80", filename: "art-colour-blog" }
  },
  {
    title: "From Sketch to Masterpiece: A Beginner's Guide to Drawing",
    description: `Drawing is a skill, not a talent. This is the most liberating and simultaneously most challenging truth for beginners to internalise, because it means there are no excuses — only practice and feedback. The artistic people you admire were not born with a special gift; they spent thousands of hours building a visual vocabulary, training their hands to follow their eyes, and learning to see the world in terms of shapes, values, and edges rather than symbolic objects.\n\nBegin with gesture drawing — fast, loose two-minute sketches of human figures in motion. Websites like Line of Action provide timed reference images. Gesture trains you to capture the essence of a pose before you get tangled in detail. Once comfortable with gesture, move to value studies: draw simple objects in graphite, using only a full range from white to black. Understanding how light falls on form is the foundation upon which all other representational skill is built.`,
    category: "Art",
    image: { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", filename: "drawing-blog" }
  },

  // ─── SPORT ──────────────────────────────────────────────────────────────────
  {
    title: "The Mental Game: How Elite Athletes Train Their Minds",
    description: `At the highest levels of sport, the physical gap between competitors is often negligible. What separates champions from also-rans is increasingly understood to be psychological: focus, resilience, the ability to perform under pressure, and the capacity to recover quickly from setbacks. Sports psychology is no longer a niche discipline — it is a core component of elite training programmes worldwide.\n\nVisualization is among the most researched techniques: mentally rehearsing performance in vivid, multi-sensory detail activates many of the same neural pathways as physical practice. Olympic shooters close their eyes and run through their routine perfectly before every competition. Marathon runners mentally segment the race, creating a series of smaller, manageable goals rather than confronting the full distance at once. Self-talk, breath control, and pre-performance rituals all play measurable roles in regulating arousal and maintaining concentration during high-stakes competition.`,
    category: "Sport",
    image: { url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80", filename: "sport-mental-blog" }
  },
  {
    title: "Running Your First Marathon: A Complete Training Guide",
    description: `Crossing a marathon finish line for the first time is a transformative experience. The 42.195-kilometre distance is demanding enough to require genuine commitment yet achievable for any reasonably healthy adult willing to train consistently over four to six months. The most common mistake first-timers make is running too fast too often — an error that leads to injury and burnout before race day.\n\nA sensible 16-week programme builds mileage gradually, with the long run increasing by no more than 10% per week and a recovery week every fourth week. The majority of your running — perhaps 80% — should be at an easy, conversational pace where you could hold a full sentence without gasping. This builds aerobic base efficiently and keeps injury risk low. Save harder effort for one tempo run and one interval session per week. Fuel and hydration strategy matter enormously; practice your race-day nutrition in training so nothing is new on the big day.`,
    category: "Sport",
    image: { url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80", filename: "marathon-blog" }
  },

  // ─── ENTERTAINMENT ──────────────────────────────────────────────────────────
  {
    title: "The Golden Age of Prestige TV: What Comes Next?",
    description: `We are living through an extraordinary period in television history. The Sopranos broke the mould, The Wire redefined what the medium could say, and Breaking Bad demonstrated that a character could descend into evil and remain compulsively watchable. Since then, the streaming wars have produced a firehose of content — some brilliant, most adequate, some catastrophically expensive and quickly cancelled.\n\nThe question now is whether the model is sustainable. Netflix's subscriber growth has plateaued. Disney+ is profitable only in certain markets. The era of throwing unlimited budgets at unproven IP is giving way to a more cautious approach: fewer shows, longer development time, bigger bets on established talent. The shows that will define the next decade will likely be smaller, stranger, and more personal — the prestige drama equivalent of independent cinema emerging in the shadow of the blockbuster machine.`,
    category: "Entertainment",
    image: { url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80", filename: "tv-blog" }
  },
  {
    title: "Why Video Games Are the Most Powerful Storytelling Medium",
    description: `Books immerse you in a character's inner world. Films surround you with cinematic vision and sound. But only video games ask you to inhabit the protagonist — to make the decisions, bear the consequences, and feel genuinely responsible for what unfolds. This is not a minor distinction; it is a fundamental difference in the nature of the emotional experience.\n\nWhen Joel makes his fateful choice at the end of The Last of Us, the player's complicity makes the moment devastating in a way that watching the same scene in a film simply cannot replicate. When you spend thirty hours building a settlement in a role-playing game only to see it burned to the ground, the grief is real because the investment of time and attention was real. The best video game storytelling leverages this unique power with increasing sophistication — and the medium is only in its adolescence.`,
    category: "Entertainment",
    image: { url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80", filename: "gaming-blog" }
  },

  // ─── ANIMAL ─────────────────────────────────────────────────────────────────
  {
    title: "The Secret Intelligence of Crows",
    description: `Crows and their relatives — ravens, jackdaws, jays — belong to a family called Corvidae that consistently ranks among the most cognitively sophisticated animals on Earth. Their brains, while small in absolute terms, contain a cortex-equivalent region that generates remarkably flexible, tool-using, future-planning behaviour.\n\nNew Caledonian crows manufacture hooked tools from leaves and twigs to extract grubs from bark — behaviour previously considered exclusive to humans and great apes. Ravens demonstrate an understanding of fairness, refusing to participate in tasks when they observe partners receiving unequal rewards. American crows remember individual human faces for years, holding grudges against people who have wronged them and warning their offspring about those same individuals. If you've ever felt watched by a crow, you probably were — and it almost certainly knows your face.`,
    category: "Animal",
    image: { url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80", filename: "crow-blog" }
  },
  {
    title: "Protecting Ocean Giants: The Fight to Save Blue Whales",
    description: `The blue whale is the largest animal that has ever lived on Earth — a creature up to 30 metres long and 170 tonnes in weight whose heart is the size of a small car and whose call can be heard 1,600 kilometres away. And yet, a century of industrial whaling brought this magnificent animal to the brink of extinction, reducing some populations by 99% before an international moratorium was finally imposed in 1966.\n\nRecovery has been agonisingly slow. The Southern Hemisphere population may now number only 1,000-2,500 individuals, still critically endangered. Ship strikes and entanglement in fishing gear claim dozens each year. Noise pollution from shipping lanes disrupts their communication and navigation. Climate change is shifting the distribution of krill — their exclusive food source — with consequences that remain difficult to predict. Conservation organisations are advocating for expanded marine protected areas, speed restrictions in critical feeding grounds, and new technologies for real-time whale detection to alert shipping traffic.`,
    category: "Animal",
    image: { url: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=800&q=80", filename: "whale-blog" }
  }
];

async function seedBlogs() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find any existing user to assign as owner
    const existingUser = await User.findOne({});
    if (!existingUser) {
      console.log("❌ No users found. Please create an account first, then run this script.");
      process.exit(1);
    }

    const ownerId = existingUser._id;
    console.log(`📝 Using owner: ${existingUser.username} (${ownerId})`);

    const blogsWithOwner = blogs.map(b => ({ ...b, owner: ownerId }));
    const inserted = await Listing.insertMany(blogsWithOwner);

    console.log(`✅ Successfully inserted ${inserted.length} blogs across all categories!`);
    console.log("Categories added: Technology, Travel, Food, Lifestyle, Education, Art, Sport, Entertainment, Animal");
  } catch (err) {
    console.error("❌ Error seeding blogs:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedBlogs();
