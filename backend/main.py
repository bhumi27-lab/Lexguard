"""
LexGuard – AI Contract Courtroom & Future Consequence Simulator
FastAPI entry-point
"""

import io
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Load .env if present (dev convenience; production should set vars directly)
load_dotenv()

# Import backend modules *after* load_dotenv so GEMINI_API_KEY is available
from agents import analyse_clause  # noqa: E402
from parser import extract_risky_clauses  # noqa: E402

# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

MAX_CLAUSES = 5  # Process at most this many risky clauses per request


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Nothing to set up / tear down for now; placeholder for future DB pools etc.
    yield


app = FastAPI(
    title="LexGuard API",
    description=(
        "AI-powered contract analysis: upload a PDF and receive a full "
        "courtroom-style breakdown of risky clauses with future consequence timelines."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS – allow all origins during development; restrict in production
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def _overall_risk(clauses: list[dict]) -> str:
    """
    Derive an overall contract risk level from the individual clause risks.
    Rule: any HIGH → HIGH; any MEDIUM (no HIGH) → MEDIUM; else LOW.
    """
    levels = {c.get("risk_level", "LOW") for c in clauses}
    if "HIGH" in levels:
        return "HIGH"
    if "MEDIUM" in levels:
        return "MEDIUM"
    return "LOW"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "LexGuard API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


@app.post("/analyze", tags=["Analysis"])
async def analyze(file: UploadFile = File(...)):
    """
    Accept a PDF contract, run the full LexGuard AI pipeline, and return
    a structured JSON analysis of up to 5 risky clauses.

    Response shape:
    ```json
    {
      "clauses": [ ...analysed clause objects... ],
      "overall_risk": "HIGH | MEDIUM | LOW",
      "total_clauses_found": 12
    }
    ```
    """
    # ------------------------------------------------------------------
    # Validate upload
    # ------------------------------------------------------------------
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    filename_lower = file.filename.lower()
    if not filename_lower.endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail="Only PDF files are supported. Please upload a .pdf document.",
        )

    # ------------------------------------------------------------------
    # Read file bytes into memory (safe for typical contract sizes)
    # ------------------------------------------------------------------
    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to read uploaded file: {exc}"
        ) from exc

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    pdf_stream = io.BytesIO(contents)

    # ------------------------------------------------------------------
    # Parse PDF → extract risky clauses
    # ------------------------------------------------------------------
    try:
        risky_clauses = extract_risky_clauses(pdf_stream)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse PDF: {exc}",
        ) from exc

    total_found = len(risky_clauses)

    if total_found == 0:
        return {
            "clauses": [],
            "overall_risk": "LOW",
            "total_clauses_found": 0,
        }

    # ------------------------------------------------------------------
    # Cap to MAX_CLAUSES for speed; prioritise by order of appearance
    # (the parser already returns them in document order)
    # ------------------------------------------------------------------
    clauses_to_analyse = risky_clauses[:MAX_CLAUSES]

    # ------------------------------------------------------------------
    # Run the three-agent AI pipeline on each selected clause
    # ------------------------------------------------------------------
    analysed: list[dict] = []
    for idx, clause in enumerate(clauses_to_analyse, start=1):
        clause_id = f"clause_{idx:03d}"
        try:
            result = analyse_clause(
                clause_id=clause_id,
                clause_text=clause["text"],
                clause_type=clause["type"],
            )
            analysed.append(result)
        except Exception as exc:
            # Do not abort the entire request if one clause fails;
            # include a degraded stub instead.
            analysed.append(
                {
                    "clause_id": clause_id,
                    "text": clause["text"],
                    "type": clause["type"],
                    "risk_level": "MEDIUM",
                    "defender": {"argument": f"Analysis failed: {exc}"},
                    "prosecutor": {"argument": "Analysis failed."},
                    "judge": {
                        "verdict": "NEGOTIATE",
                        "reasoning": "Analysis unavailable – consult a legal professional.",
                        "negotiation_tip": "Seek independent legal advice before signing.",
                    },
                    "timeline": {
                        "events": [
                            {"month": 0, "event": "Clause takes effect upon signing."},
                            {"month": 3, "event": "Ongoing obligations apply."},
                            {"month": 6, "event": "Review compliance status."},
                            {"month": 12, "event": "Annual review triggered."},
                            {"month": 24, "event": "Long-term impact becomes clear."},
                        ],
                        "scenario_best": "No enforcement action taken.",
                        "scenario_realistic": "Limited enforcement with manageable impact.",
                        "scenario_worst": "Full enforcement causes significant liability.",
                    },
                }
            )

    return {
        "clauses": analysed,
        "overall_risk": _overall_risk(analysed),
        "total_clauses_found": total_found,
    }


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
