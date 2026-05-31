const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const aiService = require("../services/aiService");

// ─── Middleware: must be logged in ─────────────────────────────────────────────
const { isLoggedIn } = require("../middleware");

// ─── 1. AI Image Generator — Pollinations (Free, Unlimited, No Quotas) ────
router.post("/generate-image", isLoggedIn, async (req, res) => {
    const { title, style = "realistic" } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        // We use Pollinations natively to save Gemini quotas purely for text features.
        // It provides unlimited, high-quality images instantly.
        const randomSeed = Math.floor(Math.random() * 1000000000);
        const encodedPrompt = encodeURIComponent(
            `${style} style high quality blog banner for: ${title}, professional, vibrant`
        );
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${randomSeed}`;
        
        return res.json({ imageUrl, isBase64: false, message: "Generated instantly with Pollinations!" });
    } catch (err) {
        console.error("Image generator error:", err);
        return res.status(500).json({ error: "Failed to generate image" });
    }
});


// ─── 2. Quality Score ──────────────────────────────────────────────────────────
router.post("/quality-score", isLoggedIn, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }
        const score = await aiService.generateQualityScore(title, content);
        res.json(score);
    } catch (err) {
        console.error("Quality score error:", err.message);
        res.status(500).json({ error: err.message || "Failed to generate quality score" });
    }
});

// ─── 3. Auto Translation ───────────────────────────────────────────────────────
router.post("/translate", isLoggedIn, async (req, res) => {
    try {
        const { title, content, language } = req.body;
        if (!title || !content || !language) {
            return res.status(400).json({ error: "title, content and language are required" });
        }
        const result = await aiService.translateBlog(title, content, language);
        res.json(result);
    } catch (err) {
        console.error("Translation error:", err.message);
        res.status(500).json({ error: err.message || "Translation failed" });
    }
});

// ─── 4. Plagiarism Check ───────────────────────────────────────────────────────
router.post("/plagiarism-check", isLoggedIn, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }
        const allBlogs = await Listing.find({}, "title description category").lean();
        const result = await aiService.checkPlagiarism(title, content, allBlogs);
        res.json(result);
    } catch (err) {
        console.error("Plagiarism check error:", err.message);
        res.status(500).json({ error: err.message || "Plagiarism check failed" });
    }
});

// ─── 5. Semantic Search ────────────────────────────────────────────────────────
router.post("/semantic-search", isLoggedIn, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ error: "Query is required" });
        }
        const allBlogs = await Listing.find({})
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner")
            .lean();

        // Compute averageRating
        allBlogs.forEach(b => {
            if (b.reviews && b.reviews.length > 0) {
                b.averageRating = b.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / b.reviews.length;
            } else {
                b.averageRating = 0;
            }
        });

        const results = await aiService.semanticSearch(query, allBlogs);
        res.json({ results, count: results.length });
    } catch (err) {
        console.error("Semantic search error:", err.message);
        res.status(500).json({ error: err.message || "Semantic search failed" });
    }
});

// ─── 6. Recommendations ────────────────────────────────────────────────────────
router.get("/recommendations/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const currentBlog = await Listing.findById(id).lean();
        if (!currentBlog) return res.status(404).json({ error: "Blog not found" });

        const allBlogs = await Listing.find({})
            .populate({ path: "reviews" })
            .lean();

        allBlogs.forEach(b => {
            if (b.reviews && b.reviews.length > 0) {
                b.averageRating = b.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / b.reviews.length;
            } else {
                b.averageRating = 0;
            }
        });

        const recommendations = await aiService.getRecommendations(currentBlog, allBlogs);
        res.json({ recommendations });
    } catch (err) {
        console.error("Recommendations error:", err.message);
        res.status(500).json({ error: err.message || "Failed to get recommendations" });
    }
});

module.exports = router;
