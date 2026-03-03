"""
Input Schema — Module 1
=======================
Strict Pydantic validation for the /analyze endpoint.
"""

from __future__ import annotations
from enum import Enum
from pydantic import BaseModel, Field, validator


# ─────────────────────────────────────────────
#  Enums
# ─────────────────────────────────────────────
class RiskLevel(str, Enum):
    conservative = "conservative"
    moderate     = "moderate"
    aggressive   = "aggressive"


class Country(str, Enum):
    India = "India"
    USA   = "USA"
    UK    = "UK"


class Experience(str, Enum):
    beginner     = "beginner"
    intermediate = "intermediate"
    advanced     = "advanced"


# ─────────────────────────────────────────────
#  Request schema
# ─────────────────────────────────────────────
class InputSchema(BaseModel):
    niche:       str        = Field(..., min_length=1, example="fitness tracker")
    budget:      float      = Field(..., gt=0,          example=50000)
    risk_level:  RiskLevel  = Field(RiskLevel.moderate, example="moderate")
    country:     Country    = Field(Country.India,      example="India")
    experience:  Experience = Field(Experience.beginner, example="beginner")

    @validator("niche")
    def niche_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("niche cannot be blank")
        return v.strip().lower()

    class Config:
        use_enum_values = True
