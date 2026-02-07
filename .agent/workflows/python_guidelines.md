---
description: Instructions for running Python commands using the local environment
---

When running any Python command (e.g., `python`, `pip`, `pytest`, `prek`), you MUST ensure you are using the project's local virtual environment to access installed dependencies.

**Preferred Method:**
Use `uv run` to execute commands in the environment context:
- `uv run python <script.py>`
- `uv run pytest`
- `uv run prek run --all-files`

**Alternative Method:**
Explicitly activate the virtual environment before running commands:
- `source .venv/bin/activate && python <script.py>`

**Do NOT** run `python` or `pip` directly without one of these methods, as it may use the system Python and fail to find dependencies.
