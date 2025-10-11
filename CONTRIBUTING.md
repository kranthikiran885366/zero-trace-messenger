# Contributing to Zero-Trace Messenger (SecureChat)

Thank you for your interest in contributing! We welcome issues, discussions, documentation, and code contributions.

- By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).
- All contributions are licensed under the project [MIT License](./LICENSE).

## Development Setup
- Requirements: Node.js 18+ and npm
- Install dependencies: `npm install`
- Run frontend dev server: `npm run dev`
- Run API and frontend together: `npm run dev-with-api`
- Type-check: `npm run type-check`
- Lint: `npm run lint`
- Tests: `npm test`

## Project Structure
- Frontend (React + Vite + TypeScript): `./src`
- Server (Express/Mongo-ready scaffolding): `./server`
- Public assets: `./public`

## Branching and Pull Requests
1. Create a feature branch: `feat/<short-description>` or `fix/<short-description>`
2. Make focused commits with clear messages using [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat(chat): add message reactions`)
3. Ensure linting, type checks, and tests pass
4. Open a Pull Request to the default branch and fill in the PR template with context and screenshots if UI changes
5. Be responsive to review feedback; keep PRs small and focused

## Coding Guidelines
- TypeScript strict mode; no implicit anys
- Follow existing patterns, hooks, and component abstractions
- Prefer accessibility and keyboard navigation; meet WCAG 2.1 AA where practical
- Never commit secrets; use environment variables and `.env` (not committed)
- Avoid noisy console logs in production paths; use proper error handling

## Testing
- Unit tests with Vitest where appropriate
- Add tests for critical logic (encryption utils, reducers, hooks)
- Run `npm run test:coverage` for coverage info

## Commit Message Examples
- `feat(room): allow invite link sharing`
- `fix(ui): prevent layout shift on navbar`
- `refactor(encryption): isolate key derivation util`
- `docs(readme): add screenshots and demo link`

## Security
- Report vulnerabilities privately via GitHub Security Advisories:
  https://github.com/kranthikiran885366/zero-trace-messenger/security/advisories/new
- Do not open public issues for security problems

## Release & Changelog
- Use semver for user-facing changes
- Summarize notable changes in PR descriptions; maintainers will compile releases

## Community
- Start discussions in Issues or Discussions (if enabled)
- Be kind and respectful. See [Code of Conduct](./CODE_OF_CONDUCT.md).
