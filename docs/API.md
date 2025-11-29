# **FPL API — Minimal Machine Reference**

## **BASE**

```
https://fantasy.premierleague.com/api/
```

---

# **GLOBAL**

## **1. Bootstrap Static**

```
GET /bootstrap-static/
```

**Returns:**

* events[]
* teams[]
* elements[] (all players)
* element_types[]
* phases[]

---

# **PLAYER**

## **2. Player Summary**

```
GET /element-summary/{player_id}/
```

**Returns:**

* history[] (GW-by-GW)
* fixtures[]
* past_seasons[]

---

# **MANAGER (ENTRY)**

## **3. Entry Summary**

```
GET /entry/{entry_id}/
```

**Returns:**

* profile
* favourite_team
* started_event
* player_region

---

## **4. Entry History**

```
GET /entry/{entry_id}/history/
```

**Returns:**

* current[] (GW history)
* past[] (previous seasons)
* chips[]

---

## **5. Entry Picks**

```
GET /entry/{entry_id}/event/{gw}/picks/
```

**Returns:**

* picks[] (squad, multipliers)
* active_chip
* entry_history

---

## **6. Entry Transfers**

```
GET /entry/{entry_id}/transfers/
```

**Returns:**

* list of all transfers (player_in, player_out, cost)

---

# **FIXTURES**

## **7. All Fixtures**

```
GET /fixtures/
```

**Returns:**

* all fixtures (past + future)

---

## **8. Fixtures for GW**

```
GET /fixtures/?event={gw}
```

**Returns:**

* fixtures for specified GW

---

# **LEAGUES**

## **9. Classic League**

```
GET /leagues-classic/{league_id}/standings/
```

**Returns:**

* league info
* standings[]

---

## **10. H2H League**

```
GET /leagues-h2h/{league_id}/standings/
```

**Returns:**

* league info
* standings[]

---

## **11. H2H Matches**

```
GET /leagues-h2h-matches/league/{league_id}/?page={n}
```

**Returns:**

* GW matchups
* results

---

# **PRICES**

## **12. Price Changes**

```
GET /price-changes/
```

**Returns:**

* rises[]
* falls[]

---

# **LIVE DATA**

## **13. Live GW**

```
GET /event/{gw}/live/
```

**Returns:**

* real-time points
* stats (bps, ict, minutes, goals, assists)

---

# **STATUS**

## **14. Event Status**

```
GET /event-status/
```

**Returns:**

* deadlines
* bonus_added
* status

---

# **SUMMARY TABLE**

| Endpoint                                  | Purpose                     |
| ----------------------------------------- | --------------------------- |
| `/bootstrap-static/`                      | Global player/team metadata |
| `/element-summary/{id}/`                  | Player detailed stats       |
| `/entry/{id}/`                            | Manager profile             |
| `/entry/{id}/history/`                    | Season + GW history         |
| `/entry/{id}/event/{gw}/picks/`           | GW squad & captain          |
| `/entry/{id}/transfers/`                  | Transfer history            |
| `/fixtures/`                              | All fixtures                |
| `/fixtures/?event={gw}`                   | GW fixtures                 |
| `/price-changes/`                         | Price rises/falls           |
| `/event/{gw}/live/`                       | Live scoring                |
| `/event-status/`                          | Deadline & bonus status     |
| `/leagues-classic/{id}/standings/`        | Classic league table        |
| `/leagues-h2h/{id}/standings/`            | H2H standings               |
| `/leagues-h2h-matches/league/{id}/?page=` | H2H match list              |

