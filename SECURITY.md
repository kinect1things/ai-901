# Security Policy

## Scope

This is a fully static, client-side study site. It has **no backend, no
accounts, and no server-side data**. All state (quiz history, theme) is kept in
the visitor's browser via `localStorage` and never leaves their device.

## Supported versions

The latest deployed version on the `main` branch is the only supported version.

## Reporting a vulnerability

If you discover a security issue (for example an XSS vector in the rendered
question content, or a vulnerable dependency that automated tooling missed),
please report it privately:

1. Open a **GitHub Security Advisory** via the repository's
   **Security → Report a vulnerability** tab (preferred), or
2. Open a regular issue for low-risk, non-sensitive reports.

Please include reproduction steps and the affected version/commit. We aim to
acknowledge reports within 7 days.

## Automated safeguards

This repository runs several automated security controls:

- **CodeQL** static analysis on every push and pull request to `main`.
- **Dependency Review** on pull requests, blocking high-severity vulnerable
  dependencies from being introduced.
- **Dependabot** alerts and automated security/version update pull requests.
- A protected `main` branch that requires all status checks to pass before any
  change can merge.
