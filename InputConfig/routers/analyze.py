"""
API Router — /analyze  (Module 1 entry point)
=============================================
Accepts user input → runs the full pipeline → returns unified JSON.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from InputConfig.schemas.input_schema    import InputSchema
from InputConfig.schemas.response_schema import AnalyzeResponse, ProcessedConfig
from InputConfig.services.pipeline      import execute_pipeline

log    = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze a niche for e-commerce viability",
    description=(
        "Module 1 entry point. Accepts seller profile (niche, budget, risk level, "
        "country, experience) → processes input → invokes Module 2 market analysis "
        "→ returns unified JSON decision report."
    ),
    tags=["Module 1 — Input Config"],
)
async def analyze(req: InputSchema) -> AnalyzeResponse:

    log.info(
        "POST /analyze | niche='%s' country='%s' risk='%s' budget=%.0f exp='%s'",
        req.niche, req.country, req.risk_level, req.budget, req.experience,
    )

    try:
        result = execute_pipeline(req.dict())
    except Exception as exc:
        log.error("Pipeline hard failure: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {exc}",
        )

    # Build typed response
    config_obj = ProcessedConfig(**result["input_config"])

    return AnalyzeResponse(
        status          = result["status"],
        input_config    = config_obj,
        market_analysis = result["market_analysis"],
        message         = result.get("message"),
    )
