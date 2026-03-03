"""
Input Processor — Module 1
==========================
Normalizes and enriches raw user input into a structured
configuration dict that Module 2 can consume.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from InputConfig.utils.config_maps import (
    COUNTRY_CURRENCY,
    COUNTRY_FEES,
    COUNTRY_PLATFORM,
    EXPERIENCE_HINT,
    MARGIN_TARGET,
    RISK_MULTIPLIER,
)

log = logging.getLogger(__name__)


def process_user_input(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Accepts raw validated input dict and returns a structured
    processing config ready for the pipeline.

    Args:
        input_data: dict with keys:
            niche, budget, risk_level, country, experience

    Returns:
        Enriched config dict with derived fields attached.
    """
    niche      = input_data["niche"].strip().lower()
    budget     = float(input_data["budget"])
    risk_level = input_data["risk_level"]
    country    = input_data["country"]
    experience = input_data["experience"]

    risk_multiplier  = RISK_MULTIPLIER.get(risk_level, 1.0)
    target_margin    = MARGIN_TARGET.get(risk_level, 0.25)
    country_fee      = COUNTRY_FEES.get(country, 0.15)
    platform         = COUNTRY_PLATFORM.get(country, "Amazon")
    currency_symbol  = COUNTRY_CURRENCY.get(country, "₹")
    effective_budget = round(budget * risk_multiplier, 2)
    experience_hint  = EXPERIENCE_HINT.get(experience, "")

    config: Dict[str, Any] = {
        # Core fields passed to Module 2
        "niche":            niche,
        "budget":           budget,
        "country":          country,
        "platform":         platform,

        # Derived config
        "risk_level":       risk_level,
        "risk_multiplier":  risk_multiplier,
        "target_margin":    target_margin,
        "country_fee":      country_fee,
        "currency_symbol":  currency_symbol,
        "experience":       experience,
        "experience_hint":  experience_hint,
        "effective_budget": effective_budget,
    }

    log.info(
        "Input processed | niche='%s' country='%s' risk='%s' "
        "budget=%.0f → effective=%.0f",
        niche, country, risk_level, budget, effective_budget,
    )
    return config
