---
description: Ensure code quality before finishing a task
---

Before finishing any coding task, always run the pre-commit checks to catch formatting and linting errors.

1. Run the pre-commit checks on all files:
   // turbo
   `uv run prek run --all-files`

2. If any checks fail, fix the issues and run the command again until all checks pass.

3. Run the integration tests (pre-push hooks) to ensure critical flows work:
   // turbo
   `uv run prek run --all-files --stage pre-push`

4. If any checks fail, fix the issues. Note that integration tests might require a clean build or specific environment setup.

5. Only after all checks pass (or failures are understood and acceptable) should you consider the task complete.
