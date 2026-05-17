import json
import os
import re
import textwrap
from typing import Any

import google.generativeai as genai

# ---------------------------------------------------------------------------
# Client initialisation
# ---------------------------------------------------------------------------

_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not _API_KEY:
    raise EnvironmentError(
        "GEMINI_API_KEY environment variable is not set. "
        "Export it before starting the server."
    )

genai.configure(api_key=_API_KEY)
_MODEL = genai.GenerativeModel("gemini-1.5-flash")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*([\s\S]*?)```", re.IGNORECASE)


def _call_gemini(prompt: str) -> str:
    """Send a prompt to Gemini and return the raw text response."""
    response = _MODEL.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=1024,
        ),
    )
    return response.text.strip()


def _safe_parse_json(raw: str, fallback: dict) -> dict:
    """
    Attempt to parse JSON from a Gemini response.

    Gemini sometimes wraps the JSON in ```json ... ``` fences; strip those
    first. If parsing still fails, return the provided fallback dict.
    """
    # Try to extract content from a code fence
    fence_match = _JSON_FENCE_RE.search(raw)
    candidate = fence_match.group(1).strip() if fence_match else raw.strip()

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        # Second attempt: find the first { ... } block
        brace_match = re.search(r"\{[\s\S]*\}", candidate)
        if brace_match:
            try:
                return json.loads(brace_match.group(0))
            except json.JSONDecodeError:
                pass

    return fallback


# ---------------------------------------------------------------------------
# Agent 1 – Defender
# ---------------------------------------------------------------------------

_DEFENDER_PROMPT = textwrap.dedent(
    """
    You are a legal advocate defending the rights of an individual who has been
    presented with a contract containing the following clause:

    ---
    {clause_text}
    ---

    Analyse how this clause could harm the individual signing the contract.
    Focus on practical, real-world consequences.

    Respond with ONLY valid JSON in this exact structure (no extra text):
    {{
      "argument": "Your detailed argument explaining how this clause harms the individual."
    }}
    """
)


def run_defender(clause_text: str) -> dict:
    prompt = _DEFENDER_PROMPT.format(clause_text=clause_text)
    raw = _call_gemini(prompt)
    return _safe_parse_json(raw, {"argument": "Unable to generate defender argument."})


# ---------------------------------------------------------------------------
# Agent 2 – Prosecutor
# ---------------------------------------------------------------------------

_PROSECUTOR_PROMPT = textwrap.dedent(
    """
    You are a corporate attorney representing the company that drafted the
    following contract clause:

    ---
    {clause_text}
    ---

    Explain the legitimate business reasons why the company included this clause
    and why it benefits the company. Be factual and objective.

    Respond with ONLY valid JSON in this exact structure (no extra text):
    {{
      "argument": "Your detailed argument explaining why the company included this clause."
    }}
    """
)


def run_prosecutor(clause_text: str) -> dict:
    prompt = _PROSECUTOR_PROMPT.format(clause_text=clause_text)
    raw = _call_gemini(prompt)
    return _safe_parse_json(
        raw, {"argument": "Unable to generate prosecutor argument."}
    )


# ---------------------------------------------------------------------------
# Agent 3 – Judge
# ---------------------------------------------------------------------------

_JUDGE_PROMPT = textwrap.dedent(
    """
    You are an impartial judge evaluating a contract clause dispute.

    Clause under review:
    ---
    {clause_text}
    ---

    Defender's position: {defender_argument}
    Prosecutor's position: {prosecutor_argument}

    Provide a neutral, balanced verdict. Assess the overall risk level to the
    individual signing the contract and give a concrete negotiation tip.

    Respond with ONLY valid JSON in this exact structure (no extra text):
    {{
      "verdict": "REJECT | ACCEPT | NEGOTIATE",
      "reasoning": "Your detailed neutral reasoning.",
      "negotiation_tip": "A specific, actionable negotiation tip for the individual."
    }}

    Choose REJECT if the clause is highly one-sided and cannot be accepted.
    Choose ACCEPT if the clause is reasonable and standard.
    Choose NEGOTIATE if modifications can make it acceptable.
    """
)

_RISK_VERDICT_MAP = {
    "REJECT": "HIGH",
    "NEGOTIATE": "MEDIUM",
    "ACCEPT": "LOW",
}


def run_judge(clause_text: str, defender: dict, prosecutor: dict) -> dict:
    prompt = _JUDGE_PROMPT.format(
        clause_text=clause_text,
        defender_argument=defender.get("argument", ""),
        prosecutor_argument=prosecutor.get("argument", ""),
    )
    raw = _call_gemini(prompt)
    fallback = {
        "verdict": "NEGOTIATE",
        "reasoning": "Unable to generate judge reasoning.",
        "negotiation_tip": "Consult a legal professional before signing.",
    }
    return _safe_parse_json(raw, fallback)


# ---------------------------------------------------------------------------
# Timeline generator
# ---------------------------------------------------------------------------

_TIMELINE_PROMPT = textwrap.dedent(
    """
    You are a legal futurist and contract risk analyst.

    A person has signed (or is considering signing) a contract containing this
    clause:
    ---
    {clause_text}
    ---

    Clause type: {clause_type}
    Risk level: {risk_level}

    Generate a month-by-month timeline of future consequences for the
    individual, covering months 0, 3, 6, 12, and 24. Also provide three
    scenario summaries (best-case, realistic, worst-case).

    Respond with ONLY valid JSON in this exact structure (no extra text):
    {{
      "events": [
        {{"month": 0,  "event": "What happens immediately upon signing."}},
        {{"month": 3,  "event": "What happens after 3 months."}},
        {{"month": 6,  "event": "What happens after 6 months."}},
        {{"month": 12, "event": "What happens after 12 months."}},
        {{"month": 24, "event": "What happens after 24 months."}}
      ],
      "scenario_best":      "Best-case outcome if the individual manages this clause well.",
      "scenario_realistic": "Most likely outcome based on typical enforcement patterns.",
      "scenario_worst":     "Worst-case outcome if the clause is fully enforced against them."
    }}
    """
)

_DEFAULT_TIMELINE: dict[str, Any] = {
    "events": [
        {"month": 0, "event": "Clause takes effect upon contract signing."},
        {"month": 3, "event": "Initial compliance period."},
        {"month": 6, "event": "Ongoing obligations continue."},
        {"month": 12, "event": "Annual review or renewal may trigger new obligations."},
        {"month": 24, "event": "Long-term consequences become apparent."},
    ],
    "scenario_best": "The clause is never enforced and causes no material impact.",
    "scenario_realistic": "The clause limits some options but is manageable with care.",
    "scenario_worst": "Full enforcement results in significant legal and financial exposure.",
}


def generate_timeline(clause_text: str, clause_type: str, risk_level: str) -> dict:
    prompt = _TIMELINE_PROMPT.format(
        clause_text=clause_text,
        clause_type=clause_type,
        risk_level=risk_level,
    )
    raw = _call_gemini(prompt)
    return _safe_parse_json(raw, _DEFAULT_TIMELINE)


# ---------------------------------------------------------------------------
# Orchestrator – runs all three agents + timeline for a single clause
# ---------------------------------------------------------------------------


def analyse_clause(
    clause_id: str,
    clause_text: str,
    clause_type: str,
) -> dict[str, Any]:
    """
    Run the full three-agent pipeline (Defender → Prosecutor → Judge)
    plus the timeline generator for a single risky clause.

    Returns the canonical LexGuard clause analysis object.
    """
    defender = run_defender(clause_text)
    prosecutor = run_prosecutor(clause_text)
    judge = run_judge(clause_text, defender, prosecutor)

    verdict = judge.get("verdict", "NEGOTIATE").upper()
    risk_level = _RISK_VERDICT_MAP.get(verdict, "MEDIUM")

    timeline = generate_timeline(clause_text, clause_type, risk_level)

    return {
        "clause_id": clause_id,
        "text": clause_text,
        "type": clause_type,
        "risk_level": risk_level,
        "defender": defender,
        "prosecutor": prosecutor,
        "judge": judge,
        "timeline": timeline,
    }
