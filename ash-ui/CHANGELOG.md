# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-03-04

### Fixed

- **npm-publish workflow** - Corrected GitHub Actions configuration for nested package structure
  - Updated `paths` filter to `ash-ui/package.json` (was looking at root)
  - Added `working-directory: ash-ui` for all npm commands
  - Added `cache-dependency-path: ash-ui/package-lock.json` for proper caching
  - Added dynamic version extraction for GitHub Release tagging

### Changed

- Bumped package version to `0.1.1` for successful npm registry publication

---

## [0.1.0] - 2026-03-03

### Added

- **DateRangePicker** - Fully accessible date range selection component
  - Dual calendar display with keyboard navigation
  - Mobile-responsive modal mode
  - Min/max date constraints + disabledDateStrategy
  - Custom formatting via formatOptions
  - Variants: default, minimal, compact
  - Sizes: sm, md, lg
- **Testing Infrastructure** - Vitest + Testing Library (80%+ coverage)
- **Storybook Documentation** - 6+ interactive stories with a11y annotations
- **CI/CD Pipelines** - GitHub Actions for lint, test, build, deploy, npm publish

### Infrastructure

- TypeScript strict mode configuration
- ESLint + Prettier code quality
- Netlify staging + production deployments
- Automated npm publish workflow
