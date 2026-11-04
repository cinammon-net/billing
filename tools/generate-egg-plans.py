#!/usr/bin/env python3
"""Genera database/seeders/data/egg-plans.php: un plan por cada egg de cinammon-net/eggs
que no tenga ya un plan escrito a mano en PlanSeeder.php.

Uso:  python3 tools/generate-egg-plans.py [ruta-al-repo-eggs]   (por defecto ../eggs)

- Categoría de la tienda según el tipo de juego (listas de abajo).
- RAM según lo que pide cada egg (excepciones conocidas) o un valor por categoría.
- Precio/CPU/disco salen de la RAM con la misma escala que los planes existentes.
"""
import glob
import json
import os
import re
import sys

BILLING = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EGGS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BILLING, "..", "eggs")

SURVIVAL = """7 Days To Die|ARK: Survival Ascended|Ark: Survival Evolved|Abiotic Factor|Citadel: Forged with Fire|Conan Exiles|
Craftopia|CryoFall|DayZ|DayZ (Experimental)|Dead Matter|Empyrion: Galactic Survival|Enshrouded|Frozen Flame|HumanitZ|Hurtworld|
Longvinter|Myth of Empires|Night Of The Dead|Nightingale|No One Survived|Palworld|Palworld Proton|PixARK|Plains of Pain|
Project Zomboid|Rust|Rust Autowipe|Rust Staging|Smalland: Survive the Wilds|Solace Crafting|Sons Of The Forest|Soulmask|
StarRupture|The Forest|The Front|The Isle|The Lord of the Rings: Return to Moria|Unturned|V Rising|V Rising BepInEx|VEIN|
Valheim|Valheim BepINex|Valheim Plus Mod|Voyagers of Nera|Windrose|Zombie Survival Game Online|Subnautica|
RuneScape: Dragonwilds|Path Of Titans"""
SHOOTERS = """AssaultCube|Arma 3|Arma Reforger|BATTALION: Legacy|Black Mesa|CS2D|Counter-Strike 2|Counter-Strike: Source|
Cube 2: Sauerbraten|Custom HLDS Engine Game|Custom ReHLDS Engine Game|ET Legacy|Fof|Ground Branch|Holdfast NaW|
Insurgency: Sandstorm|Killing Floor 2|Left 4 Dead|Left 4 Dead 2|Mordhau|Mordhau Wine|nmrih|Open Fortress|OpenArena|
Operation Harsh Doorstop|Pavlov VR|Post Scriptum|Quake Live|SCP:SL|Soldat|SourceCoop|Squad|Sven Co-op|
Team Fortress 2 Classic|The Ship: Murder Party|Urban Terror|Xonotic|Zandronum|mohaa|Nazi Zombies: Portable|
Midnight Ghost Hunt|Venice Unleashed|Single Player Tarkov|Stay In Tarkov|No Love Lost"""
SANDBOX = """Astro Colony|Astroneer Dedicated Server|Avorion|Barotrauma|Brickadia|ClassiCube(MGC)|Clusterio|Colony Survival|
Core Keeper|Cubic Odyssey|Don't Starve Together|Eco|Factorio|Factorio ARM64|Factorio-ModUpdate|Foundry|
Garry's Mod - Reworked|KSP DMP|Mindustry|Minetest|Modiverse|Necesse|NeosVR|Resonite|Rimworld Together|
Rimworld: Open World|Rising World Java Legacy|Rising World Unity|Satisfactory|Space Engineers|
Space Engineers - Torch Server|Space Station 14|Starbound|starmade|Stationeers|Stationeers (BepInEx)|
Swords 'n Magic and Stuff|TerraTech Worlds|Terraria Vanilla|tModloader|tshock|tshock legacy|Tiny Block Server|
Vintage Story|Veloren|Wurm Unlimited|Portal Knights|OpenRCT2|OpenTTD|Tower Unite"""
SIMULATION = """American Truck Simulator Dedicated Server|Assetto Corsa|Assetto Corsa (Freeroam + AI)|BeamMP Servers|
KissMP Server|Euro Truck Simulator 2 Dedicated server|Stormworks: Build and Rescue|Trackmania (2020)|Wreckfest 2|The Bus"""
ROLEPLAY = """FiveM|RedM|alt:V|Multi Theft Auto|SA-MP|OpenMP|Rage.MP|RageCOOP|Grand Theft Auto Connected|Hogwarp|Onset|
Nova-Life: Amboise|LAC-Online Public Server"""


