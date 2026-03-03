"""
Module 2 Service Wrapper — Module 1
====================================
Calls Module 2's Python functions directly (no HTTP round-trip).

Module 2 path is on sys.path (added in main.py), so all imports
from services.* resolve to AiMarketResearch/services/*.

This wrapper:
  - Accepts the processed config from input_processor
  - Calls Module 2 pipeline functions in order
  - Returns a unified dict result
  - Falls back to a mock response if Module 2 raises
"""

from __future__ import annotations

import logging
from typing import Any, Dict

log = logging.getLogger(__name__)

# ── Module 2 imports (AiMarketResearch/services/ is on sys.path) ──────────────
try:
    from services.data_collection  import collect_signals
    from services.llm_engine       import get_llm_strategy
    from services.profit_simulation import simulate_profit
    from services.scoring_engine   import score_product
    from services.supplier_pricing import get_supplier_cost
    _M2_AVAILABLE = True
except ImportError as _err:
    log.warning("Module 2 imports failed — mock fallback will be used. %s", _err)
    _M2_AVAILABLE = False


def run_market_analysis(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the full Module 2 analysis pipeline using processed config.

    Args:
        config: output of input_processor.process_user_input()

    Returns:
        Module 2 result dict, or mock fallback on failure.
    """
    if not _M2_AVAILABLE:
        log.warning("Module 2 unavailable — returning mock fallback.")
        return _mock_fallback(config, reason="Module 2 import error")

    product          = config["niche"]
    country          = config["country"]
    platform         = config["platform"]
    budget           = config["effective_budget"]

    try:
        # ── Step 1: Collect market signals ──────────────────────────────────
        log.info("M2 → collect_signals('%s', '%s')", product, country)
        signals = collect_signals(product, country)

        # ── Step 2: Score the product ────────────────────────────────────────
        scores = score_product(signals)

        avg_market_price = signals.avg_price
        suggested_price  = round(avg_market_price * scores.price_factor, 2)

        # ── Step 3: Supplier cost ────────────────────────────────────────────
        try:
            sc               = get_supplier_cost(product, country, retail_price=avg_market_price)
            cost_per_unit    = sc["landed_cost_local"]
            supplier_source  = sc["source"]
            fob_usd          = sc["fob_price_usd"]
        except Exception as exc:
            log.warning("Supplier cost failed (%s) — using margin fallback", exc)
            cost_per_unit   = round(suggested_price * (1 - scores.margin_pct / 100), 2)
            supplier_source = "margin_fallback"
            fob_usd         = 0.0

        # ── Step 4: Profit simulation ─────────────────────────────────────────
        sim = simulate_profit(
            demand_score  = scores.demand_score,
            price         = suggested_price,
            cost_per_unit = cost_per_unit,
            budget        = budget,
            bsr           = signals.bsr,
        )

        # ── Step 5: LLM strategy ──────────────────────────────────────────────
        strategy = get_llm_strategy(
            product                 = product,
            country                 = country,
            platform                = platform,
            demand_score            = scores.demand_score,
            competition_score       = scores.competition_score,
            viability_score         = scores.viability_score,
            risk_level              = scores.risk_level,
            viability_label         = scores.viability_label,
            margin_pct              = scores.margin_pct,
            avg_market_price        = avg_market_price,
            suggested_price         = suggested_price,
            estimated_monthly_profit= sim.estimated_monthly_profit,
            roi_percent             = sim.roi_percent,
            break_even_months       = sim.break_even_months,
            budget                  = budget,
            confidence_score        = scores.confidence_score,
        )

        # ── Assemble result ───────────────────────────────────────────────────
        return {
            "demand_score":             scores.demand_score,
            "competition_score":        scores.competition_score,
            "viability_score":          scores.viability_score,
            "confidence_score":         scores.confidence_score,
            "risk_level":               scores.risk_level,
            "viability_label":          scores.viability_label,
            "avg_market_price":         avg_market_price,
            "suggested_price":          suggested_price,
            "profit_margin":            scores.margin_pct,
            "estimated_monthly_sales":  sim.estimated_monthly_sales,
            "estimated_monthly_profit": sim.estimated_monthly_profit,
            "roi_percent":              sim.roi_percent,
            "break_even_months":        sim.break_even_months,
            "sales_basis":              sim.sales_basis,
            "profit_scenarios":         [s.__dict__ if hasattr(s, "__dict__") else s for s in sim.scenarios],
            "risk_explanation":         strategy.risk_explanation,
            "positioning_strategy":     strategy.positioning_strategy,
            "final_recommendation":     strategy.final_recommendation,
            "market_entry_advice":      strategy.market_entry_advice,
            "supplier_cost_local":      cost_per_unit,
            "supplier_cost_source":     supplier_source,
            "fob_price_usd":            fob_usd,
            "raw_signals": {
                "trend_avg":             signals.trend_avg,
                "trend_growth":          signals.trend_growth,
                "seasonality_variance":  signals.seasonality_variance,
                "avg_reviews":           signals.avg_reviews,
                "seller_count":          signals.seller_count,
                "avg_price":             signals.avg_price,
                "review_velocity":       signals.review_velocity,
                "bsr":                   signals.bsr,
                "cpc_score":             signals.cpc_score,
                "monthly_search_volume": signals.monthly_search_volume,
                "keyword_competition":   signals.keyword_competition,
                "data_confidence":       signals.data_confidence,
            },
            "source": "module2_live",
        }

    except Exception as exc:
        log.error("Module 2 pipeline error: %s", exc, exc_info=True)
        return _mock_fallback(config, reason=str(exc))


# ─────────────────────────────────────────────
#  Mock fallback
# ─────────────────────────────────────────────
def _mock_fallback(config: Dict[str, Any], reason: str = "") -> Dict[str, Any]:
    """Return a safe mock response so the demo never crashes."""
    log.warning("Returning mock fallback. Reason: %s", reason)
    return {
        "demand_score":             50.0,
        "competition_score":        50.0,
        "viability_score":          0.0,
        "confidence_score":         0.0,
        "risk_level":               "Medium",
        "viability_label":          "Moderate",
        "avg_market_price":         0.0,
        "suggested_price":          0.0,
        "profit_margin":            25.0,
        "estimated_monthly_sales":  0.0,
        "estimated_monthly_profit": 0.0,
        "roi_percent":              0.0,
        "break_even_months":        0.0,
        "sales_basis":              "fallback",
        "profit_scenarios":         [],
        "risk_explanation":         f"Live data unavailable ({reason}). Using mock response.",
        "positioning_strategy":     "Unable to generate — please retry.",
        "final_recommendation":     "Data unavailable. Please retry the analysis.",
        "market_entry_advice":      "Unable to generate — please retry.",
        "supplier_cost_local":      0.0,
        "supplier_cost_source":     "unavailable",
        "fob_price_usd":            0.0,
        "raw_signals":              {},
        "source":                   "mock_fallback",
    }
