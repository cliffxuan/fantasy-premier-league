import requests
import json

team_id = 3844111  # Example team ID
url = f"https://fantasy.premierleague.com/api/entry/{team_id}/history/"
response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    print(json.dumps(data.get("current", [])[:2], indent=2))
else:
    print(f"Failed to fetch history: {response.status_code}")
