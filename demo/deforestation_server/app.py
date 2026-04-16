"""
Policy vs Deforestation Explorer — built with gr.Server

Uses gr.Server for API endpoints (with MCP tool support) and a custom
HTML frontend with Chart.js for interactive visualization.
"""

import json
import urllib.request
from gradio import Server
from fastapi.responses import HTMLResponse, JSONResponse

app = Server()

COUNTRIES = {
    "Brazil": "BRA", "Indonesia": "IDN", "DR Congo": "COD",
    "Colombia": "COL", "Bolivia": "BOL", "Malaysia": "MYS",
    "India": "IND", "Mexico": "MEX", "Peru": "PER",
    "Australia": "AUS", "Canada": "CAN", "Russia": "RUS",
    "China": "CHN", "United States": "USA", "Nigeria": "NGA",
    "Myanmar": "MMR", "Tanzania": "TZA", "Paraguay": "PRY",
    "Madagascar": "MDG", "Cameroon": "CMR",
}

POLICY_EVENTS = {
    "Brazil": [
        {"year": 2004, "text": "PPCDAm action plan launched", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Brazil"},
        {"year": 2006, "text": "Soy Moratorium signed", "url": "https://en.wikipedia.org/wiki/Amazon_Soy_Moratorium"},
        {"year": 2008, "text": "Amazon Fund established", "url": "https://en.wikipedia.org/wiki/Amazon_Fund"},
        {"year": 2012, "text": "New Forest Code enacted", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Brazil"},
        {"year": 2019, "text": "Enforcement weakened under Bolsonaro", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Brazil"},
        {"year": 2023, "text": "Zero deforestation pledge renewed", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Brazil"},
    ],
    "Indonesia": [
        {"year": 2002, "text": "Illegal Logging Decree", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Indonesia"},
        {"year": 2011, "text": "Forest moratorium on concessions", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Indonesia"},
        {"year": 2014, "text": "One Map Policy", "url": "https://en.wikipedia.org/wiki/Joko_Widodo"},
        {"year": 2018, "text": "Moratorium extended permanently", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Indonesia"},
        {"year": 2023, "text": "FOLU Net Sink 2030 strategy", "url": "https://en.wikipedia.org/wiki/Climate_change_in_Indonesia"},
    ],
    "DR Congo": [
        {"year": 2002, "text": "Forest Code enacted", "url": "https://en.wikipedia.org/wiki/Deforestation_in_the_Democratic_Republic_of_the_Congo"},
        {"year": 2014, "text": "REDD+ national strategy", "url": "https://en.wikipedia.org/wiki/REDD_and_REDD%2B"},
        {"year": 2022, "text": "Logging moratorium lifted", "url": "https://en.wikipedia.org/wiki/Deforestation_in_the_Democratic_Republic_of_the_Congo"},
    ],
    "Colombia": [
        {"year": 2010, "text": "REDD+ strategy launched", "url": "https://en.wikipedia.org/wiki/REDD_and_REDD%2B"},
        {"year": 2016, "text": "FARC peace deal", "url": "https://en.wikipedia.org/wiki/Colombian_peace_process"},
        {"year": 2018, "text": "Deforestation Control Council", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Colombia"},
        {"year": 2023, "text": "Amazon pact signed", "url": "https://en.wikipedia.org/wiki/Amazon_Cooperation_Treaty_Organization"},
    ],
    "India": [
        {"year": 2006, "text": "Forest Rights Act", "url": "https://en.wikipedia.org/wiki/Forest_Rights_Act,_2006"},
        {"year": 2014, "text": "Green India Mission", "url": "https://en.wikipedia.org/wiki/Government_of_India"},
        {"year": 2019, "text": "Compensatory Afforestation Fund", "url": "https://en.wikipedia.org/wiki/Compensatory_Afforestation_Fund_Act,_2016"},
    ],
    "Malaysia": [
        {"year": 2010, "text": "50% forest cover pledge", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Malaysia"},
        {"year": 2017, "text": "MSPO mandatory certification", "url": "https://en.wikipedia.org/wiki/Malaysian_Sustainable_Palm_Oil"},
    ],
    "China": [
        {"year": 1998, "text": "Natural Forest Protection Program", "url": "https://en.wikipedia.org/wiki/Reforestation_in_China"},
        {"year": 2003, "text": "Grain-to-Green expanded", "url": "https://en.wikipedia.org/wiki/Reforestation_in_China"},
        {"year": 2016, "text": "13th Five-Year Plan forestry targets", "url": "https://en.wikipedia.org/wiki/13th_Five-Year_Plan_(China)"},
    ],
    "Mexico": [
        {"year": 2001, "text": "ProÁrbol reforestation", "url": "https://en.wikipedia.org/wiki/CONAFOR"},
        {"year": 2012, "text": "Climate Change Law", "url": "https://en.wikipedia.org/wiki/Climate_change_in_Mexico"},
        {"year": 2020, "text": "Sembrando Vida program", "url": "https://en.wikipedia.org/wiki/Andr%C3%A9s_Manuel_L%C3%B3pez_Obrador"},
    ],
    "Canada": [
        {"year": 2010, "text": "Boreal Forest Agreement", "url": "https://en.wikipedia.org/wiki/Boreal_forest_of_Canada"},
        {"year": 2021, "text": "2 Billion Trees program", "url": "https://www.canada.ca/en/campaign/2-billion-trees.html"},
    ],
    "Australia": [
        {"year": 2000, "text": "Regional Forest Agreements", "url": "https://en.wikipedia.org/wiki/Regional_Forest_Agreement"},
        {"year": 2012, "text": "Carbon farming legislation", "url": "https://en.wikipedia.org/wiki/Climate_change_in_Australia"},
        {"year": 2022, "text": "Nature Repair Market Act", "url": "https://en.wikipedia.org/wiki/Climate_change_in_Australia"},
    ],
    "United States": [
        {"year": 2001, "text": "Healthy Forests Initiative", "url": "https://en.wikipedia.org/wiki/Healthy_Forests_Initiative"},
        {"year": 2008, "text": "Lacey Act amended to ban illegal timber", "url": "https://en.wikipedia.org/wiki/Lacey_Act_of_1900"},
        {"year": 2022, "text": "Inflation Reduction Act — $5B for forests", "url": "https://en.wikipedia.org/wiki/Inflation_Reduction_Act"},
    ],
    "Russia": [
        {"year": 1997, "text": "First Russian Forest Code", "url": "https://en.wikipedia.org/wiki/Forestry_in_Russia"},
        {"year": 2006, "text": "New Forest Code — privatisation of management", "url": "https://en.wikipedia.org/wiki/Forestry_in_Russia"},
        {"year": 2020, "text": "Forest protection reform after record fires", "url": "https://en.wikipedia.org/wiki/Forestry_in_Russia"},
    ],
    "Bolivia": [
        {"year": 1996, "text": "Forestry Law 1700 enacted", "url": "https://en.wikipedia.org/wiki/Deforestation"},
        {"year": 2012, "text": "Mother Earth Law", "url": "https://en.wikipedia.org/wiki/Law_of_the_Rights_of_Mother_Earth"},
    ],
    "Peru": [
        {"year": 2011, "text": "Forest and Wildlife Law 29763", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Peru"},
        {"year": 2014, "text": "Joint Declaration with Norway & Germany", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Peru"},
    ],
    "Paraguay": [
        {"year": 2004, "text": "Zero Deforestation Law (East region)", "url": "https://en.wikipedia.org/wiki/Deforestation"},
    ],
    "Madagascar": [
        {"year": 2003, "text": "Durban Vision — triple protected areas", "url": "https://en.wikipedia.org/wiki/Environment_of_Madagascar"},
        {"year": 2015, "text": "National REDD+ strategy", "url": "https://en.wikipedia.org/wiki/REDD_and_REDD%2B"},
    ],
    "Cameroon": [
        {"year": 1994, "text": "Forest Law 94/01 enacted", "url": "https://en.wikipedia.org/wiki/Forestry_in_Cameroon"},
        {"year": 2010, "text": "CAFI partnership initiated", "url": "https://en.wikipedia.org/wiki/Forestry_in_Cameroon"},
    ],
    "Nigeria": [
        {"year": 1999, "text": "Federal Forestry Policy", "url": "https://en.wikipedia.org/wiki/Forestry_in_Nigeria"},
        {"year": 2017, "text": "Great Green Wall commitment", "url": "https://en.wikipedia.org/wiki/Great_Green_Wall_(Africa)"},
    ],
    "Myanmar": [
        {"year": 1992, "text": "Forest Law passed", "url": "https://en.wikipedia.org/wiki/Deforestation"},
        {"year": 2014, "text": "Raw log export ban", "url": "https://en.wikipedia.org/wiki/Deforestation"},
    ],
    "Tanzania": [
        {"year": 2002, "text": "Forest Act enacted", "url": "https://en.wikipedia.org/wiki/Environmental_issues_in_Tanzania"},
        {"year": 2015, "text": "National REDD+ strategy", "url": "https://en.wikipedia.org/wiki/REDD_and_REDD%2B"},
    ],
}


CLIMATE_EVENTS = {
    "Australia": [
        {"year": 2002, "text": "Millennium Drought intensifies", "url": "https://en.wikipedia.org/wiki/2000s_Australian_drought"},
        {"year": 2009, "text": "Black Saturday bushfires (430k ha)", "url": "https://en.wikipedia.org/wiki/Black_Saturday_bushfires"},
        {"year": 2020, "text": "Black Summer fires (18.6M ha)", "url": "https://en.wikipedia.org/wiki/2019%E2%80%9320_Australian_bushfire_season"},
    ],
    "Indonesia": [
        {"year": 1997, "text": "Southeast Asian haze from peat fires", "url": "https://en.wikipedia.org/wiki/1997_Southeast_Asian_haze"},
        {"year": 2015, "text": "Peat fires burn 2.6M ha", "url": "https://en.wikipedia.org/wiki/2015_Southeast_Asian_haze"},
        {"year": 2019, "text": "Major fire season, 1.6M ha burned", "url": "https://en.wikipedia.org/wiki/2019_Southeast_Asian_haze"},
    ],
    "Brazil": [
        {"year": 2019, "text": "Amazon fires spike 84%", "url": "https://en.wikipedia.org/wiki/2019_Amazon_rainforest_wildfires"},
        {"year": 2020, "text": "Pantanal wetland fires (4M ha)", "url": "https://en.wikipedia.org/wiki/2020_Pantanal_wildfires"},
    ],
    "Canada": [
        {"year": 2005, "text": "Mountain pine beetle peak (18M ha)", "url": "https://en.wikipedia.org/wiki/Mountain_pine_beetle"},
        {"year": 2016, "text": "Fort McMurray fire", "url": "https://en.wikipedia.org/wiki/2016_Fort_McMurray_wildfire"},
        {"year": 2023, "text": "Record fire season (18.5M ha)", "url": "https://en.wikipedia.org/wiki/2023_Canadian_wildfires"},
    ],
    "Russia": [
        {"year": 2010, "text": "Moscow smog — wildfires kill 56k", "url": "https://en.wikipedia.org/wiki/2010_Russian_wildfires"},
        {"year": 2019, "text": "Siberian fires (4M ha)", "url": "https://en.wikipedia.org/wiki/2019_Siberia_wildfires"},
        {"year": 2021, "text": "Record Siberian fires (18.8M ha)", "url": "https://en.wikipedia.org/wiki/2021_Russia_wildfires"},
    ],
    "China": [
        {"year": 1998, "text": "Yangtze floods kill 4,000+", "url": "https://en.wikipedia.org/wiki/1998_China_floods"},
    ],
    "United States": [
        {"year": 2018, "text": "Camp Fire destroys Paradise", "url": "https://en.wikipedia.org/wiki/Camp_Fire_(2018)"},
        {"year": 2020, "text": "Record fire season (4.2M acres)", "url": "https://en.wikipedia.org/wiki/2020_California_wildfires"},
        {"year": 2023, "text": "Maui fires & Canadian smoke crisis", "url": "https://en.wikipedia.org/wiki/2023_Hawaii_wildfires"},
    ],
    "Colombia": [
        {"year": 2017, "text": "Deforestation spikes in post-FARC areas", "url": "https://en.wikipedia.org/wiki/Deforestation_in_Colombia"},
    ],
    "Mexico": [
        {"year": 2011, "text": "Worst drought in 70 years", "url": "https://en.wikipedia.org/wiki/Climate_change_in_Mexico"},
    ],
    "Bolivia": [
        {"year": 2019, "text": "Chiquitano fires burn 2.3M ha", "url": "https://en.wikipedia.org/wiki/2019_Amazon_rainforest_wildfires"},
    ],
    "Madagascar": [
        {"year": 2020, "text": "Severe drought in southern regions", "url": "https://en.wikipedia.org/wiki/Environment_of_Madagascar"},
    ],
    "DR Congo": [
        {"year": 2003, "text": "Second Congo War ends", "url": "https://en.wikipedia.org/wiki/Second_Congo_War"},
    ],
}


_cache = {}

HISTORICAL_CONTEXT = {
    "Brazil": {
        range(1990, 1996): "Rapid expansion of cattle ranching and soy farming in the Amazon after economic stabilisation.",
        range(1996, 2005): "Peak deforestation era — illegal logging, land speculation, and weak enforcement. Arc of deforestation expanded.",
        range(2005, 2013): "PPCDAm enforcement + satellite monitoring (DETER) + soy/beef moratoriums drove sharp decline in clearing rates.",
        range(2013, 2019): "Deforestation crept back up as budget cuts weakened IBAMA enforcement and new Forest Code allowed amnesty for past clearing.",
        range(2019, 2023): "Environmental enforcement dismantled, IBAMA fines dropped 70%. Amazon tipping point warnings from scientists.",
    },
    "Indonesia": {
        range(1990, 2000): "Suharto-era logging concessions and transmigration programs accelerated forest loss, especially in Sumatra and Kalimantan.",
        range(2000, 2005): "Post-Suharto decentralisation gave district heads power to issue logging/plantation permits, often corruptly.",
        range(2005, 2012): "Palm oil boom — Indonesia became world's largest producer. Peatland drainage caused massive fires (2006, 2009).",
        range(2012, 2018): "2015 fires burned 2.6M hectares, caused $16B damage. Led to peat restoration agency and stronger moratorium.",
        range(2018, 2023): "Deforestation rates declined significantly. Palm oil export ban (2022) temporarily reduced pressure.",
    },
    "Australia": {
        range(1990, 2000): "Broadscale land clearing for agriculture, especially in Queensland. Woody vegetation loss peaked mid-1990s.",
        range(2000, 2007): "Millennium drought (2001-2009) devastated forests. Queensland banned broadscale clearing in 2006.",
        range(2007, 2013): "Black Saturday bushfires (2009) destroyed 430,000 hectares. Drought continued to stress forests.",
        range(2013, 2020): "Forest recovery after drought broke. But 2019-20 Black Summer fires burned 18.6M hectares — worst fire season on record.",
        range(2020, 2023): "La Niña rains aided recovery. New environmental laws and carbon farming incentives.",
    },
    "DR Congo": {
        range(1990, 2002): "Civil wars (1996-2003) disrupted industrial logging but subsistence clearing continued.",
        range(2002, 2015): "Population growth drove smallholder agriculture expansion — the primary deforestation driver. Charcoal demand surged.",
        range(2015, 2023): "Artisanal mining and cocoa expansion increased. DRC has lowest governance capacity of major forest nations.",
    },
    "Colombia": {
        range(1990, 2016): "FARC conflict paradoxically protected forests — armed groups controlled access to remote areas.",
        range(2016, 2020): "Post-peace deal: deforestation spiked 44% as land grabbers moved into former FARC territory.",
        range(2020, 2023): "Government crackdown on deforestation. Amazon pact signed with Brazil and other nations.",
    },
    "India": {
        range(1990, 2005): "Forest cover data contested — government counts plantations as forest. Native forest loss continued.",
        range(2005, 2015): "Massive afforestation programs (Green India Mission) increased total tree cover, though primary forest still declined.",
        range(2015, 2023): "Forest Rights Act empowered tribal communities. Compensatory afforestation fund reached $6B.",
    },
    "China": {
        range(1990, 2000): "1998 Yangtze floods killed 4,000+ — blamed on upstream deforestation. Triggered logging ban.",
        range(2000, 2010): "Grain-to-Green: world's largest reforestation program. Paid 120M farmers to convert cropland to forest.",
        range(2010, 2023): "China became net reforester. But imports shifted deforestation to SE Asia and Africa.",
    },
    "Malaysia": {
        range(1990, 2005): "Rapid palm oil expansion, especially in Sabah and Sarawak. Malaysia became 2nd largest producer.",
        range(2005, 2015): "International pressure over orangutan habitat. RSPO certification introduced but adoption slow.",
        range(2015, 2023): "MSPO mandatory certification. Pledged 50% forest cover but definition includes oil palm.",
    },
    "Mexico": {
        range(1990, 2005): "NAFTA (1994) shifted agriculture — some marginal farmland abandoned and reforested, but Lacandón jungle clearing continued.",
        range(2005, 2015): "Drug cartel activity in forests (avocado, poppy cultivation) drove illegal clearing in Michoacán and Guerrero.",
        range(2015, 2023): "Sembrando Vida program controversially paid farmers to plant trees — but some cut existing forest to qualify.",
    },
    "Canada": {
        range(1990, 2005): "Forestry industry dominated — clearcut logging in British Columbia and boreal regions.",
        range(2005, 2015): "Mountain pine beetle epidemic killed 18M hectares of BC forest — largest insect blight in North American history.",
        range(2015, 2023): "Wildfires intensified with climate change. 2023 was worst fire season ever — 18.5M hectares burned.",
    },
    "Russia": {
        range(1990, 2000): "Post-Soviet collapse reduced industrial logging but also enforcement. Illegal logging surged.",
        range(2000, 2010): "Siberian wildfires increased dramatically. 2010 fires caused Moscow smog crisis.",
        range(2010, 2023): "Permafrost thaw and wildfires became primary forest loss drivers. 2021: record 18.8M hectares burned.",
    },
    "United States": {
        range(1990, 2005): "Net forest area roughly stable. Urban sprawl consumed some forest, offset by farmland reversion in East.",
        range(2005, 2015): "Western wildfires intensified — bark beetle outbreaks weakened millions of hectares. 2012 was record fire year.",
        range(2015, 2023): "Paradise fire (2018), record 2020 season (4.2M acres in CA/OR/WA). Climate-driven megafires now the norm.",
    },
}


def _fetch_wb(country_code: str, indicator: str) -> list[dict]:
    cache_key = f"{country_code}:{indicator}"
    if cache_key in _cache:
        return _cache[cache_key]
    url = (
        f"https://api.worldbank.org/v2/country/{country_code}"
        f"/indicator/{indicator}?format=json&per_page=50&date=1990:2022"
    )
    for attempt in range(3):
        try:
            resp = urllib.request.urlopen(url, timeout=30)
            data = json.loads(resp.read())
            if len(data) < 2 or not data[1]:
                _cache[cache_key] = []
                return []
            results = [
                {"year": int(d["date"]), "value": round(d["value"], 3)}
                for d in data[1]
                if d["value"] is not None
            ]
            results.sort(key=lambda x: x["year"])
            _cache[cache_key] = results
            return results
        except Exception:
            if attempt == 2:
                return []
            import time
            time.sleep(1)


@app.mcp.tool(name="get_forest_data")
@app.api(name="get_forest_data")
def get_forest_data(country: str) -> dict:
    """Get forest area (% of land) time series for a country. Returns yearly data from World Bank."""
    code = COUNTRIES.get(country)
    if not code:
        return {"error": f"Unknown country. Available: {', '.join(COUNTRIES.keys())}"}
    forest = _fetch_wb(code, "AG.LND.FRST.ZS")
    governance = _fetch_wb(code, "RL.EST")
    policies = POLICY_EVENTS.get(country, [])
    climate = CLIMATE_EVENTS.get(country, [])

    summary = {}
    if forest:
        first, last = forest[0], forest[-1]
        change = last["value"] - first["value"]
        years = last["year"] - first["year"]
        summary = {
            "start_year": first["year"],
            "end_year": last["year"],
            "start_pct": first["value"],
            "end_pct": last["value"],
            "change_pct": round(change, 3),
            "annual_rate": round(change / years, 4) if years else 0,
        }

    return {
        "country": country,
        "forest": forest,
        "governance": governance,
        "policies": policies,
        "climate": climate,
        "summary": summary,
    }


@app.mcp.tool(name="compare_countries")
@app.api(name="compare_countries")
def compare_countries(country_a: str, country_b: str) -> dict:
    """Compare forest cover trends between two countries."""
    a = get_forest_data(country_a)
    b = get_forest_data(country_b)
    return {"country_a": a, "country_b": b}


@app.mcp.tool(name="explain_spike")
@app.api(name="explain_spike")
def explain_spike(country: str, year: int) -> dict:
    """Explain what happened to forest cover around a specific year. Identifies rate changes and nearby policy events."""
    code = COUNTRIES.get(country)
    if not code:
        return {"error": f"Unknown country."}
    forest = _fetch_wb(code, "AG.LND.FRST.ZS")
    if not forest:
        return {"error": "No data available."}

    policies = POLICY_EVENTS.get(country, [])
    nearby_policies = [p for p in policies if abs(p["year"] - year) <= 3]
    climate = CLIMATE_EVENTS.get(country, [])
    nearby_climate = [c for c in climate if abs(c["year"] - year) <= 3]

    window = [f for f in forest if abs(f["year"] - year) <= 5]
    window.sort(key=lambda x: x["year"])

    point = next((f for f in forest if f["year"] == year), None)
    prev = next((f for f in forest if f["year"] == year - 1), None)
    nxt = next((f for f in forest if f["year"] == year + 1), None)

    before = [f for f in forest if year - 5 <= f["year"] < year]
    after = [f for f in forest if year < f["year"] <= year + 5]

    rate_before = None
    rate_after = None
    if len(before) >= 2:
        rate_before = round((before[-1]["value"] - before[0]["value"]) / (before[-1]["year"] - before[0]["year"]), 4)
    if len(after) >= 2:
        rate_after = round((after[-1]["value"] - after[0]["value"]) / (after[-1]["year"] - after[0]["year"]), 4)

    yoy_change = None
    if point and prev:
        yoy_change = round(point["value"] - prev["value"], 3)

    trend = "stable"
    if rate_before is not None and rate_after is not None:
        if rate_after > rate_before + 0.01:
            trend = "recovery"
        elif rate_after < rate_before - 0.01:
            trend = "acceleration"
    if yoy_change is not None:
        if yoy_change > 0.05:
            trend = "sharp increase"
        elif yoy_change < -0.05:
            trend = "sharp decline"

    context = None
    country_ctx = HISTORICAL_CONTEXT.get(country, {})
    for year_range, text in country_ctx.items():
        if year in year_range:
            context = text
            break

    return {
        "country": country,
        "year": year,
        "forest_pct": point["value"] if point else None,
        "yoy_change": yoy_change,
        "trend": trend,
        "rate_5yr_before": rate_before,
        "rate_5yr_after": rate_after,
        "nearby_policies": nearby_policies,
        "nearby_climate": nearby_climate,
        "context": context,
        "window": window,
    }


@app.mcp.tool(name="list_countries")
@app.api(name="list_countries")
def list_countries() -> list[str]:
    """List all available countries."""
    return list(COUNTRIES.keys())


@app.get("/", response_class=HTMLResponse)
async def homepage():
    countries_json = json.dumps(list(COUNTRIES.keys()))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Forest Dispatch — A Record of What We Have Lost</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3"></script>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}

:root {{
    --paper: #ede5d3;
    --paper-tint: #e4dbc5;
    --paper-deep: #d8cdb3;
    --ink: #1a1f18;
    --ink-soft: #3a3f35;
    --ink-mute: #6a6d60;
    --ink-fade: #9c9e8f;
    --rule: #3a3f35;
    --rule-soft: #c5bda5;
    --moss: #4a6b3e;
    --moss-deep: #2f4827;
    --oxblood: #8b2a1f;
    --oxblood-deep: #5c1e16;
    --amber: #a8732a;
    --amber-deep: #7d5418;
    --highlight: #d4c98a;
}}

html {{ background: var(--paper); }}

body {{
    font-family: 'Fraunces', Georgia, serif;
    font-optical-sizing: auto;
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
    font-size: 16px;
    line-height: 1.55;
    position: relative;
    overflow-x: hidden;
}}

/* Grain texture overlay — gives that risograph/newsprint feel */
body::before {{
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.35;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.12 0 0 0 0 0.09 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}}

/* Paper vignette */
body::after {{
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(60, 50, 30, 0.18) 100%);
}}

a {{ color: var(--oxblood); text-decoration: none; border-bottom: 1px solid currentColor; padding-bottom: 1px; transition: opacity 0.15s; }}
a:hover {{ opacity: 0.7; }}

.mono {{ font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: "tnum", "zero"; }}
.serif-display {{ font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; }}
.tabular {{ font-variant-numeric: tabular-nums; }}
.smallcaps {{
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.72em;
    font-weight: 600;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
}}

/* ====== MASTHEAD ====== */
.masthead {{
    padding: 16px 48px 0;
    border-bottom: 2px solid var(--ink);
    position: relative;
    z-index: 2;
}}
.masthead-top {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-soft);
    padding-bottom: 6px;
    border-bottom: 1px solid var(--rule-soft);
}}
.masthead-top .vol {{ display: flex; gap: 22px; }}
.masthead-top .vol span:not(:last-child)::after {{
    content: '·';
    margin-left: 22px;
    color: var(--ink-fade);
}}
.masthead-row {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 12px 0;
}}
.wordmark {{
    font-family: 'Instrument Serif', serif;
    font-size: clamp(40px, 5.5vw, 72px);
    line-height: 0.95;
    letter-spacing: -0.02em;
    font-weight: 400;
    font-style: italic;
    flex-shrink: 0;
}}
.wordmark .dispatch {{ font-style: normal; }}
.dek-text {{
    flex: 1;
    max-width: 520px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--ink-soft);
    font-style: italic;
}}
.dek-text::first-letter {{
    font-family: 'Instrument Serif', serif;
    font-size: 3.4em;
    line-height: 0.8;
    float: left;
    padding: 4px 8px 0 0;
    color: var(--oxblood);
    font-style: normal;
}}
.dek-meta {{
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-mute);
    line-height: 1.7;
    white-space: nowrap;
    flex-shrink: 0;
}}
.dek-meta .badge {{
    display: inline-block;
    background: var(--ink);
    color: var(--paper);
    padding: 2px 7px;
    margin-top: 3px;
    font-weight: 500;
}}

/* ====== MAIN GRID ====== */
.sheet {{
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 48px 48px;
    position: relative;
    z-index: 2;
}}

/* ====== CONTROL STRIP ====== */
.control-strip {{
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: 24px;
    align-items: end;
    padding: 14px 0 16px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 18px;
}}
.section-title {{
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
    letter-spacing: -0.01em;
    line-height: 1.2;
    font-style: italic;
    color: var(--ink-soft);
    padding-bottom: 4px;
}}
.section-title .caps {{
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: var(--ink-mute);
    text-transform: uppercase;
    margin-bottom: 4px;
    font-weight: 500;
    font-style: normal;
}}
.control-group {{
    display: flex;
    flex-direction: column;
    gap: 4px;
}}
.control-group label {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-mute);
    font-weight: 500;
}}
select {{
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--ink);
    color: var(--ink);
    padding: 4px 24px 4px 0;
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 500;
    min-width: 180px;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M1 3 L5 7 L9 3' stroke='%231a1f18' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 4px center;
    transition: border-color 0.15s;
}}
select:focus {{ border-bottom-color: var(--oxblood); }}
button.action {{
    background: var(--ink);
    color: var(--paper);
    border: none;
    padding: 12px 28px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    box-shadow: 3px 3px 0 var(--rule-soft);
}}
button.action:hover {{
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 var(--oxblood);
}}
button.action:active {{
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--rule-soft);
}}

/* ====== FINDINGS ROW ====== */
.findings {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 2px solid var(--ink);
    border-bottom: 2px solid var(--ink);
    margin-bottom: 32px;
    min-height: 110px;
}}
.finding {{
    padding: 14px 22px 16px;
    border-right: 1px solid var(--rule);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}}
