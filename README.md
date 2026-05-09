# TraceReview

> Lightweight code review reporting directly inside VS Code.

TraceReview helps developers and reviewers create structured review findings, organize them visually, and generate professional review reports automatically.

---

# Features

## Add Review Findings Directly From Editor

Right click anywhere in your code and add:

- BUG
- REVIEW
- SECURITY
- PERFORMANCE
- REFACTOR
- IMPROVE
- ACCESSIBILITY
- and more

with severity levels:

- Critical
- High
- Medium
- Low
- Info

TraceReview automatically inserts formatted review comments into your code.

---

## Sidebar Review Explorer

Visual sidebar for navigating findings:

- Severity grouping
- File grouping
- Icons and colors
- Click-to-navigate support

Example:

```text
High (2)
 ├── src/auth.ts
 │    ├── BUG: Login crashes
 │
 ├── src/navbar.tsx
 │    ├── REVIEW: Navbar spacing issue
```

---

## Automatic Report Generation

TraceReview automatically generates:

```text
REVIEW_REPORT.md
```

every time review findings are updated.

No manual syncing required.

---

## Powerful Filtering

Filter findings by:

- Severity
- Type
- Search keyword

Perfect for large projects and audits.

---

# Supported Finding Types

```text
BUG
REVIEW
IMPROVE
REFACTOR
OPTIMIZE
RISK
TODO
FIXME
SECURITY
UI
PERFORMANCE
ACCESSIBILITY
```

---

# Example Review Comments

## TypeScript / JavaScript

```ts
// BUG[High]: Login crashes if token is missing

// REVIEW[Medium]: Navbar spacing breaks on tablet

// SECURITY[Critical]: JWT token exposed in local storage
```

## React / TSX

```tsx
{
  /* BUG[High]: Submit button breaks on mobile */
}
```

---

# Commands

| Command                         | Description                     |
| ------------------------------- | ------------------------------- |
| TraceReview: Generate Report    | Generate review report manually |
| TraceReview: Add Review Finding | Add review finding from editor  |
| TraceReview: Filter by Severity | Filter findings by severity     |
| TraceReview: Filter by Type     | Filter findings by type         |
| TraceReview: Search Findings    | Search findings                 |
| TraceReview: Clear Filters      | Reset all filters               |

---

# Workflow

```text
Right Click
→ Add Review Finding
→ Save File
→ Sidebar Updates
→ Report Updates Automatically
```

---

# Why TraceReview?

Most tools are either:

- TODO trackers
- PR review tools
- enterprise audit systems

TraceReview focuses on:

✅ lightweight review workflows  
✅ structured engineering findings  
✅ developer-first UX  
✅ in-editor review reporting

---

# Roadmap

- PDF export
- AI-generated executive summaries
- Inline gutter decorations
- GitHub PR integration
- Team collaboration support
- Custom review templates

---

# Installation

Install directly from the VS Code Marketplace.

---

# Feedback & Contributions

Issues, suggestions, and contributions are welcome.

GitHub Repository:
https://github.com/YOUR_USERNAME/tracereview

---

# License

MIT
