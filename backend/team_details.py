# Static team definitions
ARS = {"name": "Arsenal", "short_name": "ARS", "code": 3}
AVL = {"name": "Aston Villa", "short_name": "AVL", "code": 7}
BOU = {"name": "Bournemouth", "short_name": "BOU", "code": 91}
BRE = {"name": "Brentford", "short_name": "BRE", "code": 94}
BHA = {"name": "Brighton", "short_name": "BHA", "code": 36}
BUR = {"name": "Burnley", "short_name": "BUR", "code": 90}
CHE = {"name": "Chelsea", "short_name": "CHE", "code": 8}
CRY = {"name": "Crystal Palace", "short_name": "CRY", "code": 31}
EVE = {"name": "Everton", "short_name": "EVE", "code": 11}
FUL = {"name": "Fulham", "short_name": "FUL", "code": 54}
IPS = {"name": "Ipswich", "short_name": "IPS", "code": 8}
LEE = {"name": "Leeds", "short_name": "LEE", "code": 2}
LEI = {"name": "Leicester", "short_name": "LEI", "code": 13}
LIV = {"name": "Liverpool", "short_name": "LIV", "code": 14}
MCI = {"name": "Man City", "short_name": "MCI", "code": 43}
MUN = {"name": "Man Utd", "short_name": "MUN", "code": 1}
NEW = {"name": "Newcastle", "short_name": "NEW", "code": 4}
NFO = {"name": "Nott'm Forest", "short_name": "NFO", "code": 17}
SHU = {"name": "Sheffield Utd", "short_name": "SHU", "code": 49}
SOU = {"name": "Southampton", "short_name": "SOU", "code": 20}
SUN = {"name": "Sunderland", "short_name": "SUN", "code": 56}
TOT = {"name": "Spurs", "short_name": "TOT", "code": 6}
WHU = {"name": "West Ham", "short_name": "WHU", "code": 21}
WOL = {"name": "Wolves", "short_name": "WOL", "code": 39}

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