.finding:last-child {{ border-right: none; }}
.finding::before {{
    content: attr(data-num);
    position: absolute;
    top: 8px;
    right: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: var(--ink-fade);
    letter-spacing: 0.15em;
}}
.finding .label {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 6px;
    font-weight: 500;
}}
.finding .value {{
    font-family: 'Instrument Serif', serif;
    font-size: 40px;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
    font-weight: 400;
}}
.finding .value.down {{ color: var(--oxblood); font-style: italic; }}
.finding .value.up {{ color: var(--moss-deep); }}
.finding .sub {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--ink-mute);
    margin-top: 8px;
    letter-spacing: 0.05em;
}}
.finding .unit {{
    font-family: 'Fraunces', serif;
    font-size: 14px;
    font-style: italic;
    color: var(--ink-soft);
    margin-left: 2px;
    font-weight: 400;
}}

/* ====== CHART FIGURE ====== */
.figure {{
    margin-bottom: 28px;
}}
.figure-head {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 2px;
}}
.figure-title {{
    font-family: 'Instrument Serif', serif;
    font-size: 26px;
    letter-spacing: -0.01em;
    font-style: italic;
}}
.figure-title::before {{
    content: 'Fig. 1 ';
    font-family: 'JetBrains Mono', monospace;
    font-style: normal;
    font-size: 12px;
    letter-spacing: 0.15em;
    color: var(--ink-mute);
    vertical-align: middle;
    margin-right: 10px;
    padding-right: 10px;
    border-right: 1px solid var(--rule);
}}
.figure-note {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--ink-mute);
    text-transform: uppercase;
}}
.figure-frame {{
    background: var(--paper-tint);
    border: 1px solid var(--rule);
    border-top: none;
    padding: 20px;
    height: clamp(420px, 56vh, 580px);
    position: relative;
}}
.figure-loading {{
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 22px;
    color: var(--ink-mute);
    background: var(--paper-tint);
    z-index: 5;
}}
.figure-loading::after {{
    content: ' ·';
    animation: ellipsis 1.4s infinite;
}}
.figure-caption {{
    padding-top: 10px;
    font-size: 13px;
    font-style: italic;
    color: var(--ink-soft);
    line-height: 1.5;
    max-width: 700px;
}}

