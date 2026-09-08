"""
Core configuration and clinical domain constants for CardioSense.
"""

# Clinical training cohort domain bounds derived from the cleaned 68,036-sample dataset:
# Empirical distribution bounds: min = 29.6 years, max = 65.0 years (Q1=48.4, Q2=54.0, Q3=58.4).
# 
# DESIGN RATIONALE FOR AGE_MIN_TRAINED = 30.0:
# While raw patient records technically begin at 29.6 years (only ~0.04% of the cohort lies between
# 29.6 and 30.0), integer-aligning the threshold to 30.0 is an intentional, conservative clinical decision
# to prevent boundary artifacts and align with adult cardiovascular risk screening guidelines (30–65).
# Do not revert this to 29.6 without reviewing clinical screening governance.
AGE_MIN_TRAINED: float = 30.0
AGE_MAX_TRAINED: float = 65.0

def get_age_extrapolation_note(age: float) -> str:
    """
    Returns a directional clinical extrapolation note when patient age
    falls outside the primary model training cohort.
    Uses precise fractional notation (e.g. '29.9') when age has non-zero decimal part
    to prevent rounding contradiction at boundary values.
    """
    age_str = f"{age:.1f}" if age % 1 != 0 else f"{int(age)}"
    if age < AGE_MIN_TRAINED:
        return (
            f"Patient age ({age_str} years) is below the validated clinical training cohort "
            f"({int(AGE_MIN_TRAINED)}–{int(AGE_MAX_TRAINED)} years). Prediction represents "
            f"an out-of-distribution extrapolation and should be evaluated with added clinical discretion."
        )
    elif age > AGE_MAX_TRAINED:
        return (
            f"Patient age ({age_str} years) exceeds the validated clinical training cohort "
            f"({int(AGE_MIN_TRAINED)}–{int(AGE_MAX_TRAINED)} years). Prediction represents "
            f"an out-of-distribution extrapolation and should be evaluated with added clinical discretion."
        )
    return ""
