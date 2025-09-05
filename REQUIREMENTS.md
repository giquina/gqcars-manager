# Product Requirements (Armora Subset)

## Scope
Initial build includes:
1. Scheduled Rides (MVP)
2. Emergency Contacts (MVP)
3. Corporate Billing (Account metadata only)

## Non-Functional
- Keep each AI prompt < 1 KB.
- In-memory data first; persistence later.
- Small, incremental commits.

## Iteration Rule
Implement exactly one feature section per prompt, referencing only its feature file.