/* ====== INSIGHT / DOSSIER ====== */
.dossier {{
    display: none;
    background: var(--paper-tint);
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
    padding: 28px 32px;
    margin-bottom: 40px;
    position: relative;
}}
.dossier::before {{
    content: '';
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    border: 1px dashed var(--rule);
    pointer-events: none;
}}
.dossier-label {{
    position: absolute;
    top: -9px;
    left: 32px;
    background: var(--paper);
    padding: 0 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--oxblood);
    font-weight: 700;
}}
.dossier-head {{
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    font-style: italic;
    margin-bottom: 16px;
    color: var(--ink);
}}
.dossier-head .hint {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-style: normal;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-left: 10px;
    font-weight: 500;
}}

/* ====== PANELS ====== */
.split {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    display: none;
}}
.split.active {{ display: grid; }}
.panel {{
    padding: 28px 28px 24px;
    border-right: 1px solid var(--rule);
}}
.panel:last-child {{ border-right: none; }}
.panel-head {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--rule-soft);
}}
.panel-title {{
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    font-style: italic;
    letter-spacing: -0.01em;
}}
.panel-count {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--ink-mute);
    letter-spacing: 0.15em;
    text-transform: uppercase;
}}

/* ====== POLICY ITEMS ====== */
.policy {{
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule-soft);
    align-items: baseline;
}}
.policy:last-child {{ border-bottom: none; }}
.policy-year {{
    font-family: 'Instrument Serif', serif;
    font-size: 28px;
    font-style: italic;
    line-height: 1;
    color: var(--oxblood);
    font-variant-numeric: tabular-nums;
}}
.policy-text {{
    font-size: 15px;
    line-height: 1.4;
    color: var(--ink);
}}
.policy-text a {{
    color: var(--ink-mute);
    margin-left: 6px;
    font-size: 11px;
    border-bottom: none;
}}
.policy-text a:hover {{ color: var(--oxblood); }}
.policy-metric {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--ink-mute);
    white-space: nowrap;
    letter-spacing: 0.05em;
}}

