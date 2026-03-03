"""
Response Schema — Module 1
==========================
Wraps Module 2 market analysis output alongside
the processed input configuration.
"""

from __future__ import annotations
from typing import Any, Dict, Optional
from pydantic import BaseModel


class ProcessedConfig(BaseModel):
    """Normalized config derived from user input (Module 1 output)."""
    niche:             str
    budget:            float
    risk_level:        str
    risk_multiplier:   float
    target_margin:     float
    country_fee:       float
    country:           str
    platform:          str
    currency_symbol:   str
    experience:        str
    effective_budget:  float   # budget * risk_multiplier


class AnalyzeResponse(BaseModel):
    """Final unified response returned to the caller."""
    status:          str                      # "success" | "partial" | "error"
    input_config:    ProcessedConfig
    market_analysis: Dict[str, Any]           # Full Module 2 output
    message:         Optional[str] = None     # Error / warning message if any
