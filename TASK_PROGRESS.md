# Resume Extraction Pipeline - Enterprise Redesign

## Root Causes Identified

1. **PDF parser** (`pdf-parse`) drops text, lowercases & deduplicates → data loss
2. **`normalizePdfText()`** lowercases EVERYTHING → AI can't detect proper nouns
3. **`cleanResumeText()`** destroys case, chars, context before AI
4. **Prompt asks for summaries** ("5 years of full-stack") instead of faithful extraction
5. **No `max_tokens`** → LLM truncates mid-section
6. **Temperature 0.7** → too high for factual extraction
7. **gpt-4o-mini** → weaker model for complex extraction
8. **No validation/retry** → empty sections silently accepted
9. **Types missing** fields: summary, linkedin, github, portfolio, location, internships, achievements, publications, languagesKnown
10. **Skills not categorized** → flat array loses structure
11. **Frontend missing** display of many extracted fields
12. **Fallback parser truncates** to 300 chars → data loss

## Implementation Checklist

### Phase 1: Types & Schema
- [ ] Expand `ExtractedResumeData` with all required fields
- [ ] Add categorized skills structure
- [ ] Add personalInfo sub-object

### Phase 2: PDF Parser
- [ ] Replace pdf-parse with pdf.js (more reliable)
- [ ] Add OCR fallback with Tesseract.js
- [ ] Add multi-column text detection & merge
- [ ] Preserve case & formatting
- [ ] Add detailed PDF parsing logs

### Phase 3: AI Extraction Service
- [ ] New enterprise prompt: NEVER summarize, faithfully extract
- [ ] Structured JSON output with exact schema
- [ ] max_tokens: 16384
- [ ] temperature: 0.1
- [ ] Use gpt-4o (not mini) for extraction
- [ ] Validation: check all sections, retry if empty
- [ ] Anti-hallucination: null/[] for missing data
- [ ] Retry loop with backoff (up to 3 retries)
- [ ] Compare extracted JSON vs raw PDF, report missing sections
- [ ] Detailed logging at every step

### Phase 4: API Routes
- [ ] Update upload route with new parser
- [ ] Update analyze route with validation
- [ ] Add extraction comparison endpoint

### Phase 5: Frontend
- [ ] Update Resume Analyzer page to display ALL new fields
- [ ] Add personalInfo (linkedin, github, portfolio, location)
- [ ] Add categorized skills display
- [ ] Add internships, achievements, publications, languagesKnown
- [ ] Add summary/objective display

### Phase 6: Testing
- [ ] Create ATS resume test
- [ ] Create two-column resume test
- [ ] Create modern resume test
- [ ] Run extraction, measure accuracy >95%
- [ ] Iterate until passing

### Phase 7: Cleanup
- [ ] Remove old fallback parser (replace with new)
- [ ] Remove aggressive text cleaning functions
- [ ] Remove mock data generators