/* ====== RATE VERDICT ====== */
.rate-row {{
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule-soft);
    align-items: baseline;
}}
.rate-row .stage {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--oxblood);
    font-weight: 700;
}}
.rate-row .desc {{ font-size: 14px; color: var(--ink); font-style: italic; }}
.rate-row .rate {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}}
.rate-row .rate.neg {{ color: var(--oxblood); }}
.rate-row .rate.pos {{ color: var(--moss-deep); }}

.verdict {{
    margin-top: 24px;
    padding: 26px 20px;
    background: var(--paper);
    border: 1px solid var(--rule);
    text-align: center;
    position: relative;
}}
.verdict::before, .verdict::after {{
    content: '§';
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 18px;
    color: var(--rule-soft);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}}
.verdict::before {{ left: 14px; }}
.verdict::after {{ right: 14px; }}
.verdict .headline {{
    font-family: 'Instrument Serif', serif;
    font-size: 30px;
    font-style: italic;
    line-height: 1.1;
    letter-spacing: -0.01em;
}}
.verdict .headline.good {{ color: var(--moss-deep); }}
.verdict .headline.bad {{ color: var(--oxblood); }}
.verdict .sub {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-top: 8px;
    font-weight: 500;
}}

/* ====== DOSSIER CONTENT ====== */
.dossier-stats {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    margin-top: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--rule-soft);
}}
.dossier-stat .k {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 4px;
    font-weight: 500;
}}
.dossier-stat .v {{
    font-family: 'Instrument Serif', serif;
    font-size: 36px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    font-style: italic;
}}
.dossier-stat .v.neg {{ color: var(--oxblood); }}
.dossier-stat .v.pos {{ color: var(--moss-deep); }}
.dossier-stat .v.alert {{ color: var(--amber-deep); }}