def names(block: str) -> set:
    return {n.strip() for n in block.replace("\n", "").split("|") if n.strip()}


GAME_CATEGORY = {}
for cat, block in (("survival", SURVIVAL), ("shooters", SHOOTERS), ("sandbox", SANDBOX), ("simulation", SIMULATION), ("roleplay", ROLEPLAY)):
    for n in names(block):
        GAME_CATEGORY[n] = cat

# RAM (GB) conocida por egg; el resto usa el valor por categoría.
RAM = {
    "ARK: Survival Ascended": 12, "Ark: Survival Evolved": 8, "PixARK": 8, "Satisfactory": 8, "Palworld": 8, "Palworld Proton": 8,
    "Rust": 8, "Rust Autowipe": 8, "Rust Staging": 8, "Conan Exiles": 6, "Soulmask": 8, "Nightingale": 8, "The Front": 8,
    "Myth of Empires": 8, "Dead Matter": 8, "Empyrion: Galactic Survival": 6, "Space Engineers": 6, "Space Engineers - Torch Server": 8,
    "Squad": 6, "Post Scriptum": 6, "Arma Reforger": 6, "Arma 3": 4, "Counter-Strike 2": 4, "Vintage Story": 4, "Valheim": 4,
    "Valheim BepINex": 6, "Valheim Plus Mod": 6, "Unturned": 2, "The Forest": 3, "Barotrauma": 2, "Factorio": 2, "Factorio ARM64": 2,
    "Factorio-ModUpdate": 2, "Clusterio": 4, "Mindustry": 1, "Terraria Vanilla": 1, "tshock": 1, "tshock legacy": 1, "tModloader": 2,
    "Starbound": 2, "Don't Starve Together": 2, "OpenTTD": 1, "OpenRCT2": 1, "Minetest": 1, "Veloren": 2, "Space Station 14": 2,
    "SA-MP": 1, "OpenMP": 1, "Multi Theft Auto": 1, "FiveM": 4, "RedM": 4, "alt:V": 4, "Rage.MP": 4, "RageCOOP": 2,
    "Grand Theft Auto Connected": 2, "Hogwarp": 2, "Onset": 2, "Nova-Life: Amboise": 3, "LAC-Online Public Server": 1,
    "Assetto Corsa": 2, "Assetto Corsa (Freeroam + AI)": 3, "BeamMP Servers": 2, "KissMP Server": 2, "Trackmania (2020)": 1,
    "Wreckfest 2": 3, "The Bus": 3, "Stormworks: Build and Rescue": 3,
    "Among Us - Impostor Server": 0.5, "BetterCrewlink Server": 0.5, "Crewlink server": 0.5, "SuperTuxKart": 1, "Teeworlds": 0.5,
    "DDNet": 0.5, "DDRaceNetwork": 0.5, "The Battle for Wesnoth": 1, "OpenRA": 1, "OpenRA - Dune2000": 1, "OpenRA - Tiberian Dawn": 1,
    "Foundry VTT": 1, "Risk of Rain 2": 2, "Mount & Blade II: Bannerlord": 4, "Neverwinter Nights: Enhanced Edition": 1, "Clone Hero": 0.5,
    "AssaultCube": 0.5, "CS2D": 0.5, "Cube 2: Sauerbraten": 0.5, "OpenArena": 0.5, "Xonotic": 1, "Zandronum": 0.5, "Urban Terror": 1,
    "Soldat": 0.5, "Quake Live": 1, "ET Legacy": 1, "mohaa": 1, "Nazi Zombies: Portable": 0.5, "Counter-Strike: Source": 2,
}
DEFAULT_RAM = {"survival": 6, "shooters": 3, "sandbox": 4, "simulation": 3, "roleplay": 2, "arcade": 1}

# Escala por RAM: (precio €/mes, cpu %, disco GB)
SCALE = {0.5: (0.99, 50, 5), 1: (1.49, 75, 10), 2: (1.99, 100, 15), 3: (2.99, 150, 20), 4: (3.99, 200, 30),
         6: (5.99, 250, 40), 8: (7.49, 300, 50), 12: (11.99, 400, 80), 16: (15.99, 400, 100)}


