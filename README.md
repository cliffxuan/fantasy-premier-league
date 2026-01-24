# FPL Alpha

**Data Science & AI Powered Insights for Fantasy Premier League**

FPL Alpha is a comprehensive companion application for Fantasy Premier League managers, leveraging advanced data analysis, machine learning, and linear programming to provide actionable insights and optimal strategies.

![Match Center](assets/screenshots/match_center.png)

## Features

### 🚀 AI Solver
Generate the mathematically optimal team for any gameweek or planning horizon using linear programming. Customize constraints and objectives to find the best possible lineup.

![AI Solver](assets/screenshots/ai_solver.png)

### 📊 My Squad Analysis
Deep dive into your own team's performance. Track points history, analyze transfer effectiveness, and get AI-powered recommendations for your next moves.

![My Squad](assets/screenshots/my_squad.png)

### 📈 Form Analysis Lab
Visualize player form trends over time. Compare players and identify rising assets before they become bandwagons.

![Form Lab](assets/screenshots/form_lab.png)

### 🏆 Team of the Week
View the optimal team for the current gameweek based on actual performance or projected points.

![Team of the Week](assets/screenshots/team_of_the_week.png)

### 🏢 Club Viewer
Detailed breakdown of every Premier League club. Analyze fixtures, squad depth, and player statistics for any specific team.

![Club Viewer](assets/screenshots/club_viewer.png)

### 🔍 Player Explorer
Advanced search and filtering tools to find the perfect differential or replacement. Filter by position, price, team, and underlying stats.

![Player Explorer](assets/screenshots/player_explorer.png)

### 📉 Rank Analysis
Analyze the strategies of top-ranked managers. See template teams, effective ownership, and chip usage trends among the elite.

![Rank Analysis](assets/screenshots/rank_analysis.png)

## Installation & Setup

### Prerequisites
- **Python 3.12+** (Recommended to use `uv` for dependency management)
- **Node.js 20+**

### Backend Setup

1.  Navigate to the root directory.
2.  Install dependencies and run the server using `uv`:

```bash
uv run uvicorn backend.main:app --reload
```

The backend API will start at `http://localhost:8000`.

### Frontend Setup

1.  Navigate to the `frontend` directory:

```bash
cd frontend
```

2.  Install dependencies:

```bash
npm install
```

3.  Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the next available port).

## Tech Stack

-   **Backend**: Python, FastAPI, Polars (Data Processing), PuLP (Optimization/Solver), Scikit-learn (ML).
-   **Frontend**: React, Vite, TailwindCSS, Recharts (Visualization).