.rate-strip {{
    display: flex;
    gap: 48px;
    padding: 18px 0;
    border-bottom: 1px solid var(--rule-soft);
    font-size: 14px;
}}
.rate-strip .rate-item {{
    display: flex;
    align-items: baseline;
    gap: 10px;
}}
.rate-strip .k {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-mute);
}}
.rate-strip .v {{
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}}
.rate-strip .v.neg {{ color: var(--oxblood); }}
.rate-strip .v.pos {{ color: var(--moss-deep); }}

.context-block {{
    margin-top: 18px;
    padding: 20px 22px;
    background: var(--paper);
    border-left: 3px solid var(--oxblood);
    position: relative;
}}
.context-block .k {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--oxblood);
    font-weight: 700;
    margin-bottom: 8px;
}}
.context-block .v {{
    font-family: 'Fraunces', serif;
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink);
    font-style: italic;
}}

.nearby-block {{
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--rule-soft);
}}
.nearby-block .k {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 10px;
    font-weight: 600;
}}
.nearby-item {{
    display: flex;
    gap: 14px;
    padding: 6px 0;
    align-items: baseline;
    font-size: 14px;
}}
.nearby-item .yr {{
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    color: var(--oxblood);
    font-weight: 400;
    min-width: 56px;
}}

/* ====== LOADING ====== */
.loading {{
    grid-column: 1 / -1;
    padding: 60px 20px;
    text-align: center;
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 20px;
    color: var(--ink-mute);
}}
.loading::after {{
    content: ' ·';
    animation: ellipsis 1.4s infinite;
}}
@keyframes ellipsis {{
    0% {{ content: ' ·'; }}
    33% {{ content: ' · ·'; }}
    66% {{ content: ' · · ·'; }}
}}

/* ====== COLOPHON ====== */
.colophon {{
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 48px 60px;
    border-top: 2px solid var(--ink);
    position: relative;
    z-index: 2;
}}
.colophon-top {{
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 48px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--rule);
    margin-bottom: 18px;
}}
.colophon-section .title {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--ink-mute);
    margin-bottom: 10px;
    font-weight: 600;
}}
.colophon-section .body {{
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-soft);
    font-style: italic;
}}
.colophon-imprint {{
    font-family: 'Instrument Serif', serif;
    font-size: 64px;
    line-height: 0.9;
    font-style: italic;
    color: var(--ink);
    letter-spacing: -0.02em;
    margin-bottom: 8px;
}}
.colophon-mark {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-mute);
}}

@media (max-width: 900px) {{
    .masthead, .sheet, .colophon {{ padding-left: 24px; padding-right: 24px; }}
    .findings {{ grid-template-columns: 1fr 1fr; }}
    .finding {{ border-right: none; border-bottom: 1px solid var(--rule); }}
    .finding:nth-child(2n) {{ border-right: none; }}
    .finding:nth-child(odd) {{ border-right: 1px solid var(--rule); }}
    .dossier-stats {{ grid-template-columns: 1fr 1fr; gap: 20px; }}
    .split.active {{ grid-template-columns: 1fr; }}
    .panel {{ border-right: none; border-bottom: 1px solid var(--rule); }}
    .control-strip {{ grid-template-columns: 1fr; gap: 16px; }}
    .section-num {{ display: none; }}
    .dek {{ flex-direction: column; align-items: flex-start; }}
    .wordmark {{ font-size: 72px; }}
    .colophon-top {{ grid-template-columns: 1fr; }}
}}
</style>
</head>
<body>

