# generate-commit-message

Use this command when the user wants a **commit message** (and copy-paste `git commit` invocation) from **staged** changes only.

You are helping **generate** that message for this repository: analyze the staged diff, apply the rules below, and output summary + message + exact `git commit` command. You do not create the commit unless the user explicitly asks.

## Mandatory Workflow

1. First inspect repository state:
   - `git status`
   - `git diff --staged`

2. ONLY generate commit messages for **staged changes**.
   - Ignore unstaged changes completely.
   - Assume the user stages changes intentionally using workflows like:
     ```bash
     git diff --staged > m.patch
     ```
   - If nothing is staged:
     - clearly say no staged changes were found
     - do NOT inspect regular `git diff`
     - do NOT generate a commit message

3. Before generating the commit message, ALWAYS run:

   ```bash
   npm run lint && npm run format
   ```

   - Mention if formatting or linting may modify files.
   - If formatting changes files, re-check staged diff before writing commit message.

---

## Diff Analysis Rules

Analyze staged changes carefully:

- identify intent
- identify affected feature/domain
- identify UX/UI/state-management/async changes
- identify reusable component additions
- identify behavioral changes
- identify responsiveness/mobile improvements

Prefer semantic grouping over file-by-file summaries.

---

## Conventional Commit Rules

Always prefer conventional commits:

- `feat`
- `fix`
- `refactor`
- `perf`
- `style`
- `docs`
- `test`
- `build`
- `ci`
- `chore`

Format:

```text
type(scope): concise description
```

Examples:

- `feat(image-upload): improve upload UX and loading behavior`
- `fix(profile): prevent invalid dirty state submission`
- `refactor(avatar): extract reusable avatar component`

---

## Subject Rules

- imperative mood
- concise but descriptive
- no trailing period
- lowercase conventional type
- use meaningful scope when possible
- avoid vague messages

Bad:

- `fix stuff`
- `update files`
- `changes`
- `misc fixes`

Good:

- `feat(dashboard): add empty state navigation for plans`
- `fix(image-upload): prevent duplicate upload submissions`

---

## Body Rules

Add a detailed body when:

- multiple logical changes exist
- async behavior changes
- UX/UI behavior changes
- state handling changes
- responsiveness changes
- reusable components are introduced
- non-trivial fixes occur

Body format:

```text
- bullet
- bullet
- bullet
```

Explain:

- what changed
- why it changed
- behavioral impact

Do NOT:

- repeat filenames
- describe obvious syntax edits
- use vague statements

---

## Output Format

Always output:

1. Summary
2. Commit message
3. Exact git command

Example:

Summary:

- Added upload loading state handling
- Prevented duplicate submissions
- Improved preview cleanup behavior

Commit message:

```text
feat(image-upload): improve upload UX and prevent duplicate submissions

- add loading state handling for uploads
- prevent rapid multiple upload clicks using ref lock
- improve preview rendering and cleanup behavior
- disable interactions while upload is in progress
```

Command:

```bash
git commit -m "feat(image-upload): improve upload UX and prevent duplicate submissions

- add loading state handling for uploads
- prevent rapid multiple upload clicks using ref lock
- improve preview rendering and cleanup behavior
- disable interactions while upload is in progress"
```

---

## Formatting Rules

- output git command exactly
- use double quotes around commit message
- use single quotes only inside message if grammatically needed
- never escape quotes unnecessarily
- never use emojis
- never use markdown tables
- never fabricate changes
- never run git commit automatically

---

## No Changes Case

If no staged changes exist:

- clearly state no staged changes were found
- do not generate commit message
- do not inspect unstaged changes
- suggest staging changes first

Example:

```text
No staged changes found.

Stage files first using:
git add <files>

Then re-run /generate-commit-message.
```
