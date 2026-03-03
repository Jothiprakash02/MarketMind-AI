"""
Config Maps — Module 1
======================
Static lookup tables that drive dynamic behaviour
across the input processing and pipeline stages.
"""

from __future__ import annotations

# ── Risk level → sales/budget multiplier ─────────────────────────────────────
RISK_MULTIPLIER: dict[str, float] = {
    "conservative": 0.8,
    "moderate":     1.0,
    "aggressive":   1.2,
}

# ── Risk level → target gross margin ─────────────────────────────────────────
MARGIN_TARGET: dict[str, float] = {
    "conservative": 0.30,
    "moderate":     0.25,
    "aggressive":   0.20,
}

# ── Country → platform fee percentage ────────────────────────────────────────
COUNTRY_FEES: dict[str, float] = {
    "India": 0.15,
    "USA":   0.18,
    "UK":    0.17,
}

# ── Country → default e-commerce platform ────────────────────────────────────
COUNTRY_PLATFORM: dict[str, str] = {
    "India": "Amazon.in",
    "USA":   "Amazon.com",
    "UK":    "Amazon.co.uk",
}

# ── Country → local currency symbol ──────────────────────────────────────────
COUNTRY_CURRENCY: dict[str, str] = {
    "India": "₹",
    "USA":   "$",
    "UK":    "£",
}

# ── Experience level → LLM context hint ──────────────────────────────────────
EXPERIENCE_HINT: dict[str, str] = {
    "beginner":     "This seller is a beginner — keep recommendations simple and practical.",
    "intermediate": "This seller has some experience — balanced depth of advice is fine.",
    "advanced":     "This seller is experienced — provide detailed advanced strategies.",
}
