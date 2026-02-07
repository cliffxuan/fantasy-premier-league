---
description: Ensure code quality before finishing a task
---

Before finishing any coding task, always run the pre-commit checks to catch formatting and linting errors.

1. Run the pre-commit checks on all files:
   // turbo
   `uv run prek run --all-files`

2. If any checks fail, fix the issues and run the command again until all checks pass.

3. Only after all checks pass should you consider the task complete.
