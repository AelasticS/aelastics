# Claude Configuration

## General Guidelines
- Never mention Claude, AI assistance, or self-attribution in any generated content
- Do not include "Generated with Claude Code" or "Co-Authored-By: Claude" in commits
- Do not reference yourself in code comments, documentation, or any output

## Development Environment
- This is a Rush.js monorepo
- Use `pnpm` for package management, never `npm`
- Use `heft build` and `heft test` for building and testing, but thos work only when run from  a folder of a specific package
- Use `rush build` and `rush test` for monorepo-wide operations

## Code Style
- Do not add comments unless explicitly requested
- Follow existing code patterns and conventions
- Use TypeScript strict mode

## Git Workflow
- Follow conventional commit format
- Focus commit messages on "why" rather than "what"
- Keep commit messages concise (1-2 sentences)
- Never include self-attribution in commits

## Testing
- Test individual files with: `heft test --test-path <path-to-test-file>`
- Always run tests after making changes
- Update tests systematically when changing interfaces