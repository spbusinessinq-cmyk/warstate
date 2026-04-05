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
  statusLine: string;
  overview: string;
  escalationDrivers: string[];
  watchNext: string[];
  friendly: TheaterForce;
  opposing: TheaterForce;
  indicators: string[];
  sectors: TheaterSector[];
  sources: string[];
  evidencePosture: "CONFIRMED" | "LIKELY" | "CONTESTED" | "MIXED";
  confidenceRationale: string;
  claimNotes: string[];
}

export const THEATERS: Record<string, Theater> = {

  // ─── IRAN ────────────────────────────────────────────────────────────────────
  iran: {
    id: "iran",
    short: "Iran",
    codename: "MANTLE",
    title: "IRAN REGIONAL WAR GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // RAPID UPDATE",
    sourceDiscipline: "Claims precede confirmed strike effects by 4–72 hours. All damage must be cross-sourced before ledger entry.",
    statusLine:
      "Active managed-confrontation theater following multiple direct Israeli-Iranian strike exchanges. Iranian air defense layers are degraded but not neutralized. Proxy network across Lebanon, Iraq, Syria, and Yemen remains operationally active and is being used as a pressure mechanism short of direct escalation. Hormuz closure risk remains the primary systemic variable.",
    overview:
      "The Iran theater is the anchor of the current Middle East escalation system. Following direct Israeli precision strike campaigns targeting Iranian air defense infrastructure, nuclear-adjacent facilities, and regional proxy command nodes, Iran and Israel have entered a cycle of calibrated retaliation that has not yet broken its containment logic. Iran retains a robust proxy network spanning four countries, giving it escalation options below the threshold of direct state action. The Strait of Hormuz has not been closed, but Iran has demonstrated the will and partial capability to threaten it. The principal risk is an event that breaks the current deterrence equilibrium — whether through miscalculation, opportunistic third-actor escalation, or a synchronized proxy activation across multiple fronts simultaneously.",
    escalationDrivers: [
      "Hormuz interdiction: A tanker seizure or confirmed mine event would cascade into global energy and shipping markets within 72 hours and force a U.S./partner military response.",
      "Proxy synchronization: Simultaneous activation of Hezbollah, Iraq-based militias, and Houthi forces would indicate a coordinated Iranian strategic escalation rather than a contained response.",
      "Israeli strike depth: Each new strike cycle that expands the target set — particularly toward populated infrastructure — carries heightened risk of an unmanaged Iranian retaliation.",
    ],
    watchNext: [
      "Iranian retaliation timing, target selection, and weapon type following the current Israeli strike cycle.",
      "Hezbollah operational posture on the Lebanese northern front — primary cross-front escalation mechanism.",
      "Hormuz vessel traffic density and Iranian navy/IRGC-N patrol patterns.",
    ],
    friendly: {
      label: "U.S. / Israel Alignment",
      equipmentLosses: "Classified / mixed official release",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Classified / partial official reporting",
      killed: "Classified / partial official reporting",
    },
    opposing: {
      label: "Iran / Proxy Network",
      equipmentLosses: "Partially confirmed via strike reporting",
      tankLosses: "Limited reporting",
      armoredLosses: "Limited reporting",
      casualties: "Iranian state suppresses; regional proxy figures unverified",
      killed: "Estimated via strike-effect analysis; no verified total",
    },
    indicators: [
      "Hormuz blockade posture: Iran has publicly threatened interdiction and conducted IRGC-N exercises consistent with blockade preparation. Any tanker seizure or mine event is a tier-one escalation trigger.",
      "Proxy coordination signals: Houthi, Hezbollah, and Iraqi militia posture is linked to Iranian strategic signaling. Synchronized multi-front activation would indicate coordinated escalation rather than autonomous actor behavior.",
      "Nuclear site and enrichment status: Iranian enrichment activity and underground facility reporting affects Israeli and U.S. strike calculus at the strategic level. Any breakout acceleration changes the escalation timeline materially.",
      "Iranian air defense restoration: Repair and augmentation of degraded S-300 and Bavar-373 systems determines Iran's future survivability and counter-strike confidence. Progress rate is a key baselining indicator.",
      "Narrative/claim environment: Adversarial and friendly overclaim in this theater routinely precede verified damage by 24–72 hours. Separation of confirmed effects from propaganda is operationally critical and affects policy response.",
      "Iraq/Syria militia tempo: Uptick in attacks on U.S. or partner infrastructure from these networks signals Iranian-directed pressure rather than autonomous group initiative and should be read as strategic messaging.",
    ],
    sectors: [
      { name: "Regional Escalation Risk", value: 94 },
      { name: "Hormuz / Maritime Pressure", value: 91 },
      { name: "Proxy Network Activity", value: 86 },
      { name: "Infrastructure Strike Risk", value: 88 },
      { name: "Information Certainty", value: 52 },
    ],
    sources: [
      "OFFICIAL / STATE: IDF Spokesperson, U.S. CENTCOM, Iranian state media (IRNA, PressTV — adversarial frame)",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, BBC World Service, Al Jazeera",
      "CONFLICT MONITOR: ISW Levant tracking, Liveuamap, Middle East Eye operational coverage",
      "STRIKE / OSINT: Bellingcat, Intel Crab, open-source geolocation verification",
      "MARITIME / LOGISTICS: UKMTO incident log, Ambrey Risk, Lloyd's Market Intelligence",
      "REGIONAL / LOCAL: Haaretz, Iran International, Tasnim News (adversarial), Kurdistan 24",
    ],
    evidencePosture: "MIXED",
    confidenceRationale: "Strike effects are partially confirmed via OSINT geolocation and satellite imagery, but Iranian state suppression of casualty and military data blocks independent verification at depth. Proxy attribution requires multi-source corroboration across adversarial frames. A significant proportion of initial reporting in this theater is unverified claim that precedes confirmed damage by 24–72 hours.",
    claimNotes: [
      "Iranian air defense degradation levels are disputed — IDF claims of system destruction frequently exceed independently verified OSINT damage assessments.",
      "Proxy casualty figures rely on Hezbollah martyr announcements and IRGC statements rather than independent military verification.",
      "Hormuz interdiction threats represent credible posture signaling but have not translated to confirmed operational interdiction as of this report cycle.",
    ],
  },

  // ─── UKRAINE ─────────────────────────────────────────────────────────────────
  ukraine: {
    id: "ukraine",
    short: "Ukraine",
    codename: "ANVIL",
    title: "UKRAINE ATTRITION GRID",
    region: "Europe",
    classification: "OPEN SOURCE // COMPILED BATTLE LEDGER",
    sourceDiscipline: "Visually confirmed equipment losses are more reliable than casualty estimates. Treat casualty figures as ranges, not points.",
    statusLine:
      "Protracted attritional war with structural Russian advantage in manpower replenishment and munitions volume, partially offset by Ukrainian irregular defense and Western material support. Russian forces hold initiative in the east and have made incremental gains along multiple axes. Infrastructure bombing campaigns continue to degrade Ukrainian energy and civilian systems at strategic depth.",
    overview:
      "The Ukraine war has settled into an attritional grind in which Russian forces press incremental advantages in the Donetsk and Zaporizhzhia axes while Ukrainian forces conduct grinding defensive operations and limited counter-pressure actions. Russia's manpower depth — sustained by ongoing mobilization waves and contract recruitment — gives it a structural attrition advantage that Western materiel packages partially but not fully offset. The equipment loss ledger consistently shows Russian losses as roughly double Ukrainian losses on visually confirmed platforms, but Russia's industrial and manpower base absorbs this at a rate that Ukraine's cannot match without continued external support. Strategic infrastructure remains under sustained strike pressure from Russian long-range systems. The political sustainability of Western support is the primary exogenous variable for Ukraine's long-term capacity.",
    escalationDrivers: [
      "Western support interruption: Any material reduction in U.S. or European military/financial assistance would accelerate Ukrainian positional collapse on key defensive axes within 60–90 days.",
      "Russian nuclear signaling: Any shift in Russian nuclear doctrine communication — particularly around Crimea or deep Ukrainian strikes on Russian territory — carries escalation risk at the NATO alliance level.",
      "Major urban center threatened: A sustained Russian advance toward Zaporizhzhia city, Kharkiv, or Odessa would trigger a European political response and potentially accelerate Western strike authorization.",
    ],
    watchNext: [
      "Russian operational tempo in Chasiv Yar and Pokrovsk corridors — primary short-horizon territorial indicators.",
      "Ukrainian long-range strike activity inside Russian territory — political and escalation signal.",
      "Western weapons authorization status for ATACMS, F-16 operational integration, and air defense gap coverage.",
    ],
    friendly: {
      label: "Ukraine",
      equipmentLosses: 11757,
      tankLosses: 1405,
      armoredLosses: 5709,
      casualties: "500k–600k est. (incl. wounded)",
      killed: "100k–140k est.",
    },
    opposing: {
      label: "Russia",
      equipmentLosses: 24383,
      tankLosses: 4371,
      armoredLosses: 13978,
      casualties: "1.1m–1.4m est. (incl. wounded)",
      killed: "230k–430k est.",
    },
    indicators: [
      "Eastern axis advances: Russian incremental gains along the Donetsk front near Avdiivka, Chasiv Yar, and Pokrovsk are the primary short-term territorial pressure indicators. Any acceleration in Russian advance pace changes the defensive calculus.",
      "Energy infrastructure: Repeated waves of Russian strikes on Ukrainian power generation, heating, and transmission infrastructure represent a deliberate winterization strategy and create cascading humanitarian pressure.",
      "Western materiel arrival rate: The pipeline of U.S. ATACMS, European artillery shells, and air defense systems directly conditions Ukrainian defensive capacity. Any political blockage to this supply chain is a tier-one watch item.",
      "Casualty sustainability: Ukraine's demographic mobilization ceiling is lower than Russia's. Any evidence of reduced frontline density or shift in mobilization policy would be a strategic-level warning indicator.",
      "Equipment loss ratio: The Russian-to-Ukrainian confirmed equipment loss ratio is approximately 2:1 on platforms and 3:1 on tanks, but this advantage does not translate linearly into territorial or operational outcome given Russian production recovery.",
      "Drone/missile interception rates: Ukrainian air defense interception rates against Russian Shahed drones and ballistic/cruise missiles determine energy and civilian system exposure. Degradation in these rates signals a material shift in air vulnerability.",
    ],
    sectors: [
      { name: "Equipment Attrition", value: 82 },
      { name: "Infrastructure Strike Pressure", value: 91 },
      { name: "Eastern Front Pressure", value: 74 },
      { name: "Manpower Sustainability", value: 66 },
      { name: "Information Certainty", value: 58 },
    ],
    sources: [
      "OFFICIAL / STATE: Ukraine MoD, Russian MoD (adversarial frame), NATO spokesperson statements",
      "CONFLICT MONITOR / TRACKER: Oryx visually confirmed equipment losses, ISW daily Ukraine assessment, DeepState map",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, BBC, The Kyiv Independent",
      "MILITARY / STRIKE REPORTING: UK MoD daily intelligence update, RUSI Ukraine analysis, Janes",
      "HUMANITARIAN / DISPLACEMENT: UNHCR Ukraine situation reports, OCHA displacement tracking",
      "INFRASTRUCTURE / ENERGY: IEA Ukraine energy reporting, Ukrainian energy operator statements",
    ],
    evidencePosture: "LIKELY",
    confidenceRationale: "Visually confirmed equipment losses via Oryx represent the gold-standard data layer for this theater — methodology is independent and conservative. Territory control is reliably tracked by ISW and DeepState. Casualty figures are range estimates from Western intelligence assessments and carry inherent imprecision. Overall evidence confidence is higher than most active conflict theaters due to the volume and independence of OSINT corroboration.",
    claimNotes: [
      "Ukrainian and Russian official casualty estimates diverge dramatically — Western intelligence range estimates are used here as more analytically credible than either party's official claim.",
      "Russian territorial gain claims frequently exceed or lag actual confirmed control changes by 12–72 hours on first reporting.",
      "Equipment loss ratios represent gross confirmed losses and do not account for battlefield recovery and field repair — net operational fleet reductions may differ from raw loss counts.",
    ],
  },

  // ─── GAZA ────────────────────────────────────────────────────────────────────
  gaza: {
    id: "gaza",
    short: "Gaza",
    codename: "EMBER",
    title: "GAZA URBAN STRIKE GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // FRAGMENTED REPORTING",
    sourceDiscipline: "Urban conflict claims require hard-source cross-reference. Gaza Health Ministry figures are the primary civilian death source but are disputed by Israel as Hamas-controlled.",
    statusLine:
      "High-tempo urban military operations continuing across northern and southern Gaza with periodic surge activity. IDF ground forces conducting systematic operations in Rafah, Khan Younis, and northern Gaza, with strike density remaining elevated. Humanitarian corridor pressure is structurally critical. Hostage situation remains unresolved and acts as a constraint on Israeli operational flexibility.",
    overview:
      "The Gaza conflict continues as a high-intensity urban military campaign in which Israel has significantly degraded Hamas's military command structure, tunnel network, and weapons stockpiles at heavy cost to the civilian population. Hamas remains operationally capable in a degraded form and continues to resist IDF ground pressure through urban warfare tactics, tunnel systems, and indirect fire. The civilian death toll and humanitarian catastrophe are the defining political pressure variables for Israel's operation — international calls for ceasefire have constrained Israeli operational tempo without stopping it. The hostage situation remains a fundamental complication that limits Israel's targeting and operational choices. An enduring governance and security architecture for post-conflict Gaza has not been established, creating uncertainty about the end-state.",
    escalationDrivers: [
      "Hostage situation: Any IDF action that endangers remaining hostages or a hostage death attributed to Israeli fire creates a severe domestic Israeli political constraint and potentially forces operational pauses.",
      "Regional spillover threshold: A significant increase in Iranian-directed rocket/drone activity from Lebanon or the West Bank risks drawing Israel into a wider multi-front engagement.",
      "Humanitarian corridor collapse: Further deterioration of humanitarian access — including fuel, food, water — would accelerate civilian mortality and increase international diplomatic pressure on Israeli operational latitude.",
    ],
    watchNext: [
      "IDF operational tempo in Rafah — whether full-scale ground operation proceeds or remains restrained.",
      "Hostage negotiation track — any deal would likely require a multi-week operational pause.",
      "West Bank escalation indicators — settler/IDF operations and Palestinian response tempo.",
    ],
    friendly: {
      label: "Israel (IDF)",
      equipmentLosses: 421,
      tankLosses: 37,
      armoredLosses: 118,
      casualties: "Classified / official partial release",
      killed: "Official partial release — confirmed KIA per IDF",
    },
    opposing: {
      label: "Hamas / Islamic Jihad",
      equipmentLosses: "Not applicable — primarily irregular forces",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "Heavily disputed — Gaza MoH vs. IDF estimates diverge significantly",
      killed: "IDF claims ~17k combatants; Gaza MoH totals include civilians and combatants",
    },
    indicators: [
      "Hostage status: The remaining hostage count and health status is a direct constraint on Israeli operational choices. Any death attributable to IDF action fundamentally alters the domestic political calculus.",
      "Civilian infrastructure: Hospital, water, and fuel supply status in northern Gaza is a first-order humanitarian indicator. UNRWA and WHO access monitoring is the primary tracking layer.",
      "Urban clearing pace: IDF operational clearance of Hamas tunnel systems and command nodes in Khan Younis, Rafah, and northern Gaza determines whether Hamas can reconstitute command capacity.",
      "Hamas military command reconstruction: Any evidence of Hamas rebuilding battalion-level command structures in cleared areas would signal a failure of the clearing strategy and change Israeli operational timelines.",
      "International political ceiling: U.S. arms transfer authorizations, European diplomatic pressure, and ICJ proceedings all condition Israeli operational space. A significant shift in U.S. position would be a tier-one indicator.",
      "Claim inflation environment: In-theater claim inflation is extremely high. Hamas and Israeli overclaims on civilian impact, operational success, and enemy casualties require systematic hard-source separation before being treated as baseline.",
    ],
    sectors: [
      { name: "Strike Density", value: 89 },
      { name: "Civilian Impact Risk", value: 95 },
      { name: "Humanitarian Access Stress", value: 92 },
      { name: "Hamas Command Degradation", value: 71 },
      { name: "Information Certainty", value: 38 },
    ],
    sources: [
      "OFFICIAL / STATE: IDF Spokesperson, Hamas political bureau, COGAT statements",
      "HUMANITARIAN: OCHA Gaza situation reports, UNRWA, WHO, MSF/Doctors Without Borders",
      "WIRE / GLOBAL PRESS: Reuters, AP, Al Jazeera (Gaza bureau), BBC, +972 Magazine",
      "CONFLICT MONITOR: ISW Gaza tracking, Airwaves strike monitor, ACLED Gaza",
      "MEDICAL / CIVILIAN IMPACT: Gaza Ministry of Health (Hamas-controlled — note source), Euro-Med Human Rights Monitor",
      "HOSTAGE / NEGOTIATION TRACK: Ynet, Haaretz, Times of Israel diplomatic track reporting",
    ],
    evidencePosture: "CONTESTED",
    confidenceRationale: "The Gaza theater operates under the highest systematic claim-inflation conditions of any current active theater. Both IDF and Hamas overclaim in opposite directions and for distinct political audiences. Gaza Health Ministry figures — the primary civilian death source — are Hamas-administered, introducing a structural credibility constraint. Independent ground truth access is severely restricted for journalists and aid organizations. Confidence in specific casualty counts and operational effectiveness claims is low; theater-level trend assessments carry higher confidence than specific figures.",
    claimNotes: [
      "Gaza Ministry of Health casualty totals combine civilian and combatant deaths without disaggregation — IDF claims a separate combatant-specific figure that is not independently verifiable at the stated precision.",
      "IDF strike effectiveness claims, including tunnel destruction percentages and commander eliminations, frequently cannot be confirmed by independent sources within an operationally relevant timeframe.",
      "Hostage count, health status, and location distribution are contested across IDF, Hamas, and ICRC reporting — figures diverge and cannot be independently verified.",
    ],
  },

  // ─── LEBANON ─────────────────────────────────────────────────────────────────
  lebanon: {
    id: "lebanon",
    short: "Lebanon",
    codename: "CEDAR",
    title: "LEBANON NORTHERN FRONT",
    region: "Middle East",
    classification: "OPEN SOURCE // ACTIVE FRONT",
    sourceDiscipline: "Cross-front linkage with Iran theater; Hezbollah attribution requires separate sourcing from Gaza conflict claims.",
    statusLine:
      "Northern front operating under partial ceasefire framework that has reduced but not eliminated Hezbollah-Israel exchange. Israeli forces maintain positions inside Lebanese territory as part of an ongoing buffer operation. Hezbollah has not reconstituted to pre-conflict strike capacity but retains significant residual capability. Escalation risk is strongly tied to the Iran theater and any further Israeli decision to escalate north.",
    overview:
      "The Lebanon theater entered a significantly altered state following a sustained Israeli campaign that degraded Hezbollah's senior military command — including the killing of Hassan Nasrallah and much of the southern command structure — and destroyed significant portions of its precision missile stockpile and command infrastructure in the Bekaa Valley and south Lebanon. A ceasefire framework nominally reduced direct exchange, but Israeli forces have maintained positions inside Lebanon and continued strikes on Hezbollah infrastructure. Hezbollah has not formally collapsed and retains a deep organizational structure, significant remaining rocket inventory, and continued Iranian support. The northern front is the primary cross-front escalation valve for the Iran-Israel confrontation system — any direct expansion of the Iran conflict would likely involve Hezbollah activation.",
    escalationDrivers: [
      "Iranian escalation directive: Hezbollah activation at strategic scale is ultimately constrained by Iranian command authority. An Iranian decision to escalate regionally would unlock Hezbollah's full residual strike capacity against Israel.",
      "Israeli buffer zone dynamics: Continued IDF presence inside Lebanese territory is a persistent friction source. Any Hezbollah attempt to reassert control over the southern border zone creates daily escalation pressure.",
      "Precision missile reconstruction: Iranian resupply of precision-guided missiles to Hezbollah — particularly those capable of striking Israeli strategic infrastructure — would materially change the northern threat calculus.",
    ],
    watchNext: [
      "Hezbollah rocket/drone tempo — any surge above baseline signals command reconstitution or Iranian-directed escalation.",
      "IDF withdrawal or extension of Lebanese border presence — determines friction level and Hezbollah response space.",
      "Iranian weapons shipment routes — land corridor through Syria and air deliveries are primary resupply mechanisms.",
    ],
    friendly: {
      label: "Israel (IDF Northern Command)",
      equipmentLosses: "Partial official release",
      tankLosses: "Limited operational reporting",
      armoredLosses: "Limited operational reporting",
      casualties: "Official IDF release — confirmed KIA",
      killed: "Official IDF release",
    },
    opposing: {
      label: "Hezbollah / IRGC-Linked Units",
      equipmentLosses: "Partially confirmed via strike BDA reporting",
      tankLosses: "Limited — Hezbollah not a tank-primary force",
      armoredLosses: "Limited reporting",
      casualties: "Hezbollah acknowledges losses; total estimate via media/monitor reporting",
      killed: "Estimated via Hezbollah martyr announcements and ISW tracking",
    },
    indicators: [
      "Hezbollah precision missile inventory: The remaining stockpile of Hezbollah precision-guided munitions capable of targeting Israeli infrastructure is the primary strategic-level indicator for northern front threat level. Iranian resupply is the primary restoration mechanism.",
      "IRGC advisory presence in Lebanon: Any evidence of increased IRGC-Quds Force presence or direct advisory activity in Lebanon signals preparation for escalation rather than deconfliction.",
      "Southern Lebanon civil return: The rate at which Lebanese civilians return to southern villages is an indirect indicator of Hezbollah's control reassertion and IDF forward presence posture.",
      "Cross-front synchronization: Simultaneous activity in the Gaza, Lebanon, and Yemen theaters on the same operational cycle is the clearest signal of Iranian-coordinated escalation rather than theater-isolated exchange.",
      "Israeli strike depth into Lebanon: IDF strike activity in Bekaa Valley, Beirut southern suburbs, and Lebanese infrastructure targets signals either preemption or punishment and tracks Israeli escalation tolerance.",
      "UN/UNIFIL force status: UNIFIL positioning and any incidents involving the UN force are indicators of the ground situation in south Lebanon and create additional diplomatic constraint on Israeli action.",
    ],
    sectors: [
      { name: "Hezbollah Strike Capacity", value: 64 },
      { name: "Border Friction Level", value: 78 },
      { name: "Civilian Displacement", value: 71 },
      { name: "Iran Cross-Front Linkage", value: 87 },
      { name: "Information Certainty", value: 61 },
    ],
    sources: [
      "OFFICIAL / STATE: IDF Spokesperson, Lebanese government statements, UNIFIL reports",
      "CONFLICT MONITOR: ISW Levant tracking, Alma Research and Education Center, South Lebanon Conflict Monitor",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, L'Orient Today, Naharnet",
      "MILITARY / STRIKE REPORTING: Janes, The Cradle (note pro-resistance frame), NOW Lebanon",
      "HUMANITARIAN / DISPLACEMENT: UNHCR Lebanon, OCHA, Lebanese Red Cross",
      "REGIONAL / IRAN LINKAGE: Iran International, Al-Manar (Hezbollah-affiliated — adversarial frame), Middle East Eye",
    ],
    evidencePosture: "LIKELY",
    confidenceRationale: "Hezbollah losses are partially confirmed through official martyr announcements cross-referenced with ISW and Alma Research tracking. Israeli operational reporting (KIA, equipment) is officially released by IDF with partial OSINT corroboration. The ceasefire framework provides some structural reporting cadence. Overall confidence is moderate — better than Gaza but constrained by Hezbollah opacity on military capacity and Iranian resupply status.",
    claimNotes: [
      "Hezbollah precision missile stockpile status following Israeli strikes remains genuinely contested — estimates range from significantly degraded to largely intact depending on the source frame and methodology.",
      "Iranian resupply volumes through Syrian land corridors are Israeli-claimed as largely interdicted; Hezbollah and Iran maintain adequate replenishment — independent verification is not available.",
      "UNIFIL reporting on IDF and Hezbollah ground activity in southern Lebanon is diplomatically constrained and does not provide comprehensive independent battlefield assessment.",
    ],
  },

  // ─── SYRIA ───────────────────────────────────────────────────────────────────
  syria: {
    id: "syria",
    short: "Syria",
    codename: "MOSAIC",
    title: "SYRIA TRANSITION GRID",
    region: "Middle East",
    classification: "OPEN SOURCE // MULTI-ACTOR TRANSITION",
    sourceDiscipline: "Post-Assad transition environment creates new attribution challenges; HTS control of northern Syria changes the state-actor frame significantly.",
    statusLine:
      "Syria is in post-Assad political transition following the rapid collapse of the Assad regime in December 2024. Hayat Tahrir al-Sham (HTS) and allied armed factions control much of northwestern Syria including Damascus. ISIS opportunistic activity is resurging in the eastern desert. Israeli strikes on Syrian military infrastructure, including advanced weapons systems, continue. The enduring political and military architecture of the new Syrian state has not been established.",
    overview:
      "Syria's conflict character changed dramatically with the rapid fall of the Assad regime following a multi-week offensive by HTS-led forces from Idlib. The political transition is ongoing — HTS, under Ahmed al-Sharaa (formerly Abu Mohammad al-Jolani), controls Damascus and most western Syria, while Kurdish SDF forces retain northeastern Syria under U.S. partner force relationships. Turkey-backed factions contest territory along the northern border. ISIS has exploited the power transition to resume operations in the eastern desert and Deir ez-Zor areas. Israel has systematically struck Syrian military weapons stockpiles and infrastructure — particularly naval vessels, air defense systems, and chemical weapons-related sites — taking advantage of the transition to degrade advanced weapons before they can be transferred or fall into problematic hands. The Syria theater is now primarily a political transition tracking problem with embedded ISIS resurgence, Turkish-Kurdish tension, and Israeli strike activity.",
    escalationDrivers: [
      "ISIS resurgence: The power transition vacuum has been directly exploited by ISIS, which has expanded operations in the eastern desert and Deir ez-Zor. Any ISIS territorial reconsolidation changes U.S. partner-force posture and regional risk.",
      "Turkish-Kurdish military confrontation: Turkish operations against SDF forces in northeastern Syria risk direct confrontation with U.S.-backed partner forces and create a NATO-adjacent friction point.",
      "HTS governance failure: If the HTS-led transitional government fails to consolidate control or faces armed internal opposition, Syria risks renewed civil war fragmentation rather than managed transition.",
    ],
    watchNext: [
      "HTS governance consolidation pace and international recognition status — determines Syria's political trajectory.",
      "ISIS operational tempo in eastern Syria — frequency and scale of attacks signals reconstitution pace.",
      "Turkish military operations against SDF in northeast — primary bilateral escalation variable.",
    ],
    friendly: {
      label: "HTS / Transitional Government Forces",
      equipmentLosses: "Not fully catalogued — transition underway",
      tankLosses: "Limited reporting",
      armoredLosses: "Limited reporting",
      casualties: "Not consolidated — multi-phase transition",
      killed: "Not consolidated",
    },
    opposing: {
      label: "ISIS / Remnant / Spoiler Forces",
      equipmentLosses: "Limited — primarily light irregular forces",
      tankLosses: "N/A",
      armoredLosses: "Limited",
      casualties: "Sporadic reporting via SDF and Syrian sources",
      killed: "Estimated via SDF/SOHR operational reporting",
    },
    indicators: [
      "ISIS operational tempo: Attack frequency and geographic spread in the eastern desert, Palmyra area, and Deir ez-Zor directly measures the pace of ISIS reconstitution under the transition power vacuum.",
      "HTS governance consolidation: The rate at which HTS establishes functional ministries, secures borders, and integrates armed factions determines whether Syria is stabilizing or fragmenting again.",
      "Israeli strike cadence in Syria: Israel has conducted dozens of strikes on Syrian military infrastructure since the transition. The target set and pace provide an indirect signal of Israeli assessment of Syrian weapons proliferation risk.",
      "Turkish-SDF confrontation level: Turkish military activity against SDF-controlled northeastern Syria is an active low-level conflict that can escalate into a significant military confrontation with partner-force implications for the U.S.",
      "Displacement and return: Syrian refugee and IDP return rates are a proxy indicator of security improvement. Failure of returns despite Assad's fall signals continued local insecurity.",
      "Chemical and advanced weapons accounting: Whether Syrian chemical weapons and advanced missile/air defense stockpiles have been secured, destroyed, or proliferated is an unresolved critical intelligence question.",
    ],
    sectors: [
      { name: "ISIS Activity Level", value: 67 },
      { name: "Political Fragmentation", value: 74 },
      { name: "Israeli Strike Activity", value: 62 },
      { name: "Turkish-Kurdish Friction", value: 71 },
      { name: "Information Certainty", value: 47 },
    ],
    sources: [
      "OFFICIAL / STATE: HTS political bureau, SDF/SDC statements, Syrian interim government releases",
      "CONFLICT MONITOR: SOHR (Syrian Observatory for Human Rights), ISW Syria tracking, ACLED Syria",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, Al Jazeera, BBC Arabic",
      "MILITARY / STRIKE REPORTING: Airwaves strike monitor, Janes, ISW ISIS tracker",
      "HUMANITARIAN / DISPLACEMENT: UNHCR Syria, OCHA Syria, IOM displacement tracking",
      "REGIONAL / LOCAL: Syria Direct, Orient News, The New Arab, North Press Agency (Kurdish perspective)",
    ],
    evidencePosture: "MIXED",
    confidenceRationale: "Post-transition Syria presents significant attribution challenges. The Assad regime's data infrastructure has collapsed, HTS-controlled areas have restricted independent press access, and the multi-actor environment generates conflicting factional claims. Israeli strike BDA relies on IDF releases and partial OSINT corroboration. ISIS activity in the eastern desert is tracked primarily through attack frequency, not independently verified force assessments. Information confidence is improving from the transition nadir but remains well below the standard of Ukraine or even Yemen.",
    claimNotes: [
      "HTS governance statements represent aspirational authority and transitional intent rather than verified operational facts — consolidation status should be cross-checked against independent monitoring.",
      "ISIS resurgence extent is estimated from SOHR and SDF attack-frequency reporting, not independently verified force size or territorial control assessments.",
      "Israeli strike BDA in Syria is reported by IDF and partially corroborated by satellite OSINT — the former Syrian government source framework no longer applies as a cross-reference.",
    ],
  },

  // ─── YEMEN ───────────────────────────────────────────────────────────────────
  yemen: {
    id: "yemen",
    short: "Yemen",
    codename: "CHOKEPOINT",
    title: "RED SEA / YEMEN MARITIME GRID",
    region: "Middle East / Horn of Africa",
    classification: "OPEN SOURCE // MARITIME THREAT + REGIONAL LINKAGE",
    sourceDiscipline: "System-level disruption effects are more operationally significant than Houthi strike counts. Maritime insurance and route data outranks strike tallies.",
    statusLine:
      "Houthi maritime interdiction campaign continues against commercial shipping in the Red Sea and Gulf of Aden, with strikes against Israel-linked, U.S.-linked, and now broadly international commercial vessels. U.S.-UK strikes on Houthi military infrastructure have degraded capacity but not halted operations. Bab el-Mandeb chokepoint traffic significantly reduced versus baseline; Cape of Good Hope rerouting persists at economic scale.",
    overview:
      "The Yemen theater has transformed from a domestically-focused civil war into a globally-relevant maritime campaign. Following the October 7 Hamas attack on Israel, Houthi forces under the Ansar Allah movement declared a maritime campaign targeting vessels they assess as linked to Israel, expanded to include U.S. and UK vessels, and then broadened further to any vessel transiting toward Israeli ports. The effect on global shipping has been substantial — major carriers have diverted from the Suez Canal route to the longer Cape of Good Hope alternative, significantly increasing shipping costs and transit times. U.S. and UK military operations (Operation Prosperity Guardian / Operation Poseidon Archer) have struck Houthi radar, air defense, missile, and drone stockpile infrastructure repeatedly. Houthi capacity has been degraded but the movement retains significant inventories of anti-ship missiles, drones, and ballistic missiles supplied through Iranian logistics chains.",
    escalationDrivers: [
      "Suez Canal traffic collapse: If Houthi interdiction operations succeed in pushing the majority of global container shipping permanently to the Cape route, it would represent a structural reshaping of global trade infrastructure and a strategic Houthi victory at systemic cost.",
      "U.S./partner force escalation: Any U.S. or partner military decision to conduct sustained air campaign against Houthi command structure, port infrastructure, or ground forces would risk widening the Yemen conflict into a direct Iran-confrontation.",
      "Ballistic missile/cruise missile against naval vessel: A successful Houthi hit on a major U.S. or partner naval vessel would force a significant escalation response and potentially trigger direct conflict with Iran.",
    ],
    watchNext: [
      "Red Sea vessel traffic volume versus Cape of Good Hope rerouting — primary systemic disruption indicator.",
      "Houthi anti-ship missile and drone inventory levels — determines how long the campaign can sustain.",
      "Iranian logistics resupply into Yemen — weapons smuggling routes and interception rate.",
    ],
    friendly: {
      label: "U.S. / Partner Maritime Forces",
      equipmentLosses: "Limited — one MQ-9 confirmed lost to Houthi fire",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "No confirmed deaths from Houthi action as of reporting",
      killed: "None confirmed — multiple near-miss events reported",
    },
    opposing: {
      label: "Houthi / Ansar Allah Forces",
      equipmentLosses: "Significant radar, missile storage, and air defense sites struck",
      tankLosses: "Limited ground combat reporting",
      armoredLosses: "Limited",
      casualties: "Houthi does not publish figures; estimated via U.S. strike reporting",
      killed: "Estimated at hundreds from U.S./UK strike campaigns — not verified",
    },
    indicators: [
      "Red Sea vessel transit volume: Commercial vessel transit through Bab el-Mandeb versus baseline is the primary systemic-disruption indicator. Any sustained drop below 50% of normal baseline indicates a strategic-scale shipping system impact.",
      "Houthi missile/drone launch tempo: The frequency of Houthi anti-ship missile, ballistic missile, and drone launches tracks operational capacity. Any sustained reduction may indicate munitions pressure; any surge indicates resupply.",
      "U.S./UK strike effectiveness: Battle damage assessment of strikes on Houthi launch infrastructure, radar, and weapons storage determines whether the counter-campaign is degrading or merely harassing Houthi capacity.",
      "Iranian resupply pipeline: Vessel seizures and intelligence on Iranian weapons transfers to Houthi forces are the primary indicator of how long Houthi maritime capacity can be sustained despite U.S./UK strikes.",
      "Maritime insurance rates and carrier decisions: Lloyd's of London Red Sea/Gulf of Aden war risk premium levels and major carrier routing decisions are real-time economic indicators of the threat environment's systemic impact.",
      "Houthi political-military coherence: Internal Houthi command coherence and political leadership statements track whether the campaign has broad organizational support or is concentrated in a military faction that could be isolated.",
    ],
    sectors: [
      { name: "Shipping Disruption", value: 91 },
      { name: "Anti-Ship Strike Threat", value: 76 },
      { name: "Iran Supply Linkage", value: 88 },
      { name: "U.S. Counter-Campaign", value: 72 },
      { name: "Information Certainty", value: 61 },
    ],
    sources: [
      "MARITIME / LOGISTICS: UKMTO incident log, Ambrey Risk, Dryad Global, Lloyd's Market Intelligence, Kpler vessel tracking",
      "OFFICIAL / STATE: U.S. CENTCOM, UK MoD, Houthi military spokesperson (adversarial frame)",
      "CONFLICT MONITOR: ACLED Yemen, Yemen Data Project, ISW Yemen tracking",
      "WIRE / GLOBAL PRESS: Reuters, AP, Bloomberg (shipping economics), Al Jazeera",
      "STRIKE / MILITARY REPORTING: Janes defense, open-source satellite imagery analysis (Planet Labs / Maxar)",
      "HUMANITARIAN / CIVIL: OCHA Yemen, UNHCR, World Food Programme Yemen country reports",
    ],
    evidencePosture: "LIKELY",
    confidenceRationale: "Maritime incident data is among the most reliably tracked in any current active theater — UKMTO, Lloyd's, Ambrey, and vessel tracking services provide near-real-time confirmed incident data. Houthi strike claims routinely exceed confirmed vessel hits; U.S./UK strike BDA is officially reported and partially corroborated by OSINT. The theater has a strong maritime intelligence layer but weaker land-side force assessment coverage.",
    claimNotes: [
      "Houthi missile and drone launch counts significantly exceed confirmed vessel hit counts — interception and miss rates are systematically understated in Houthi public claims.",
      "U.S. CENTCOM strike BDA is official and partially OSINT-corroborated; Houthi statements consistently minimize damage. The operationally meaningful figure — remaining Houthi launch capacity — is not independently verifiable.",
      "Yemen humanitarian famine extent estimates rely on WFP and OCHA access-limited assessments — restricted access in Houthi-controlled areas introduces systematic undercounting risk.",
    ],
  },

  // ─── SUDAN ───────────────────────────────────────────────────────────────────
  sudan: {
    id: "sudan",
    short: "Sudan",
    codename: "FRACTURE",
    title: "SUDAN COLLAPSE GRID",
    region: "Africa / Sahel",
    classification: "OPEN SOURCE // HUMANITARIAN CATASTROPHE",
    sourceDiscipline: "Civilian displacement and humanitarian exposure are more reliably tracked than force tallies. Most casualty estimates are WHO/OCHA-derived, not militarily sourced.",
    statusLine:
      "Sudan is experiencing one of the world's most severe active humanitarian catastrophes. The RSF-SAF civil war has produced mass civilian displacement, urban destruction, food system collapse, and ethnic targeting in Darfur. Khartoum remains contested and partially destroyed. The SAF has made counter-pressure gains in some areas while RSF maintains control of significant territory in the west and Khartoum area. No political solution is in sight.",
    overview:
      "The Sudan conflict — which began in April 2023 as a confrontation between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF) over military integration — has metastasized into one of the world's worst active humanitarian crises. The RSF, led by General Mohamed Hamdan Dagalo (Hemedti), initially captured large parts of Khartoum and the Darfur region, with evidence of ethnically-targeted mass atrocities in El Fasher and surrounding areas echoing the Darfur genocide patterns of the 2000s. SAF has conducted airstrikes on RSF-held areas, including populated urban zones, causing significant civilian casualties. Both sides have systematically looted civilian infrastructure, hospitals, and aid organizations. Famine conditions exist in parts of northern Darfur. The international response has been fragmented and inadequate to the scale of the crisis. The UN estimates over 10 million people have been internally displaced — the largest internal displacement crisis in the world.",
    escalationDrivers: [
      "El Fasher: The last major city in North Darfur not fully under RSF control, El Fasher contains over a million displaced civilians. RSF siege and assault would produce mass atrocity conditions and overwhelm humanitarian response.",
      "Famine expansion: Confirmed famine in parts of Darfur risks spreading to additional zones as agricultural seasons are missed and supply routes remain cut. Any expansion of the famine zone accelerates civilian mortality at scale.",
      "External actor intervention: UAE support for RSF and SAF's relationships with Egypt, Iran, and Eritrea mean external actor decisions can materially affect battlefield balance and prolongation of the conflict.",
    ],
    watchNext: [
      "RSF military pressure on El Fasher — a siege or assault would be a mass atrocity trigger.",
      "Humanitarian access negotiations — whether aid can reach Darfur and Khartoum populations.",
      "SAF counter-offensive capacity — whether SAF can hold Khartoum area or recapture key positions.",
    ],
    friendly: {
      label: "Sudanese Armed Forces (SAF)",
      equipmentLosses: "Significant — RSF captured extensive SAF hardware at conflict onset",
      tankLosses: "High — RSF initial gains included armored vehicle capture",
      armoredLosses: "High initial losses; partially recovered",
      casualties: "No reliable military estimate — SAF does not publish figures",
      killed: "Estimated via humanitarian reporting and monitoring — not verified at precision",
    },
    opposing: {
      label: "Rapid Support Forces (RSF)",
      equipmentLosses: "Mixed — SAF airstrike damage estimated by OSINT; not comprehensive",
      tankLosses: "Primarily captured SAF vehicles — limited dedicated armor",
      armoredLosses: "Captured and redeployed assets; not comprehensively tracked",
      casualties: "No reliable figure — RSF does not publish losses",
      killed: "Estimated via monitor reporting and airstrike BDA",
    },
    indicators: [
      "El Fasher humanitarian status: The city contains the last large IDP population center in Darfur not under RSF control. An RSF assault would be the most significant atrocity event of the conflict and is the primary watch item.",
      "Famine zone mapping: IPC Phase 5 (famine) classification areas, currently concentrated in North Darfur, are a direct mortality indicator. Any geographic expansion of famine-classified zones signals system collapse.",
      "Humanitarian access: Aid agency ability to operate in Darfur, Khartoum state, and other conflict zones directly determines mortality outcomes. Any further restriction on access is a tier-one humanitarian indicator.",
      "RSF territorial consolidation: RSF hold on major western Sudanese cities, control of key road networks, and Khartoum area presence determines the structural state balance. Any shift in RSF control affects negotiation leverage.",
      "SAF airpower effectiveness: SAF has continued to conduct strikes on RSF-held areas. The effectiveness and civilian impact of these strikes determines both battlefield outcomes and international pressure on the SAF.",
      "External actor posture: UAE arms supply to RSF, Egyptian and Eritrean SAF support, and any change in these external backing arrangements would materially alter the conflict's trajectory and duration.",
    ],
    sectors: [
      { name: "State Collapse Pressure", value: 96 },
      { name: "Civilian Famine Risk", value: 94 },
      { name: "Mass Displacement", value: 97 },
      { name: "Atrocity Risk (Darfur)", value: 91 },
      { name: "Information Certainty", value: 44 },
    ],
    sources: [
      "HUMANITARIAN / DISPLACEMENT: UNHCR Sudan, OCHA Sudan, IOM displacement tracking, WFP food security monitoring",
      "CONFLICT MONITOR: ACLED Sudan, Sudan War Monitor, Radio Dabanga (Darfur focus)",
      "WIRE / GLOBAL PRESS: Reuters, AP, BBC Africa, Al Jazeera, The Guardian Africa",
      "ATROCITY / HUMAN RIGHTS: Human Rights Watch Sudan, Amnesty International, UN Fact-Finding Mission",
      "OFFICIAL / STATE: SAF spokesperson, Sudan Sovereignty Council, IGAD mediation statements",
      "MEDICAL / HEALTH: WHO Sudan situation reports, MSF field reports, Sudan doctors networks",
    ],
    evidencePosture: "CONTESTED",
    confidenceRationale: "Sudan presents the worst evidence environment of any monitored theater. Neither SAF nor RSF publishes meaningful operational data; access restrictions prevent independent verification of atrocity claims, casualty counts, and territorial control across most of Darfur. Humanitarian data — displacement, famine — is more reliably tracked than military data through OCHA, UNHCR, and WFP, but even that data suffers from access limitations. Military evidence confidence in this theater is the lowest of any active conflict in this system.",
    claimNotes: [
      "RSF territorial control estimates vary significantly across monitoring organizations — ground truth access in Darfur is severely restricted, and frontline reporting depends primarily on satellite imagery and local networks.",
      "SAF airstrike civilian casualty figures rely on Sudan doctors networks and ACLED event coding — not independently verified at precision, and likely undercounted due to access restrictions.",
      "External actor involvement (UAE support for RSF; Egyptian and Eritrean SAF support) is documented by UN panels but officially denied — both governments dispute the characterization of their involvement as direct military support.",
    ],
  },

  // ─── MYANMAR ─────────────────────────────────────────────────────────────────
  myanmar: {
    id: "myanmar",
    short: "Myanmar",
    codename: "DELTA",
    title: "MYANMAR MULTI-FRONT GRID",
    region: "Southeast Asia",
    classification: "OPEN SOURCE // TERRITORIAL CONTEST",
    sourceDiscipline: "Sub-theater dynamics matter more than any headline summary. Ethnic armed organization diversity requires per-front sourcing. Junta figures are propagandistic and should be discounted.",
    statusLine:
      "Resistance forces have made significant territorial gains since Operation 1027 in late 2023 and its continuation in 2024, capturing major towns in Shan, Rakhine, Chin, Kayah, and Sagaing states. Junta control has materially contracted. Military control of border trade towns and strategic roads has been lost in multiple areas. The junta continues to rely on airpower and artillery to suppress resistance advances given its declining ground force capacity.",
    overview:
      "Myanmar's multi-front civil war entered a qualitatively new phase following Operation 1027 (October 2023), in which the Three Brotherhood Alliance — consisting of the Arakan Army (AA), Myanmar National Democratic Alliance Army (MNDAA), and Ta'ang National Liberation Army (TNLA) — launched coordinated offensives that captured numerous towns in northern Shan State, including Laukkaing, a key border trade hub with China. This offensive demonstrated that resistance forces had achieved a coordination and operational planning capacity that the junta could not match with available ground forces. Subsequent operations have expanded to Rakhine State (Arakan Army), Chin State, and Sagaing, with resistance forces capturing significant towns and road networks. The junta's primary remaining tool is airpower — including jet strikes, helicopter gunships, and drone strikes — against civilian and resistance populations, causing mass displacement. Junta territorial control has materially contracted, and the junta's ability to govern effectively outside Naypyidaw and Yangon is increasingly limited.",
    escalationDrivers: [
      "Mandalay or Naypyidaw threat: If resistance forces advance within operational striking distance of Myanmar's second city or the capital, junta response would likely involve indiscriminate bombardment and potential political collapse.",
      "China-brokered stabilization: Chinese pressure on the Brotherhood Alliance (which operates along the Chinese border) could freeze territorial gains and restore a junta-favorable status quo in the north — the primary external constraint on resistance progress.",
      "Junta airpower escalation: Increased indiscriminate airstrike frequency targeting populated resistance-held towns is both a humanitarian concern and a sign of junta desperation, which can accelerate civilian displacement at scale.",
    ],
    watchNext: [
      "Arakan Army consolidation in Rakhine State — control of Sittwe port would be a strategic inflection point.",
      "Sagaing and Magwe resistance operations — central Myanmar advance would threaten junta strategic depth.",
      "Junta military defection rates — accelerating defections signal institutional collapse pressure.",
    ],
    friendly: {
      label: "Myanmar Junta (SAC / Tatmadaw)",
      equipmentLosses: "Significant — multiple base captures, aircraft losses confirmed via OSINT",
      tankLosses: "Confirmed losses in northern Shan, Rakhine — OSINT documented",
      armoredLosses: "Multiple vehicles confirmed captured or destroyed",
      casualties: "Junta does not publish; estimated at tens of thousands via monitoring",
      killed: "No official figure; estimated via resistance claims and OSINT",
    },
    opposing: {
      label: "Resistance / EAO Alliance",
      equipmentLosses: "Captured junta equipment is primary asset — losses limited in reporting",
      tankLosses: "N/A — resistance primarily light-infantry forces",
      armoredLosses: "Limited — some captured vehicles deployed",
      casualties: "Reported via ethnic EAO statements — significant but unverified totals",
      killed: "Partial figures via individual EAO reporting",
    },
    indicators: [
      "Territorial control snapshot: The rate of town, road junction, and base capture by resistance forces is the primary indicator of momentum. Any reversal in multiple fronts simultaneously would signal a junta stabilization.",
      "Junta airpower frequency: Airstrike rate on resistance-held and civilian areas tracks junta ground force pressure and is inversely related to junta's ability to defend using infantry.",
      "Resistance coordination quality: Whether EAOs coordinate offensive timing and logistics across multiple fronts (as in Operation 1027) versus operating in isolation determines whether the resistance can achieve strategic-level breakthroughs.",
      "China pressure on Brotherhood Alliance: Chinese diplomatic and economic pressure on the MNDAA and TNLA — which operate adjacent to the Chinese border — is the primary external variable capable of freezing northern Shan State operations.",
      "Junta defection rate: Battalion-level defections from the Tatmadaw to the People's Defense Force or ethnic armies are a leading indicator of institutional collapse and change the balance of forces directly.",
      "Humanitarian displacement: IDP totals in Myanmar now exceed 3 million. Displacement surges following major offensives, particularly junta airstrikes on newly resistance-held areas, are a consistent pattern indicator.",
    ],
    sectors: [
      { name: "Resistance Territorial Momentum", value: 84 },
      { name: "Junta Airpower Pressure", value: 73 },
      { name: "Multi-Front Coordination", value: 79 },
      { name: "China Stabilization Risk", value: 58 },
      { name: "Information Certainty", value: 46 },
    ],
    sources: [
      "CONFLICT MONITOR: ACLED Myanmar, ISP-Myanmar (Institute for Strategy and Policy), Fortify Rights",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, RFA (Radio Free Asia), Irrawaddy",
      "MILITARY / TERRITORIAL: Myanmar Witness (OSINT), BNI (Burma News International), The Irrawaddy battlefield maps",
      "HUMANITARIAN / DISPLACEMENT: UNHCR Myanmar, OCHA, Assistance Association for Political Prisoners (AAPP)",
      "ETHNIC / LOCAL REPORTING: Karen News, Chin Human Rights Organization, Shan Human Rights Foundation",
      "OFFICIAL / ADVERSARIAL: Myanmar junta state media (Global New Light of Myanmar — adversarial propaganda frame)",
    ],
    evidencePosture: "MIXED",
    confidenceRationale: "OSINT through Myanmar Witness, BNI, and resistance-affiliated reporting provides reasonable territorial control tracking; ISP-Myanmar and ACLED provide conservative cross-checks on EAO claims. Junta casualty and equipment figures are treated as propaganda and systematically discounted. Airstrike impact is partially confirmed via satellite imagery. Overall assessment: medium confidence — better than Sudan and DRC, worse than Ukraine, with the junta's information suppression as the primary limiting factor.",
    claimNotes: [
      "Junta casualty and equipment loss figures should be treated as propaganda — independent monitoring organizations consistently find higher junta losses than officially stated.",
      "EAO territorial capture claims are generally directionally accurate but are sometimes inflated on first reporting — ISP-Myanmar and ACLED cross-checks typically confirm a conservative subset of claimed captures within days.",
      "Chinese diplomatic pressure on northern Brotherhood Alliance EAOs is confirmed in general terms, but exact operational conditions and boundaries of any Chinese-mediated freeze are not publicly verified.",
    ],
  },

  // ─── EASTERN DRC ─────────────────────────────────────────────────────────────
  drc: {
    id: "drc",
    short: "Eastern DRC",
    codename: "RIFT",
    title: "EASTERN DRC REBEL GRID",
    region: "Central Africa",
    classification: "OPEN SOURCE // REGIONALIZED INSTABILITY",
    sourceDiscipline: "Displacement and route-control signals are more reliably tracked than force casualty counts. M23/RDF attribution requires Rwanda-Congo diplomatic-frame separation.",
    statusLine:
      "M23 rebels — with direct Rwandan Defense Forces (RDF) support confirmed by UN and multiple intelligence sources — have seized Goma (January 2025), Bukavu (February 2025), and large portions of eastern DRC. FARDC forces are in structured retreat. The conflict has caused one of Africa's worst active displacement crises. Regional diplomatic pressure from the AU and SADC has not halted operations. Ceasefire negotiations are stalled.",
    overview:
      "The eastern DRC conflict has entered a significantly escalated phase following the M23 rebel movement's capture of Goma, the regional capital of North Kivu, in January 2025. M23 — backed by Rwandan Defense Forces in a relationship that Rwanda officially denies but that has been documented by multiple UN Group of Experts reports and foreign intelligence assessments — subsequently advanced on and captured Bukavu, the capital of South Kivu. FARDC (DRC armed forces) have retreated in structured disarray, and DRC has expelled Rwandan diplomatic staff. The humanitarian consequences are severe — Goma's capture displaced over 400,000 civilians in addition to the existing 7 million+ person displacement crisis in eastern DRC. South African and other SADC forces deployed under a peace mandate have faced direct fire from M23/RDF forces. Regional diplomatic efforts through the Luanda and Nairobi processes have been suspended.",
    escalationDrivers: [
      "M23/RDF advance toward Kinshasa strategic depth: An advance beyond South Kivu toward Maniema, Kasai, or Tanganyika provinces would create a political crisis in Kinshasa and risk direct confrontation with expanded SADC forces.",
      "Direct DRC-Rwanda interstate war declaration: DRC has formally accused Rwanda of occupation. Any Congolese military mobilization against Rwandan territory, or Rwandan extension of operations explicitly westward, would create a formal interstate war with regional escalation risk.",
      "Mineral infrastructure targeting: Eastern DRC's coltan, gold, and other mineral resources are a primary financial driver of the conflict. Any systematic targeting of mining infrastructure would have supply chain consequences for global technology supply.",
    ],
    watchNext: [
      "M23 advance beyond Bukavu — next objectives signal whether territorial ambition is limited or strategic.",
      "SADC force posture — whether SADC SAMIDRC mission receives reinforcements or withdraws.",
      "AU/SADC ceasefire negotiation status — Luanda and Nairobi process resumption.",
    ],
    friendly: {
      label: "DRC Armed Forces (FARDC) + SADC",
      equipmentLosses: "Significant — multiple bases and heavy equipment lost in Goma and North Kivu",
      tankLosses: "Confirmed vehicle losses in North Kivu",
      armoredLosses: "Multiple APCs confirmed captured or destroyed",
      casualties: "DRC MoD does not consistently publish; estimated via humanitarian and monitor reporting",
      killed: "Partial official release — significant FARDC losses not fully acknowledged",
    },
    opposing: {
      label: "M23 / RDF-Backed Forces",
      equipmentLosses: "Limited confirmed losses — M23 advancing, not retreating",
      tankLosses: "Limited",
      armoredLosses: "Limited",
      casualties: "M23 does not publish; limited reporting via monitoring organizations",
      killed: "Estimated via OCHA and conflict tracker reporting — not comprehensively verified",
    },
    indicators: [
      "M23 territorial advance pace: The rate of M23 expansion beyond Goma and Bukavu toward the western provinces is the primary indicator of whether this is a limited territorial operation or a strategy aimed at regime pressure.",
      "Rwandan military presence confirmation: Independent verification of RDF presence, command involvement, and weapons supply to M23 tracks the degree of interstate conflict versus proxy conflict and affects UN/AU diplomatic options.",
      "Displacement figure trajectory: IDP totals in eastern DRC (already among the world's largest) are moving in direct correlation with M23 advance pace. Any sustained increase above 8 million IDPs signals a humanitarian system near-collapse.",
      "SADC mission coherence: Whether SADC SAMIDRC forces (primarily South African, Malawian, Tanzanian) hold their positions or withdraw under M23/RDF pressure determines whether there is any organized armed check on M23 advance.",
      "Mineral revenue control: M23 and Rwanda's access to eastern DRC mineral sites — coltan, gold, tin, tungsten — provides economic fuel for continued operations. Changes in mining area control track economic warfare as well as military advance.",
      "Humanitarian access: Aid organizations' ability to operate in Goma, Bukavu, and North/South Kivu determines civilian mortality outcomes. M23 has restricted some access; any systematic closure of humanitarian corridors is a tier-one humanitarian indicator.",
    ],
    sectors: [
      { name: "M23 / RDF Advance Pressure", value: 88 },
      { name: "Mass Civilian Displacement", value: 93 },
      { name: "Rwanda Interstate Risk", value: 77 },
      { name: "Humanitarian System Stress", value: 89 },
      { name: "Information Certainty", value: 51 },
    ],
    sources: [
      "CONFLICT MONITOR: ACLED DRC, UN Group of Experts (Congo), Congo Research Group",
      "OFFICIAL / STATE: DRC government statements, Rwandan government (denial frame), SADC mission reports",
      "HUMANITARIAN / DISPLACEMENT: OCHA DRC, UNHCR, IOM displacement tracking, MSF field reporting",
      "WIRE / GLOBAL PRESS: Reuters, AP, AFP, Radio Okapi, RFI Afrique",
      "ATROCITY / HUMAN RIGHTS: Human Rights Watch DRC, Amnesty International, UN MONUSCO reporting",
      "REGIONAL / DIPLOMATIC: AU Peace and Security Council statements, ICJ DRC vs. Rwanda proceedings",
    ],
    evidencePosture: "CONTESTED",
    confidenceRationale: "Rwandan military involvement is documented by multiple independent UN Group of Experts reports and Western intelligence assessments, but is officially denied by Rwanda — creating a fundamental attribution dispute that affects the framing of virtually all military data in this theater. FARDC casualty and equipment figures are not consistently published. M23 losses are not published. Displacement and humanitarian data are more reliably tracked through OCHA and UNHCR than military data through any source. Rwanda's structured denial creates systematic pressure on the theater's information environment.",
    claimNotes: [
      "Rwanda officially denies direct RDF combat involvement in eastern DRC — this denial is contradicted by multiple independent UN Group of Experts reports, Western intelligence assessments, and eyewitness testimony.",
      "M23 casualty and equipment loss figures are not published — losses are estimated via OCHA event data and conflict monitor reporting with low precision and no independent military verification.",
      "Mineral revenue capture by M23 and Rwanda in eastern DRC is documented by UN panels but disputed by the Rwandan government — precise volumes and beneficiary breakdown cannot be independently verified.",
    ],
  },

  // ─── TAIWAN ──────────────────────────────────────────────────────────────────
  taiwan: {
    id: "taiwan",
    short: "Taiwan",
    codename: "RING",
    title: "TAIWAN CONTINGENCY GRID",
    region: "Asia-Pacific",
    classification: "OPEN SOURCE // WARNING MODEL",
    sourceDiscipline: "This theater is a warning and indicator model, not a loss-ledger theater. Sortie counts, exercise patterns, and logistics posture signals outweigh any conventional casualty reporting.",
    statusLine:
      "Pre-contact theater. No kinetic conflict. PRC military activity including ADIZ incursions, naval exercises, and strategic bomber sorties remains elevated above 2020 baselines. U.S. forward posture and Taiwan defense investment are in expansion phase. The political timeline — including Taiwan election outcomes and U.S.-China diplomatic temperature — is more operationally significant than any current military exchange count.",
    overview:
      "The Taiwan theater is a warning-model environment: the relevant question is not what is happening now but what indicators would precede a PRC decision to move toward coercive pressure or military action. The PLA has conducted sustained ADIZ incursions, large-scale encirclement exercises (particularly following the August 2022 Pelosi visit exercises), and has been restructuring joint warfighting capacity specifically for island-seizure scenarios. Taiwan has substantially increased defense spending, is integrating asymmetric warfare capabilities, and has extended conscription requirements. The U.S. has increased arms sales to Taiwan, maintained strategic ambiguity doctrine, and expanded forward presence in the Indo-Pacific. The most significant near-term variables are: PRC political messaging around key anniversaries and Taiwan government positions, U.S. arms delivery timelines versus PLA modernization completion, and any shift in U.S. strategic ambiguity posture.",
    escalationDrivers: [
      "Taiwan independence declaration: Any formal move by Taiwan's government toward independence declaration — as distinct from the current status quo — would trigger PRC military response under stated doctrine. This is the maximum escalation trigger.",
      "U.S. strategic ambiguity breakdown: Any explicit U.S. commitment to defend Taiwan militarily (or explicit denial) would alter PRC calculus on the cost-benefit of coercive action.",
      "PLA modernization completion milestones: PRC military planners have structured their modernization toward joint amphibious and air-superiority capability. Achievement of certain readiness milestones creates a window-of-opportunity dynamic.",
    ],
    watchNext: [
      "PLA exercise frequency and geographic scope near Taiwan — deviation from normal baselines is the primary near-term indicator.",
      "U.S.-China diplomatic temperature — senior leader communication, trade/sanction dynamics.",
      "Taiwan defense procurement and delivery status — asymmetric warfare capability development timeline.",
    ],
    friendly: {
      label: "Taiwan / U.S. / Partners",
      equipmentLosses: "N/A — pre-contact theater",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "N/A",
      killed: "N/A",
    },
    opposing: {
      label: "PRC Forces (PLA / PLAN / PLAAF)",
      equipmentLosses: "N/A — pre-contact theater",
      tankLosses: "N/A",
      armoredLosses: "N/A",
      casualties: "N/A",
      killed: "N/A",
    },
    indicators: [
      "PLA ADIZ incursion pattern: Taiwan ADIZ violations are tracked daily. Sustained above-baseline incursion rates — particularly by H-6 bombers, Y-20 transports, or combined-arm sortie packages — signal increased pressure tempo rather than normal operations.",
      "PLA amphibious and logistics exercises: Large-scale exercises combining PLAN, PLAAF, and PLA Ground Forces in amphibious and blockade scenarios are the most significant military warning indicator. The August 2022 exercises established a new pattern template.",
      "PRC political messaging cadence: Xi Jinping and CMC statements on Taiwan, particularly around CCP Congress sessions and National Day (October 1), track the political priority assigned to Taiwan and the escalation warning posture.",
      "U.S. arms delivery pipeline: The gap between congressional authorization and actual delivery of key asymmetric systems (Harpoon, HIMARS, F-16 upgrades, Stingers) determines Taiwan's actual defensive capacity versus assessed capacity.",
      "Economic coercion indicators: PRC trade sanctions, tourism restrictions, and import bans on Taiwanese goods are a non-military coercion indicator that tracks Beijing's willingness to accept economic costs to apply pressure.",
      "Diplomatic isolation campaign: PRC success in pressuring countries to withdraw Taiwan diplomatic recognition (currently 12 official allies remain) and blocking Taiwan from international organization participation tracks long-term coercion strategy.",
    ],
    sectors: [
      { name: "Mobilization Signal Level", value: 71 },
      { name: "Naval Encirclement Posture", value: 77 },
      { name: "Airspace Pressure Tempo", value: 74 },
      { name: "Diplomatic Isolation Campaign", value: 64 },
      { name: "Warning Model Confidence", value: 68 },
    ],
    sources: [
      "OFFICIAL / STATE: Taiwan MND daily ADIZ reports, U.S. Indo-Pacific Command statements, PRC MoD (adversarial frame)",
      "CONFLICT MONITOR / TRACKER: CSIS China Power tracker, RAND Taiwan Strait analysis, IISS China military balance",
      "WIRE / GLOBAL PRESS: Reuters, AP, Bloomberg, Taipei Times, South China Morning Post",
      "MILITARY ANALYSIS: CNAS Taiwan Strait analysis, Michael O'Hanlon (Brookings), Janes PLA order of battle",
      "INTELLIGENCE / WARNING: DoD China Military Power Report (annual), IC Worldwide Threat Assessment",
      "DIPLOMATIC / ECONOMIC: USCC (U.S.-China Economic and Security Review Commission) annual report, Rhodium Group China-Taiwan economic tracking",
    ],
    evidencePosture: "LIKELY",
    confidenceRationale: "As a pre-contact theater, Taiwan presents an intelligence picture built on indicators rather than battle damage. ADIZ incursion data is officially tracked by the Taiwan Ministry of National Defense and is reliable. PLA exercise activity is publicly announced and satellite-observable. Force capability assessments draw from DoD China Military Power reports, RAND analysis, and IISS military balance. Evidence confidence is moderate-to-high on capability; the primary uncertainty is intent and timeline, which cannot be reliably estimated from open-source data alone.",
    claimNotes: [
      "PLA readiness timelines vary significantly across Western intelligence and think-tank assessments — 2027, 2035, and 'no hard deadline' all represent credible assessed positions, and none is definitively validated.",
      "Taiwan's asymmetric defense procurement is fully budgeted but delivery timelines have historically slipped — assessed capability should be distinguished from planned capability on any specific system.",
      "PRC political signals on Taiwan are issued for multiple domestic and international audiences simultaneously — they should not be read as direct operational indicators without corroborating military posture signals.",
    ],
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
  iran:    ["REGIONAL WAR", "ESCALATION WAVE", "CHOKEPOINT PRESSURE"],
  ukraine: ["ATTRITION LOCK", "CONTESTED PRESSURE", "INFRASTRUCTURE STRAIN"],
  gaza:    ["URBAN STRIKE PRESSURE", "HIGH-HEAT URBAN GRID", "HUMANITARIAN CRITICAL"],
  lebanon: ["CEASEFIRE FRICTION", "NORTHERN FRONT PRESSURE", "HEZBOLLAH RECONSTITUTION"],
  syria:   ["TRANSITION VOLATILITY", "ISIS RESURGENCE", "MULTI-ACTOR FRAGMENT"],
  yemen:   ["MARITIME INTERDICTION", "SHIPPING DISRUPTION", "CHOKEPOINT PRESSURE"],
  sudan:   ["STATE COLLAPSE", "HUMANITARIAN BREAKDOWN", "DARFUR ATROCITY RISK"],
  myanmar: ["RESISTANCE ADVANCE", "JUNTA AIRPOWER PRESSURE", "MULTI-FRONT MOMENTUM"],
  drc:     ["M23 OFFENSIVE", "REGIONALIZED INSTABILITY", "DISPLACEMENT SURGE"],
  taiwan:  ["PRE-CONTACT TENSION", "ESCALATION WATCH", "MOBILIZATION SIGNAL"],
};

export const CONFIDENCE_MAP: Record<string, string[]> = {
  iran:    ["B / FAST-MOVING", "B- / CLAIM-HEAVY", "C+ / HIGHLY CONTESTED"],
  ukraine: ["B / COMPILED LEDGER", "B- / MIXED ESTIMATE", "B / EQUIPMENT-VERIFIED"],
  gaza:    ["C / FRAGMENTED", "C- / CLAIM-HEAVY", "C / MIXED SOURCES"],
  lebanon: ["B- / ACTIVE FRONT", "C+ / CLAIM-MIXED", "B- / STRIKE-HEAVY"],
  syria:   ["C+ / TRANSITION", "C / MULTI-ACTOR", "C+ / FRAGMENTED"],
  yemen:   ["B- / MARITIME TRACK", "C+ / ACTIVE", "B- / SYSTEM-EFFECT"],
  sudan:   ["B- / HUMANITARIAN", "C+ / FRAGMENTED", "C+ / CLAIM-MIXED"],
  myanmar: ["B- / MULTI-FRONT", "C+ / EAO-SOURCED", "B- / TERRITORIAL"],
  drc:     ["B- / REGIONALIZED", "C+ / MIXED", "B- / DISPLACEMENT-LED"],
  taiwan:  ["B / INDICATOR-DRIVEN", "B+ / WATCH MODEL", "B / WARNING POSTURE"],
};
