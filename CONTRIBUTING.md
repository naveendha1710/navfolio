# Contributing to Navfolio

Thank you for your interest in contributing to Navfolio! We welcome bug fixes, performance improvements, documentation enhancements, and accessibility refinements.

Please review the guidelines below before submitting a Pull Request.

---

## Contribution Workflow

1. **Fork the Repository**:
   Click the "Fork" button on GitHub and clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/navfolio.git
   cd navfolio
   ```

2. **Create a Feature Branch**:
   Create a descriptive branch for your changes:
   ```bash
   git checkout -b fix/animation-stutter
   # or
   git checkout -b feat/add-accessibility-tags
   ```
   **Branch Naming Conventions**:
   - `fix/<short-description>` for bug fixes
   - `perf/<short-description>` for performance optimizations
   - `docs/<short-description>` for documentation updates
   - `refactor/<short-description>` for code refactoring

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Make Your Changes**:
   - Follow existing TypeScript and React conventions.
   - Separate concerns cleanly.
   - Do **NOT** commit secrets, API keys, passwords, or personal credentials.
   - Do **NOT** add unnecessary external dependencies without discussion.
   - Preserve existing UI animations and design language.

5. **Verify the Production Build**:
   Always run the full build to check TypeScript types and bundling:
   ```bash
   npm run build
   ```
   PRs that fail `npm run build` cannot be merged.

6. **Commit and Push**:
   ```bash
   git add .
   git commit -m "fix(cursor): prevent memory leak on unmount"
   git push origin <your-branch-name>
   ```

7. **Open a Pull Request**:
   - Open a PR against the `main` branch.
   - Provide a clear title and description explaining the problem and solution.
   - Include before/after screenshots or recordings for any visual changes.

---

## Security & Secrets Policy

- **Never** commit `.env`, `.dev.env`, `.dev.vars`, or any file containing live API keys, tokens, or private spreadsheets.
- If you discover a security vulnerability or leaked secret, please report it privately to the repository owner rather than opening a public issue.

---

## Code Style & Best Practices

- **Strict TypeScript**: Ensure all components and helpers have accurate types.
- **Tailwind CSS v4**: Use utility classes consistently with the existing dark aesthetic (`#05070a` canvas background, `#b15382` magenta accent).
- **Performance**: Animations should be GPU-accelerated (using `transform` and `opacity`). Avoid layout-thrashing DOM queries in render loops.

---

Thank you for contributing!