def minecraft_ram(name: str) -> float:
    n = name.lower()
    if any(k in n for k in ("velocity", "bungee", "waterfall", "waterdog", "travertine", "limbo", "viaproxy", "viaaas", "vanillacord", "always auth")):
        return 1
    if any(k in n for k in ("bedrock", "nukkit", "pocketmine", "gomint", "powernukkit", "liteloader")):
        return 2
    if any(k in n for k in ("ftb", "feed the beast", "tekkit", "curseforge", "modrinth", "forge", "neoforge", "magma", "mohist",
                            "ketting", "sponge", "hexxit", "blightfall", "b-team", "1.12.2 pack", "1.7.10 pack", "revelation")):
        return 6
    return 4


SOFTWARE_RAM = {"Elasticsearch": 4, "Code-Server": 2, "Meilisearch": 2, "Forgejo": 1, "Gitea": 1, "Grafana": 1, "Loki": 1,
                "Prometheus": 1, "RabbitMQ": 1, "Minio S3": 1, "LanguageTool": 2, "Folding@Home": 2, "Reposilite": 1}


def plan_for(folder: str, name: str):
    """(categoría tienda, RAM GB) o None si el egg no se vende."""
    if folder == "games":
        cat = GAME_CATEGORY.get(name, "arcade")
        return cat, RAM.get(name, DEFAULT_RAM[cat])
    if folder == "minecraft":
        return "minecraft", minecraft_ram(name)
    if folder in ("bots", "generic"):
        return "bots", 1
    if folder == "database":
        return "databases", 1
    if folder == "voice":
        return "voice", 0.5 if "teamspeak" in name.lower() or "teaspeak" in name.lower() else 1
    if folder == "software":
        return "software", SOFTWARE_RAM.get(name, 1)
    if folder == "web":
        return "web", 1
    return None


def display_name(name: str) -> str:
    n = re.sub(r"\s+(dedicated server|dedicated|server|servers|public server)$", "", name.strip(), flags=re.I)
    n = re.sub(r"\s+generic$", "", n, flags=re.I)
    return n[:60] or name[:60]


def php(value) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return repr(value)
    return "'" + str(value).replace("\\", "\\\\").replace("'", "\\'") + "'"


def main() -> int:
    seeder = open(os.path.join(BILLING, "database", "seeders", "PlanSeeder.php"), encoding="utf-8").read()
    manual = {a or b for a, b in re.findall(r"'egg' => (?:'((?:[^'\\]|\\.)*)'|\"([^\"]*)\")", seeder)}
    manual = {m.replace("\\'", "'") for m in manual}

    rows, used = [], set()
    for path in sorted(glob.glob(os.path.join(EGGS, "*", "*.json"))):
        folder = os.path.basename(os.path.dirname(path))
        if folder in ("tools", "docs"):
            continue
        name = json.load(open(path, encoding="utf-8")).get("name", "").strip()
        if not name or name in manual:
            continue
        spec = plan_for(folder, name)
        if not spec:
            continue
        cat, ram = spec
        price, cpu, disk = SCALE[ram]
        label = display_name(name)
        key = (cat, label.lower())
        if key in used:
            label = name[:60]
            key = (cat, label.lower())
        used.add(key)
        rows.append({"category": cat, "egg": name, "name": label, "ram_mb": int(ram * 1024), "cpu_pct": cpu,
                     "storage_gb": disk, "price": price, "popular": False})

    out = os.path.join(BILLING, "database", "seeders", "data", "egg-plans.php")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("<?php\n\n// GENERADO por tools/generate-egg-plans.py a partir de cinammon-net/eggs. No editar a mano.\n// Un plan por cada egg que no tiene plan escrito en PlanSeeder.php.\n\nreturn [\n")
        for r in sorted(rows, key=lambda r: (r["category"], r["name"].lower())):
            fh.write("    [" + ", ".join(f"'{k}' => {php(v)}" for k, v in r.items()) + "],\n")
        fh.write("];\n")
    by = {}
    for r in rows:
        by[r["category"]] = by.get(r["category"], 0) + 1
    print(f"{len(rows)} planes generados ({len(manual)} ya escritos a mano) -> {out}")
    print("  " + ", ".join(f"{k}: {v}" for k, v in sorted(by.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
