# FPL Alpha - Project Commands

## Backend (Python/FastAPI)
```bash
uv run ruff check backend          # Lint
uv run ruff check backend --fix    # Lint + auto-fix
uv run ruff format backend         # Format
uv run pytest tests -v             # Run tests
uv run uvicorn backend.main:app --reload  # Dev server
```

## Frontend (React/Vite)
```bash
cd frontend
npm run lint                       # ESLint
npm run format                     # Prettier format
npm run format:check               # Prettier check
npm run test                       # Vitest (watch mode)
npm run test:run                   # Vitest (single run)
npm run dev                        # Dev server
npm run build                      # Production build
```

## Mobile (Flutter)
```bash
cd mobile
dart analyze                       # Static analysis
dart format .                      # Format
flutter test                       # Run tests
dart run build_runner build --delete-conflicting-outputs  # Code gen
flutter run                        # Run app
```

## Pre-commit
```bash
uv run pre-commit run --all-files  # Run all hooks
uv run pre-commit install          # Install git hooks
```
