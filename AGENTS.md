## Packages

- `apps/extension`: Chrome/Chromium MV3 extension built with the Vite+ workspace.
- `packages/daemon`: localhost HTTP + WebSocket daemon.
- `packages/cli`: `cac` powered `bb` CLI for agents.
- `packages/shared`: shared types and constants used across packages.

## Update Project Agent Skills

When creating or updating agent skills for this project, follow the guidelines in [`docs/skills-generater.md`](docs/skills-generater.md).

## Extension Reload Rule

After modifying `apps/extension/src/*`, build the extension and manually reload it in the browser before testing. MV3 service workers do not pick up code changes automatically.

## Local CLI Testing

When working inside this repository, always use the workspace version of the `bb` CLI so the daemon, CLI, and extension code stay in sync:

```bash
pnpm bb <command>
```

Avoid the globally installed `bb` for local development and testing, because it may be an older version and can drift from the workspace packages.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
