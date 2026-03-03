"""
Pipeline Orchestrator — Module 1
=================================
Connects Module 1 (input processing) → Module 2 (market analysis)
and returns the unified structured response.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from InputConfig.services.input_processor import process_user_input
from InputConfig.services.module2_service import run_market_analysis

log = logging.getLogger(__name__)


def execute_pipeline(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full end-to-end pipeline:
      1. Process + normalize user input  (Module 1)
      2. Run market analysis wrapper     (Module 2)
      3. Combine and return result

    Args:
        input_data: validated dict from InputSchema

    Returns:
        {
          "status":          "success" | "partial",
          "input_config":    {...},
          "market_analysis": {...},
          "message":         str | None
        }
    """
    log.info(
        "Pipeline start — niche='%s' budget=%.0f risk='%s' country='%s'",
        input_data.get("niche"), input_data.get("budget"),
        input_data.get("risk_level"), input_data.get("country"),
    )

    # ── Stage 1: Input processing ────────────────────────────────────────────
    processed_config = process_user_input(input_data)

    # ── Stage 2: Module 2 market analysis ────────────────────────────────────
    market_output = run_market_analysis(processed_config)

    # ── Stage 3: Determine status ─────────────────────────────────────────────
    is_mock   = market_output.get("source") == "mock_fallback"
    status    = "partial" if is_mock else "success"
    message   = market_output.get("risk_explanation") if is_mock else None

    # Strip internal 'source' key before returning
    market_output.pop("source", None)

    log.info("Pipeline complete — status='%s'", status)

    return {
        "status":          status,
        "input_config":    processed_config,
        "market_analysis": market_output,
        "message":         message,
    }
