export interface TheaterForce {
  label: string;
  equipmentLosses: number | string;
  tankLosses: number | string;
  armoredLosses: number | string;
  casualties: string;
  killed: string;
}

export interface TheaterSector {
  name: string;
  value: number;
}

export interface Theater {
  id: string;
  short: string;
  codename: string;
  title: string;
  region: string;
  classification: string;
  sourceDiscipline: string;
  overview: string;
  friendly: TheaterForce;
  opposing: TheaterForce;
  indicators: string[];
  sectors: TheaterSector[];
  sources: string[];
  statusLine: string;
}

export const THEATERS: Record<string, Theater> = {
  iran: {
    id: "iran",
    short: "Iran",
    codename: "MANTLE",
    title: "IRAN REGIONAL WAR GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // RAPID UPDATE",
    sourceDiscipline: "Claims separated from confirmed strike effects",
    overview:
      "Tracks strategic strikes, retaliation risk, Hormuz disruption, regional militia activity, and spillover into Lebanon, Iraq, Syria, and Gulf infrastructure.",
    friendly: {
      label: "U.S. / Israel Alignment",
      equipmentLosses: "Mixed reporting",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Mixed official / media reporting",
      killed: "Mixed official / media reporting",
    },
    opposing: {
      label: "Iran / Aligned Network",
      equipmentLosses: "Mixed reporting",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Mixed official / media reporting",
      killed: "Mixed official / media reporting",
    },
    indicators: [
      "Hormuz access and maritime threat posture remain core escalation drivers.",
      "Lebanon and militia-linked spillover risk remain elevated.",
      "Critical infrastructure targeting would materially widen civilian and economic damage.",
      "Narrative volatility is high; claims must be separated from confirmed strike effects.",
    ],
    sectors: [
      { name: "Regional Escalation", value: 94 },
      { name: "Maritime Disruption", value: 92 },
      { name: "Infrastructure Risk", value: 88 },
      { name: "Information Certainty", value: 52 },
    ],
    sources: [
      "Official state statements",
      "Major wire reporting",
      "Regional strike reporting",
      "Maritime disruption signals",
    ],
    statusLine:
      "Active regional war environment with high narrative volatility and cross-front escalation risk.",
  },
  ukraine: {
    id: "ukraine",
    short: "Ukraine",
    codename: "ANVIL",
    title: "UKRAINE ATTRITION GRID",
    region: "Europe",
    classification: "OPEN SOURCE // COMPILED BATTLE LEDGER",
    sourceDiscipline: "Equipment visuals stronger than casualty certainty",
    overview:
      "Tracks attrition, infrastructure stress, localized advances, equipment-loss comparisons, and evolving operational pressure across the Russia-Ukraine war.",
    friendly: {
      label: "Ukraine",
      equipmentLosses: 11757,
      tankLosses: 1405,
      armoredLosses: 5709,
      casualties: "500k–600k est.",
      killed: "100k–140k est.",
    },
    opposing: {
      label: "Russia",
      equipmentLosses: 24383,
      tankLosses: 4371,
      armoredLosses: 13978,
      casualties: "1.1m–1.4m est.",
      killed: "230k–430k est.",
    },
    indicators: [
      "Localized Russian advances remain key short-horizon indicators in eastern sectors.",
      "Infrastructure stress remains strategically important after repeated strike waves.",
      "Equipment-loss visuals favor Ukraine on relative attrition, but not all battlefield losses are visible.",
      "Casualty figures remain estimate-driven and should be treated as ranges.",
    ],
    sectors: [
      { name: "Equipment Attrition", value: 82 },
      { name: "Infrastructure Stress", value: 91 },
      { name: "Territorial Pressure", value: 68 },
      { name: "Information Certainty", value: 54 },
    ],
    sources: [
      "Visually confirmed equipment tracking",
      "Compiled estimate reporting",
      "Infrastructure attack reporting",
    ],
    statusLine:
      "Attritional war with persistent infrastructure pressure and mixed-certainty casualty reporting.",
  },
  gaza: {
    id: "gaza",
    short: "Gaza",
    codename: "EMBER",
    title: "GAZA URBAN STRIKE GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // FRAGMENTED REPORTING",
    sourceDiscipline: "Urban conflict claims require hard-source review",
    overview:
      "Tracks strike density, humanitarian pressure, urban battlespace stress, hostage-linked developments, and claim-vs-confirmed separation.",
    friendly: {
      label: "Israel",
      equipmentLosses: 421,
      tankLosses: 37,
      armoredLosses: 118,
      casualties: "Classified / mixed reporting",
      killed: "Mixed official release",
    },
    opposing: {
      label: "Hamas / Allied Militants",
      equipmentLosses: 1930,
      tankLosses: 0,
      armoredLosses: 0,
      casualties: "Heavily disputed",
      killed: "Heavily disputed",
    },
    indicators: [
      "Humanitarian corridor pressure can alter tempo quickly.",
      "Urban strike density and hostage-related developments remain escalation pivots.",
      "Claim inflation risk is high; battle damage assessment needs hard-source review.",
      "Civilian-impact tracking is central, not peripheral.",
    ],
    sectors: [
      { name: "Strike Density", value: 89 },
      { name: "Civilian Impact Risk", value: 95 },
      { name: "Territorial Fluidity", value: 61 },
      { name: "Information Certainty", value: 38 },
    ],
    sources: [
      "Official military statements",
      "Humanitarian reporting",
      "Urban strike reporting",
    ],
    statusLine:
      "Compressed urban conflict with severe civilian-impact sensitivity and fragmented information certainty.",
  },
  lebanon: {
    id: "lebanon",
    short: "Lebanon",
    codename: "CEDAR",
    title: "LEBANON NORTHERN FRONT",
    region: "Middle East",
    classification: "OPEN SOURCE // ACTIVE FRONT",
    sourceDiscipline: "Cross-front linkage with Iran theater",
    overview:
      "Tracks Israel-Hezbollah escalation, Beirut strike activity, southern front movement, and displacement pressure as the northern front remains volatile.",
    friendly: {
      label: "Israel",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Official + media reporting",
      killed: "Official + media reporting",
    },
    opposing: {
      label: "Hezbollah / Aligned Units",
      equipmentLosses: "Mixed reporting",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Beirut strike patterns indicate widening operational willingness.",
      "Southern-front buffer or security-zone logic could sustain escalation.",
      "Civilian displacement remains strategically significant.",
      "Iran war spillover directly affects this front.",
    ],
    sectors: [
      { name: "Airstrike Pressure", value: 87 },
      { name: "Border Instability", value: 90 },
      { name: "Civilian Displacement", value: 84 },
      { name: "Information Certainty", value: 58 },
    ],
    sources: [
      "Frontline strike reporting",
      "Border incident reporting",
      "Displacement reporting",
    ],
    statusLine:
      "Volatile northern front tightly linked to the broader Iran escalation environment.",
  },
  syria: {
    id: "syria",
    short: "Syria",
    codename: "MOSAIC",
    title: "SYRIA MULTI-ACTOR GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // MULTI-ACTOR",
    sourceDiscipline: "Attribution certainty often degraded",
    overview:
      "Tracks a fragmented multi-actor environment with regime, militia, foreign, and insurgent dimensions, plus spillover from the broader Iran-aligned confrontation space.",
    friendly: {
      label: "State / Partner Forces",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    opposing: {
      label: "Militia / Insurgent / Rival Forces",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Regional strike spillover can alter the Syria picture quickly.",
      "Militia-linked movement remains a key signal layer.",
      "Actor count makes clean attribution difficult.",
      "Backend actor-tagging would materially improve this theater.",
    ],
    sectors: [
      { name: "Actor Fragmentation", value: 93 },
      { name: "Strike Spillover", value: 79 },
      { name: "Territorial Complexity", value: 86 },
      { name: "Information Certainty", value: 43 },
    ],
    sources: [
      "Regional strike reporting",
      "Militia activity reporting",
      "Multi-actor incident logs",
    ],
    statusLine:
      "Fragmented battlespace where attribution, control, and spillover must be monitored together.",
  },
  yemen: {
    id: "yemen",
    short: "Yemen",
    codename: "CHOKEPOINT",
    title: "RED SEA / YEMEN MARITIME GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // MARITIME THREAT",
    sourceDiscipline: "System effects matter beyond direct casualty counts",
    overview:
      "Tracks Red Sea disruption, Yemen-based strike risk, maritime chokepoint pressure, and broader regional effects on trade and military posture.",
    friendly: {
      label: "U.S. / Partner Maritime Posture",
      equipmentLosses: "Mixed reporting",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    opposing: {
      label: "Houthi-Aligned Forces",
      equipmentLosses: "Mixed reporting",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Shipping disruption can create outsized global-system effects.",
      "Red Sea operations should be read alongside the Iran card.",
      "Maritime insurance and route diversion are relevant operational indicators.",
      "Strike tempo is not the only metric; chokepoint control matters.",
    ],
    sectors: [
      { name: "Shipping Risk", value: 91 },
      { name: "Strike Threat", value: 74 },
      { name: "Regional Linkage", value: 89 },
      { name: "Information Certainty", value: 57 },
    ],
    sources: [
      "Shipping incident reporting",
      "Strike reporting",
      "Route diversion signals",
    ],
    statusLine:
      "Maritime theater where chokepoint pressure and system disruption are first-order indicators.",
  },
  sudan: {
    id: "sudan",
    short: "Sudan",
    codename: "FRACTURE",
    title: "SUDAN COLLAPSE GRID",
    region: "Africa",
    classification: "OPEN SOURCE // HUMANITARIAN CRISIS",
    sourceDiscipline: "Civilian exposure often clearer than force tallies",
    overview:
      "Tracks one of the world's most severe active wars: urban fighting, territorial fragmentation, civilian displacement, and collapse-level humanitarian stress.",
    friendly: {
      label: "SAF / Aligned Elements",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    opposing: {
      label: "RSF / Allied Elements",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Humanitarian and battlefield deterioration are tightly linked.",
      "Territorial control can shift with limited warning.",
      "Civilian exposure is a first-order signal here.",
      "This theater deserves a dedicated humanitarian-stress layer.",
    ],
    sectors: [
      { name: "State Breakdown", value: 96 },
      { name: "Civilian Exposure", value: 97 },
      { name: "Territorial Fragmentation", value: 88 },
      { name: "Information Certainty", value: 47 },
    ],
    sources: [
      "Humanitarian reporting",
      "Urban combat reporting",
      "Displacement reporting",
    ],
    statusLine:
      "Collapse-pressure conflict where humanitarian stress and territorial fragmentation move together.",
  },
  myanmar: {
    id: "myanmar",
    short: "Myanmar",
    codename: "DELTA",
    title: "MYANMAR MULTI-FRONT GRID",
    region: "Asia",
    classification: "OPEN SOURCE // TERRITORIAL CONTEST",
    sourceDiscipline: "Sub-theaters matter more than headline summary",
    overview:
      "Tracks insurgent expansion, junta operations, airpower usage, and fluctuating territorial control across a multi-front conflict system.",
    friendly: {
      label: "Junta-Aligned Forces",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    opposing: {
      label: "Resistance / Ethnic Armed Groups",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Territorial control should be tracked as a layered map problem.",
      "Airstrikes and reprisals remain important indicators.",
      "Actor diversity makes simple two-side framing weak.",
      "Backend sub-theater filtering would improve usability.",
    ],
    sectors: [
      { name: "Insurgent Momentum", value: 84 },
      { name: "Airpower Pressure", value: 73 },
      { name: "Territorial Complexity", value: 92 },
      { name: "Information Certainty", value: 45 },
    ],
    sources: [
      "Territorial control reporting",
      "Airstrike reporting",
      "Sub-theater conflict updates",
    ],
    statusLine:
      "Diffuse war where actor diversity and territorial layering drive the real picture.",
  },
  drc: {
    id: "drc",
    short: "Eastern DRC",
    codename: "RIFT",
    title: "EASTERN DRC REBEL GRID",
    region: "Africa",
    classification: "OPEN SOURCE // REGIONALIZED INSTABILITY",
    sourceDiscipline: "Movement and displacement signals often outrank force counts",
    overview:
      "Tracks rebel pressure, displacement, regional spillover, and contested control in eastern Congo, where local conflict has wider regional consequences.",
    friendly: {
      label: "DRC / Partner Forces",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    opposing: {
      label: "Rebel / Aligned Armed Groups",
      equipmentLosses: "Mixed reporting",
      tankLosses: "Mixed reporting",
      armoredLosses: "Mixed reporting",
      casualties: "Mixed reporting",
      killed: "Mixed reporting",
    },
    indicators: [
      "Displacement and territorial shifts should be read together.",
      "Regional linkage makes this more than a purely local fight.",
      "Infrastructure and route control are key indicators.",
      "Backend regional overlays would improve this card.",
    ],
    sectors: [
      { name: "Rebel Pressure", value: 83 },
      { name: "Civilian Displacement", value: 90 },
      { name: "Regional Spillover", value: 71 },
      { name: "Information Certainty", value: 49 },
    ],
    sources: [
      "Displacement reporting",
      "Route-control signals",
      "Regional security reporting",
    ],
    statusLine:
      "Regionalized local war where movement corridors and civilian displacement are core signals.",
  },
  taiwan: {
    id: "taiwan",
    short: "Taiwan",
    codename: "RING",
    title: "TAIWAN CONTINGENCY GRID",
    region: "Asia-Pacific",
    classification: "OPEN SOURCE // WARNING MODEL",
    sourceDiscipline: "Warning indicators outrank loss-ledger logic",
    overview:
      "Tracks sorties, exercises, naval presence, air-defense tempo, logistics posture, and escalation indicators rather than a conventional hot-war ledger.",
    friendly: {
      label: "Taiwan / Partners",
      equipmentLosses: 0,
      tankLosses: 0,
      armoredLosses: 0,
      casualties: "N/A",
      killed: "N/A",
    },
    opposing: {
      label: "PRC Forces",
      equipmentLosses: 0,
      tankLosses: 0,
      armoredLosses: 0,
      casualties: "N/A",
      killed: "N/A",
    },
    indicators: [
      "Sortie spikes, maritime encirclement patterns, and logistics staging matter more than casualty counts.",
      "Political messaging and force-dispersal timing are key warning indicators.",
      "Exercise tempo should be scored against baselines.",
      "This theater should emphasize forward-risk modeling over damage reporting.",
    ],
    sectors: [
      { name: "Mobilization Signal", value: 71 },
      { name: "Naval Pressure", value: 77 },
      { name: "Airspace Tempo", value: 74 },
      { name: "Information Certainty", value: 66 },
    ],
    sources: [
      "Exercise reporting",
      "Military activity tracking",
      "Regional signaling indicators",
    ],
    statusLine:
      "Pre-contact warning theater driven by mobilization and signaling rather than losses.",
  },
};

export const THEATER_ORDER = [
  "iran",
  "ukraine",
  "gaza",
  "lebanon",
  "syria",
  "yemen",
  "sudan",
  "myanmar",
  "drc",
  "taiwan",
];

export const POSTURE_MAP: Record<string, string[]> = {
  iran: ["REGIONAL WAR", "ESCALATION WAVE", "CRITICAL CHOKEPOINT PRESSURE"],
  ukraine: ["ATTRITION LOCK", "CONTESTED PRESSURE", "INFRASTRUCTURE STRAIN"],
  gaza: ["URBAN STRIKE PRESSURE", "HIGH-HEAT URBAN GRID", "HUMANITARIAN CRITICAL"],
  lebanon: ["BORDER ESCALATION", "NORTHERN FRONT PRESSURE", "DISPLACEMENT SURGE"],
  syria: ["MULTI-ACTOR FRAGMENT", "REGIONAL SPILLOVER", "MILITIA GRIDLOCK"],
  yemen: ["MARITIME THREAT", "SHIPPING DISRUPTION", "CHOKEPOINT PRESSURE"],
  sudan: ["STATE COLLAPSE PRESSURE", "HUMANITARIAN BREAKDOWN", "MULTI-FRONT FRACTURE"],
  myanmar: ["INSURGENCY EXPANSION", "MULTI-FRONT PRESSURE", "AIRPOWER SUPPRESSION"],
  drc: ["REBEL PRESSURE", "REGIONALIZED INSTABILITY", "DISPLACEMENT SURGE"],
  taiwan: ["PRE-CONTACT TENSION", "ESCALATION WATCH", "MOBILIZATION SIGNAL"],
};

export const CONFIDENCE_MAP: Record<string, string[]> = {
  iran: ["B / FAST-MOVING", "B- / FAST-MOVING", "C+ / CLAIM-HEAVY"],
  ukraine: ["B / MIXED", "B- / MIXED", "B / VERIFIED-MIX"],
  gaza: ["C / FRAGMENTED", "C- / FRAGMENTED", "C / MIXED-CLAIMS"],
  lebanon: ["B- / ACTIVE", "C+ / ACTIVE", "B- / STRIKE-HEAVY"],
  syria: ["C+ / MULTI-SOURCE", "C / FRAGMENTED", "C+ / ACTOR-HEAVY"],
  yemen: ["B- / ACTIVE", "C+ / ACTIVE", "B- / MARITIME"],
  sudan: ["B- / HUMANITARIAN CRISIS", "C+ / FRAGMENTED", "B- / MULTI-FRONT"],
  myanmar: ["B- / MULTI-FRONT", "C+ / FRAGMENTED", "B- / TERRITORIAL"],
  drc: ["B- / REGIONALIZED", "C+ / MIXED", "B- / DISPLACEMENT-LED"],
  taiwan: ["B / INDICATOR-DRIVEN", "B+ / WATCH MODEL", "B / PRE-CONTACT"],
};
