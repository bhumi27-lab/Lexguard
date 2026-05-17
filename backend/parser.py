import re
import pdfplumber
from typing import BinaryIO

# Keyword-to-clause-type mapping
RISKY_KEYWORDS: dict[str, str] = {
    "non-compete": "non_compete",
    "non compete": "non_compete",
    "noncompete": "non_compete",
    "intellectual property": "intellectual_property",
    "ip ownership": "intellectual_property",
    "work made for hire": "intellectual_property",
    "arbitration": "arbitration",
    "binding arbitration": "arbitration",
    "auto-renewal": "auto_renewal",
    "automatically renew": "auto_renewal",
    "autorenewal": "auto_renewal",
    "termination": "termination",
    "terminate this agreement": "termination",
    "right to terminate": "termination",
    "liability": "liability",
    "limitation of liability": "liability",
    "indemnif": "liability",
    "data collection": "data_collection",
    "personal data": "data_collection",
    "collect and process": "data_collection",
    "privacy policy": "data_collection",
}


def extract_text_from_pdf(file: BinaryIO) -> str:
    """Extract all text from a PDF file-like object."""
    full_text_parts: list[str] = []

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text_parts.append(page_text.strip())

    return "\n\n".join(full_text_parts)


def split_into_clauses(text: str) -> list[str]:
    """
    Split raw contract text into individual clause chunks.

    Strategy:
    1. Split on double newlines (paragraph breaks).
    2. Further split chunks that are excessively long (> 1200 chars)
       by sentence boundaries so no single chunk overwhelms the LLM.
    3. Filter out chunks that are too short to be meaningful (< 40 chars).
    """
    raw_chunks = re.split(r"\n{2,}", text)

    clauses: list[str] = []
    for chunk in raw_chunks:
        chunk = chunk.strip()
        if len(chunk) < 40:
            continue
        if len(chunk) > 1200:
            # Split long paragraphs on sentence endings
            sentences = re.split(r"(?<=[.!?])\s+", chunk)
            buffer = ""
            for sentence in sentences:
                if len(buffer) + len(sentence) > 1200 and buffer:
                    clauses.append(buffer.strip())
                    buffer = sentence
                else:
                    buffer = f"{buffer} {sentence}".strip()
            if buffer:
                clauses.append(buffer)
        else:
            clauses.append(chunk)

    return clauses


def detect_clause_type(text: str) -> str | None:
    """
    Return the clause type if the text contains a recognised risky keyword,
    otherwise return None.
    """
    lowered = text.lower()
    for keyword, clause_type in RISKY_KEYWORDS.items():
        if keyword in lowered:
            return clause_type
    return None


def extract_risky_clauses(file: BinaryIO) -> list[dict]:
    """
    Full pipeline:
      1. Extract text from PDF.
      2. Split into clause chunks.
      3. Filter to chunks that contain at least one risky keyword.
      4. Return a list of { text, type } dicts.
    """
    raw_text = extract_text_from_pdf(file)
    all_clauses = split_into_clauses(raw_text)

    risky: list[dict] = []
    seen_types: set[str] = set()

    for clause_text in all_clauses:
        clause_type = detect_clause_type(clause_text)
        if clause_type is None:
            continue

        # Deduplicate: keep the first (most prominent) occurrence of each type
        # but still allow multiple clauses of the same type if they are distinct
        risky.append({"text": clause_text, "type": clause_type})

    return risky