<!-- ====== MASTHEAD ====== -->
<header class="masthead">
    <div class="masthead-top">
        <div class="vol">
            <span>Vol. I</span>
            <span>No. 001</span>
            <span>Standing at 58.1% Global Tree Cover</span>
        </div>
        <div>Filed via World Bank Open Data</div>
    </div>
    <div class="masthead-row">
        <h1 class="wordmark"><em>The</em> <span class="dispatch">Forest Dispatch</span></h1>
        <div class="dek-text">
            A record of what has been lost, and what — through the stroke of a pen or the
            press of a moratorium — may yet be saved.
        </div>
        <div class="dek-meta">
            An investigation<br>
            powered by Gradio<br>
            <span class="badge">MCP-enabled</span>
        </div>
    </div>
</header>

<main class="sheet">

    <!-- ====== CONTROL STRIP ====== -->
    <section class="control-strip">
        <div class="section-title">
            <span class="caps">§ Selection</span>
            Choose your <em>subject</em> &amp; <em>comparator</em>
        </div>
        <div class="control-group">
            <label>Subject</label>
            <select id="country"></select>
        </div>
        <div class="control-group">
            <label>Comparator</label>
            <select id="compare"><option value="">— none —</option></select>
        </div>
        <button class="action" onclick="loadData()">Investigate →</button>
    </section>

    <!-- ====== FIGURE (lead) ====== -->
    <section class="figure">
        <div class="figure-head">
            <div class="figure-title">Forest cover over time, <em>with policy annotations</em></div>
            <div class="figure-note">click · any · year · for · dossier</div>
        </div>
        <div class="figure-frame">
            <div id="chart-loading" class="figure-loading" style="display:none">Gathering field notes</div>
            <canvas id="chart"></canvas>
        </div>
        <div class="figure-caption">
            <span class="smallcaps">Legend —</span>
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--oxblood);vertical-align:middle;margin-right:4px"></span> policy event
            &nbsp;·&nbsp;
            <span style="display:inline-block;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid var(--amber);vertical-align:middle;margin-right:4px"></span> climate / disaster event
            &nbsp;·&nbsp;
            <span style="display:inline-block;width:12px;height:2px;background:var(--amber);vertical-align:middle;margin-right:4px"></span> rule of law
            <br>
            Hover the line to read an event. Click any year for a full dossier.
        </div>
    </section>

    <!-- ====== FINDINGS (after the chart) ====== -->
    <div id="findings-wrap" style="position:relative">
        <div id="findings" class="findings"></div>
    </div>

    <!-- ====== DOSSIER ====== -->
    <section id="dossier" class="dossier">
        <div class="dossier-label">Dossier</div>
        <div class="dossier-head" id="dossier-head"></div>
        <div id="dossier-content"></div>
    </section>

    <!-- ====== POLICY &amp; VERDICT ====== -->
    <div id="split" class="split">
        <div class="panel" id="policies"></div>
        <div class="panel" id="verdict-panel"></div>
    </div>

</main>

<!-- ====== COLOPHON ====== -->
<footer class="colophon">
    <div class="colophon-top">
        <div class="colophon-section">
            <div class="colophon-imprint">Notes.</div>
            <div class="body">
                <span class="smallcaps">On method —</span> Every figure herein is drawn from the public record. Where the policy
                register falls silent, we supply historical context in earnest italics —
                droughts, fires, wars, booms &amp; busts — to explain the line.
            </div>
        </div>
        <div class="colophon-section">
            <div class="title">Sources</div>
            <div class="body">
                <a href="https://data.worldbank.org/">World Bank Open Data</a> ·
                Forest area <span class="mono">(AG.LND.FRST.ZS)</span> ·
                Rule of Law <span class="mono">(RL.EST)</span>
            </div>
        </div>
        <div class="colophon-section">
            <div class="title">Built upon</div>
            <div class="body">
                <a href="https://gradio.app">Gradio Server</a> — API endpoints
                available at <span class="mono">/gradio_api/</span>,
                also exposed as MCP tools for agents.
            </div>
        </div>
    </div>
    <div class="colophon-mark">
        <span>© The Forest Dispatch · A record of loss &amp; recovery</span>
        <span>Set in Instrument Serif · Fraunces · JetBrains Mono</span>
    </div>
</footer>

<script>
const countries = {countries_json};
const countrySelect = document.getElementById('country');
const compareSelect = document.getElementById('compare');
let chart = null;
let currentData = null;

countries.forEach(c => {{
    countrySelect.add(new Option(c, c));
    compareSelect.add(new Option(c, c));
}});
countrySelect.value = 'Brazil';

async function callApi(name, params) {{
    const callResp = await fetch('/gradio_api/call/' + name, {{
        method: 'POST',
        headers: {{'Content-Type': 'application/json'}},
        body: JSON.stringify({{data: Object.values(params)}})
    }});
    const {{event_id}} = await callResp.json();
    if (!event_id) return {{error: 'No event id returned'}};

    const stream = await fetch('/gradio_api/call/' + name + '/' + event_id);
    const reader = stream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {{
        const {{done, value}} = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {{stream: true}});
        const lines = buffer.split('\\n');
        buffer = lines.pop();
        for (const line of lines) {{
            if (line.startsWith('event: complete')) continue;
            if (line.startsWith('data: ')) {{
                try {{
                    const parsed = JSON.parse(line.slice(6));
                    return Array.isArray(parsed) ? parsed[0] : parsed;
                }} catch (e) {{}}
            }}
        }}
    }}
    return {{error: 'No data received'}};
}}

async function loadData() {{
    const country = countrySelect.value;
    const compare = compareSelect.value;

    document.getElementById('findings').innerHTML = '<div class="loading">Gathering field notes</div>';
    document.getElementById('chart-loading').style.display = 'flex';
    document.getElementById('split').classList.remove('active');
    document.getElementById('dossier').style.display = 'none';
    if (chart) {{ chart.destroy(); chart = null; }}

    let data, compareData = null;
    if (compare && compare !== country) {{
        const result = await callApi('compare_countries', {{country_a: country, country_b: compare}});
        data = result.country_a;
        compareData = result.country_b;
    }} else {{
        data = await callApi('get_forest_data', {{country}});
    }}

    if (data.error) {{
        document.getElementById('findings').innerHTML = `<div class="loading">${{data.error}}</div>`;
        return;
    }}

    currentData = data;
    renderFindings(data);
    renderChart(data, compareData);
    renderPolicies(data);
    renderVerdict(data);
    document.getElementById('split').classList.add('active');
}}

function renderFindings(data) {{
    const s = data.summary;
    if (!s || !s.start_year) {{
        document.getElementById('findings').innerHTML = '<div class="loading">No data available for this subject</div>';
        return;
    }}
    const dirClass = s.change_pct < 0 ? 'down' : 'up';
    const sign = s.change_pct < 0 ? '−' : '+';
    const rateSign = s.annual_rate < 0 ? '−' : '+';

    document.getElementById('findings').innerHTML = `
        <div class="finding" data-num="i">
            <div>
                <div class="label">${{data.country}} · cover in ${{s.start_year}}</div>
                <div class="value">${{s.start_pct.toFixed(1)}}<span class="unit">%</span></div>
            </div>
            <div class="sub">of national land area</div>
        </div>
        <div class="finding" data-num="ii">
            <div>
                <div class="label">${{data.country}} · cover in ${{s.end_year}}</div>
                <div class="value">${{s.end_pct.toFixed(1)}}<span class="unit">%</span></div>
            </div>
            <div class="sub">of national land area</div>
        </div>
        <div class="finding" data-num="iii">
            <div>
                <div class="label">${{data.country}} · net change</div>
                <div class="value ${{dirClass}}">${{sign}}${{Math.abs(s.change_pct).toFixed(2)}}<span class="unit">pp</span></div>
            </div>
            <div class="sub">across ${{s.end_year - s.start_year}} years observed</div>
        </div>
        <div class="finding" data-num="iv">
            <div>
                <div class="label">${{data.country}} · annual rate</div>
                <div class="value ${{dirClass}}">${{rateSign}}${{Math.abs(s.annual_rate).toFixed(3)}}<span class="unit">%/yr</span></div>
            </div>
            <div class="sub">${{data.policies.length}} policies on record</div>
        </div>
    `;
}}

