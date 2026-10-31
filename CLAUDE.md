# Lasan Family: rules for anyone (human or agent) working in this repo

Read `docs/HANDOFF.md` for architecture and specs, and `docs/STATUS.md` for what is done and what is next.

## Product guardrails
- Lasan Family provides **only maids and home cooks** for **women at home** in **Andhra Pradesh and Telangana**.
- Do not add childcare, nursing, pregnancy or medical services, new categories or new states without the owner's approval.
- Never invent marketing numbers (families served, ratings, helper counts). Use factual claims only.
- Premium, calm UI: refined typography, generous spacing, subtle motion. No gimmicks (confetti, WebGL, bouncing).

## Git workflow (mandatory)
- Never commit directly to `main`. Work on a branch (`feat/...`, `fix/...`, `chore/...`; use a `claude/` prefix if the remote rejects other names).
- Write clear conventional commit messages (`feat(admin): ...`) with a body explaining what and why.
- Open a pull request into `main` with a summary and test plan, then **squash-merge** it so the commit on `main` is signed by GitHub and shows **Verified**.
- **Never** add `Co-Authored-By` trailers, "Generated with Claude Code" lines or any AI attribution to commits or PRs.
- Never commit secrets. `.env` files are git-ignored; only `.env.example` is committed.

## Quality bar before merging
- `npx tsc --noEmit` passes in every workspace you touched.
- Next.js apps: `npx next build` succeeds.
- Expo app: `npx expo export --platform android` succeeds (bundles without errors).
- Update `docs/STATUS.md` in the same PR.
