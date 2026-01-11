# Static team definitions
ARS = {
    "name": "Arsenal",
    "short_name": "ARS",
    "full_name": "Arsenal",
    "code": 3,
}
AVL = {
    "name": "Aston Villa",
    "short_name": "AVL",
    "full_name": "Aston Villa",
    "code": 7,
}
BOU = {
    "name": "Bournemouth",
    "short_name": "BOU",
    "full_name": "AFC Bournemouth",
    "code": 91,
}
BRE = {"name": "Brentford", "short_name": "BRE", "full_name": "Brentford", "code": 94}
BHA = {
    "name": "Brighton",
    "short_name": "BHA",
    "full_name": "Brighton & Hove Albion",
    "code": 36,
}
BUR = {"name": "Burnley", "short_name": "BUR", "full_name": "Burnley", "code": 90}
CHE = {"name": "Chelsea", "short_name": "CHE", "full_name": "Chelsea", "code": 8}
CRY = {
    "name": "Crystal Palace",
    "short_name": "CRY",
    "full_name": "Crystal Palace",
    "code": 31,
}
EVE = {"name": "Everton", "short_name": "EVE", "full_name": "Everton", "code": 11}
FUL = {"name": "Fulham", "short_name": "FUL", "full_name": "Fulham", "code": 54}
IPS = {"name": "Ipswich", "short_name": "IPS", "full_name": "Ipswich Town", "code": 8}
LEE = {"name": "Leeds", "short_name": "LEE", "full_name": "Leeds United", "code": 2}
LEI = {
    "name": "Leicester",
    "short_name": "LEI",
    "full_name": "Leicester City",
    "code": 13,
}
LIV = {"name": "Liverpool", "short_name": "LIV", "full_name": "Liverpool", "code": 14}
MCI = {
    "name": "Man City",
    "short_name": "MCI",
    "full_name": "Manchester City",
    "code": 43,
}
MUN = {
    "name": "Man Utd",
    "short_name": "MUN",
    "full_name": "Manchester United",
    "code": 1,
}
NEW = {
    "name": "Newcastle",
    "short_name": "NEW",
    "full_name": "Newcastle United",
    "code": 4,
}
NFO = {
    "name": "Nott'm Forest",
    "short_name": "NFO",
    "full_name": "Nottingham Forest",
    "code": 17,
}
SHU = {
    "name": "Sheffield Utd",
    "short_name": "SHU",
    "full_name": "Sheffield United",
    "code": 49,
}
SOU = {
    "name": "Southampton",
    "short_name": "SOU",
    "full_name": "Southampton",
    "code": 20,
}
SUN = {"name": "Sunderland", "short_name": "SUN", "full_name": "Sunderland", "code": 56}
TOT = {
    "name": "Spurs",
    "short_name": "TOT",
    "full_name": "Tottenham Hotspur",
    "code": 6,
}
WHU = {
    "name": "West Ham",
    "short_name": "WHU",
    "full_name": "West Ham United",
    "code": 21,
}
WOL = {
    "name": "Wolves",
    "short_name": "WOL",
    "full_name": "Wolverhampton Wanderers",
    "code": 39,
}

# Define variants for each team
# Format: (TEAM_DICT, [list_of_lowercase_aliases])
TEAM_VARIANTS = [
    (ARS, ["arsenal", "arsenal fc"]),
    (AVL, ["aston villa", "aston villa fc"]),
    (BOU, ["bournemouth", "afc bournemouth"]),
    (BRE, ["brentford", "brentford fc"]),
    (BHA, ["brighton", "brighton & hove albion", "brighton & hove albion fc"]),
    (BUR, ["burnley", "burnley fc"]),
    (CHE, ["chelsea", "chelsea fc"]),
    (CRY, ["crystal palace", "crystal palace fc"]),
    (EVE, ["everton", "everton fc"]),
    (FUL, ["fulham", "fulham fc"]),
    (IPS, ["ipswich", "ipswich town"]),
    (LEE, ["leeds", "leeds united"]),
    (LEI, ["leicester", "leicester city"]),
    (LIV, ["liverpool", "liverpool fc"]),
    (MCI, ["man city", "manchester city", "manchester city fc"]),
    (MUN, ["man utd", "manchester united", "manchester united fc", "manchester"]),
    (NEW, ["newcastle", "newcastle united", "newcastle united fc"]),
    (NFO, ["nott'm forest", "nottingham forest", "nottingham forest fc"]),
    (SHU, ["sheffield utd", "sheffield united"]),
    (SOU, ["southampton", "southampton fc"]),
    (SUN, ["sunderland", "sunderland afc"]),
    (TOT, ["spurs", "tottenham", "tottenham hotspur", "tottenham hotspur fc"]),
    (WHU, ["west ham", "west ham united", "west ham united fc"]),
    (
        WOL,
        [
            "wolves",
            "wolverhampton",
            "wolverhampton wanderers",
            "wolverhampton wanderers fc",
        ],
    ),
]

# Build the lookup dictionary
TEAM_MAPPINGS = {}
for team, aliases in TEAM_VARIANTS:
    for alias in aliases:
        TEAM_MAPPINGS[alias] = team

# Overrides for full club names in display
# Dynamically generated from TEAM_VARIANTS
TEAM_NAME_OVERRIDES = {}
for team_dict, _ in TEAM_VARIANTS:
    TEAM_NAME_OVERRIDES[team_dict["name"]] = team_dict["full_name"]