function renderChart(data, compareData) {{
    if (chart) chart.destroy();
    document.getElementById('chart-loading').style.display = 'none';

    const ctx = document.getElementById('chart').getContext('2d');
    const INK = '#1a1f18';
    const OXBLOOD = '#8b2a1f';
    const MOSS = '#4a6b3e';
    const AMBER = '#a8732a';
    const RULE = '#c5bda5';
    const PAPER_TINT = '#e4dbc5';

    const datasets = [{{
        label: data.country,
        data: data.forest.map(f => ({{x: f.year, y: f.value}})),
        borderColor: MOSS,
        backgroundColor: 'rgba(74, 107, 62, 0.12)',
        fill: true,
        tension: 0.25,
        pointRadius: 2.5,
        pointBackgroundColor: MOSS,
        pointBorderColor: PAPER_TINT,
        pointBorderWidth: 1,
        pointHoverRadius: 6,
        borderWidth: 2.2,
    }}];

    if (data.governance && data.governance.length) {{
        datasets.push({{
            label: 'Rule of Law',
            data: data.governance.map(g => ({{x: g.year, y: g.value}})),
            borderColor: AMBER,
            borderDash: [3, 3],
            borderWidth: 1.2,
            pointRadius: 0,
            tension: 0.3,
            yAxisID: 'y2',
        }});
    }}

    if (compareData && compareData.forest) {{
        datasets.push({{
            label: compareData.country,
            data: compareData.forest.map(f => ({{x: f.year, y: f.value}})),
            borderColor: OXBLOOD,
            borderDash: [6, 3],
            borderWidth: 1.8,
            pointRadius: 1.5,
            pointBackgroundColor: OXBLOOD,
            tension: 0.25,
        }});
    }}

    const annotations = {{}};
    (data.policies || []).forEach((p, i) => {{
        annotations['pline' + i] = {{
            type: 'line',
            xMin: p.year, xMax: p.year,
            borderColor: 'rgba(139, 42, 31, 0.22)',
            borderWidth: 1,
            borderDash: [3, 4],
        }};
        annotations['ppoint' + i] = {{
            type: 'point',
            xValue: p.year,
            yValue: data.forest.find(f => f.year === p.year)?.value || data.forest[0].value,
            radius: 5,
            backgroundColor: OXBLOOD,
            borderColor: PAPER_TINT,
            borderWidth: 2,
            hoverRadius: 8,
        }};
    }});
    (data.climate || []).forEach((c, i) => {{
        annotations['cline' + i] = {{
            type: 'line',
            xMin: c.year, xMax: c.year,
            borderColor: 'rgba(168, 115, 42, 0.22)',
            borderWidth: 1,
            borderDash: [1, 3],
        }};
        annotations['cpoint' + i] = {{
            type: 'point',
            xValue: c.year,
            yValue: data.forest.find(f => f.year === c.year)?.value || data.forest[0].value,
            radius: 6,
            pointStyle: 'triangle',
            backgroundColor: AMBER,
            borderColor: PAPER_TINT,
            borderWidth: 2,
            hoverRadius: 9,
        }};
    }});

    chart = new Chart(ctx, {{
        type: 'line',
        data: {{ datasets }},
        options: {{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {{ mode: 'index', intersect: false }},
            onClick: function(evt, elements) {{
                if (!elements.length) return;
                const el = elements[0];
                const ds = chart.data.datasets[el.datasetIndex];
                if (!ds.data[el.index]) return;
                const year = Math.round(ds.data[el.index].x);
                handlePointClick(year);
            }},
            plugins: {{
                legend: {{
                    labels: {{
                        color: INK,
                        font: {{ family: "'JetBrains Mono', monospace", size: 10, weight: 500 }},
                        usePointStyle: true,
                        pointStyle: 'rectRot',
                        boxWidth: 8,
                        padding: 16,
                    }}
                }},
                annotation: {{ annotations }},
                tooltip: {{
                    backgroundColor: INK,
                    titleColor: '#ede5d3',
                    bodyColor: '#ede5d3',
                    borderWidth: 0,
                    titleFont: {{ family: "'Instrument Serif', serif", style: 'italic', size: 16 }},
                    bodyFont: {{ family: "'JetBrains Mono', monospace", size: 11 }},
                    padding: 12,
                    cornerRadius: 0,
                    displayColors: false,
                    callbacks: {{
                        title: items => items.length ? Math.round(items[0].parsed.x).toString() : '',
                        label: function(ctx) {{
                            const v = ctx.parsed.y;
                            return ctx.dataset.label + ' · ' + (v != null ? v.toFixed(2) : '—');
                        }},
                        afterBody: function(items) {{
                            if (!items.length) return;
                            const year = Math.round(items[0].parsed.x);
                            const lines = [];
                            const policy = (data.policies || []).find(p => p.year === year);
                            const climateEv = (data.climate || []).find(c => c.year === year);
                            if (policy) lines.push('', '§ Policy — ' + policy.text);
                            if (climateEv) lines.push('', '△ Climate — ' + climateEv.text);
                            return lines;
                        }}
                    }}
                }}
            }},
            scales: {{
                x: {{
                    type: 'linear',
                    ticks: {{
                        color: '#6a6d60',
                        font: {{ family: "'JetBrains Mono', monospace", size: 10 }},
                        stepSize: 5,
                        callback: v => v.toString(),
                    }},
                    grid: {{ color: 'rgba(58, 63, 53, 0.1)', drawTicks: false }},
                    border: {{ color: INK, width: 1 }},
                }},
                y: {{
                    ticks: {{
                        color: MOSS,
                        font: {{ family: "'JetBrains Mono', monospace", size: 10 }},
                        callback: v => v.toFixed(1) + '%',
                    }},
                    grid: {{ color: 'rgba(58, 63, 53, 0.08)', drawTicks: false }},
                    border: {{ color: INK, width: 1 }},
                }},
                y2: {{
                    position: 'right',
                    ticks: {{
                        color: AMBER,
                        font: {{ family: "'JetBrains Mono', monospace", size: 9 }},
                    }},
                    grid: {{ display: false }},
                    border: {{ color: 'rgba(168, 115, 42, 0.4)' }},
                }}
            }}
        }}
    }});
}}

function renderPolicies(data) {{
    const el = document.getElementById('policies');
    if (!data.policies || !data.policies.length) {{
        el.innerHTML = `
            <div class="panel-head">
                <div class="panel-title">The Register · <em>${{data.country}}</em></div>
                <div class="panel-count">— empty —</div>
            </div>
            <div style="font-style:italic;color:var(--ink-mute);padding:16px 0">
                No policy events catalogued for ${{data.country}}.
            </div>`;
        return;
    }}
    const items = data.policies.map(p => {{
        const forestVal = data.forest.find(f => f.year === p.year);
        const forestText = forestVal ? forestVal.value.toFixed(1) + '%' : '—';
        const link = p.url ? `<a href="${{p.url}}" target="_blank" title="Source">↗</a>` : '';
        return `<div class="policy">
            <div class="policy-year">${{p.year}}</div>
            <div class="policy-text">${{p.text}}${{link}}</div>
            <div class="policy-metric">${{forestText}}</div>
        </div>`;
    }}).join('');
    el.innerHTML = `
        <div class="panel-head">
            <div class="panel-title">The Register · <em>${{data.country}}</em></div>
            <div class="panel-count">${{data.policies.length.toString().padStart(2, '0')}} entries</div>
        </div>
        ${{items}}`;
}}

function renderVerdict(data) {{
    const el = document.getElementById('verdict-panel');
    if (!data.policies || !data.policies.length || !data.forest.length) {{
        el.innerHTML = `
            <div class="panel-head">
                <div class="panel-title">The Verdict · <em>${{data.country}}</em></div>
                <div class="panel-count">— pending —</div>
            </div>
            <div style="font-style:italic;color:var(--ink-mute);padding:16px 0">
                Insufficient data for ${{data.country}} to render judgment.
            </div>`;
        return;
    }}
    const firstPolicy = data.policies[0].year;
    const pre = data.forest.filter(f => f.year < firstPolicy);
    const post = data.forest.filter(f => f.year >= firstPolicy);

    if (pre.length < 2 || post.length < 2) {{
        el.innerHTML = `
            <div class="panel-head">
                <div class="panel-title">The Verdict · <em>${{data.country}}</em></div>
                <div class="panel-count">— pending —</div>
            </div>
            <div style="font-style:italic;color:var(--ink-mute);padding:16px 0">
                Too few observations either side of intervention.
            </div>`;
        return;
    }}

    const preRate = (pre[pre.length-1].value - pre[0].value) / (pre[pre.length-1].year - pre[0].year);
    const postRate = (post[post.length-1].value - post[0].value) / (post[post.length-1].year - post[0].year);
    const improved = Math.abs(postRate) < Math.abs(preRate);
    const pct = preRate !== 0 ? ((1 - Math.abs(postRate) / Math.abs(preRate)) * 100) : 0;

    el.innerHTML = `
        <div class="panel-head">
            <div class="panel-title">The Verdict · <em>${{data.country}}</em></div>
            <div class="panel-count">Pre / Post · 1st intervention</div>
        </div>
        <div class="rate-row">
            <div class="stage">Pre</div>
            <div class="desc">${{pre[0].year}}–${{pre[pre.length-1].year}} · before first policy</div>
            <div class="rate ${{preRate < 0 ? 'neg' : 'pos'}}">${{preRate > 0 ? '+' : ''}}${{preRate.toFixed(3)}}%/yr</div>
        </div>
        <div class="rate-row">
            <div class="stage">Post</div>
            <div class="desc">${{post[0].year}}–${{post[post.length-1].year}} · since first policy</div>
            <div class="rate ${{postRate < 0 ? 'neg' : 'pos'}}">${{postRate > 0 ? '+' : ''}}${{postRate.toFixed(3)}}%/yr</div>
        </div>
        <div class="verdict">
            <div class="headline ${{improved ? 'good' : 'bad'}}">
                ${{improved ? data.country + ' slowed by ' + Math.abs(pct).toFixed(0) + '%' : data.country + ': no improvement'}}
            </div>
            <div class="sub">${{improved ? 'after policy intervention' : 'rate unchanged or worsened'}}</div>
        </div>
    `;
}}

async function handlePointClick(year) {{
    const country = countrySelect.value;
    const dossierEl = document.getElementById('dossier');
    const headEl = document.getElementById('dossier-head');
    const contentEl = document.getElementById('dossier-content');
    dossierEl.style.display = 'block';
    dossierEl.scrollIntoView({{ behavior: 'smooth', block: 'nearest' }});
    headEl.innerHTML = `Filing dossier for <em>${{year}}</em>`;
    contentEl.innerHTML = '<div style="font-style:italic;color:var(--ink-mute);padding:14px 0">Compiling field notes…</div>';

    const result = await callApi('explain_spike', {{country, year}});
    if (result.error) {{
        contentEl.innerHTML = '<div style="color:var(--oxblood);font-style:italic">' + result.error + '</div>';
        return;
    }}

    const trendClass = (() => {{
        if (['sharp decline', 'acceleration'].includes(result.trend)) return 'neg';
        if (['recovery', 'sharp increase'].includes(result.trend)) return 'pos';
        return 'alert';
    }})();

    headEl.innerHTML = `Dossier · <em>${{country}}</em> · ${{result.year}}`;

    let html = `
        <div class="dossier-stats">
            <div class="dossier-stat">
                <div class="k">Year</div>
                <div class="v">${{result.year}}</div>
            </div>
            <div class="dossier-stat">
                <div class="k">Forest cover</div>
                <div class="v">${{result.forest_pct !== null ? result.forest_pct.toFixed(2) + '%' : '—'}}</div>
            </div>
            <div class="dossier-stat">
                <div class="k">Year-on-year</div>
                <div class="v ${{result.yoy_change !== null && result.yoy_change < 0 ? 'neg' : (result.yoy_change > 0 ? 'pos' : '')}}">${{result.yoy_change !== null ? (result.yoy_change > 0 ? '+' : '') + result.yoy_change.toFixed(3) + 'pp' : '—'}}</div>
            </div>
            <div class="dossier-stat">
                <div class="k">Trend</div>
                <div class="v ${{trendClass}}">${{result.trend}}</div>
            </div>
        </div>
    `;

    if (result.rate_5yr_before !== null || result.rate_5yr_after !== null) {{
        html += `<div class="rate-strip">`;
        if (result.rate_5yr_before !== null) {{
            html += `<div class="rate-item"><span class="k">5yr · before</span><span class="v ${{result.rate_5yr_before < 0 ? 'neg' : 'pos'}}">${{result.rate_5yr_before > 0 ? '+' : ''}}${{result.rate_5yr_before}}%/yr</span></div>`;
        }}
        if (result.rate_5yr_after !== null) {{
            html += `<div class="rate-item"><span class="k">5yr · after</span><span class="v ${{result.rate_5yr_after < 0 ? 'neg' : 'pos'}}">${{result.rate_5yr_after > 0 ? '+' : ''}}${{result.rate_5yr_after}}%/yr</span></div>`;
        }}
        html += `</div>`;
    }}

    if (result.context) {{
        html += `<div class="context-block">
            <div class="k">Field note · historical context</div>
            <div class="v">${{result.context}}</div>
        </div>`;
    }}

    if (result.nearby_policies && result.nearby_policies.length) {{
        html += `<div class="nearby-block">
            <div class="k">§ Nearby policy events · ±3 years</div>`;
        result.nearby_policies.forEach(p => {{
            const pLink = p.url ? ` <a href="${{p.url}}" target="_blank" style="color:var(--ink-mute);font-size:11px">↗</a>` : '';
            html += `<div class="nearby-item"><span class="yr">${{p.year}}</span><span>${{p.text}}${{pLink}}</span></div>`;
        }});
        html += `</div>`;
    }}

    if (result.nearby_climate && result.nearby_climate.length) {{
        html += `<div class="nearby-block">
            <div class="k" style="color:var(--amber-deep)">△ Nearby climate events · ±3 years</div>`;
        result.nearby_climate.forEach(c => {{
            const cLink = c.url ? ` <a href="${{c.url}}" target="_blank" style="color:var(--ink-mute);font-size:11px">↗</a>` : '';
            html += `<div class="nearby-item"><span class="yr" style="color:var(--amber-deep)">${{c.year}}</span><span>${{c.text}}${{cLink}}</span></div>`;
        }});
        html += `</div>`;
    }}

    contentEl.innerHTML = html;
}}

loadData();
</script>
</body>
</html>"""


if __name__ == "__main__":
    app.launch(mcp_server=True)
