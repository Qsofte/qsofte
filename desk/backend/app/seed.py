"""Reference data the Desk starts with: domains, the initiative landscape, events, feeds, guides.

Public information only (this repository is public). Idempotent: inserts what is missing by
slug or name, fills fields that are still blank, and never overwrites anything edited in the
app. No notes are seeded; notes are written by people.

Facts move: each initiative's status and summary are starting points to check, and the
Landscape page says so.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Domain, Event, Feed, Guide, Initiative
from .seed_guides import GUIDES

DOMAINS = [
    ("cross-border", "D1", "Global and cross-border",
     "Multilateral linking of payment systems, correspondent banking change, ISO 20022 and the G20 cross-border targets."),
    ("real-time-rails", "D2", "Domestic rails and real-time payments",
     "Instant payment systems, QR schemes and the overlay services built on them, by market."),
    ("digital-assets", "D3", "Digital assets",
     "Stablecoins, CBDCs and tokenised securities, and the rules forming around them."),
    ("tokenised-deposits", "D4", "Tokenised deposits",
     "Commercial bank money on shared ledgers, and wholesale settlement for tokenised assets."),
    ("regulation", "D5", "Regulation and compliance",
     "Payments regulation, scam and fraud liability, operational resilience and AI rules."),
    ("innovation", "D6", "Innovation",
     "Agentic payments, pay by bank, open banking and AI in fraud and operations."),
]


def I(slug, name, domain, kind, status, regions, summary, lead="", participants="", started=None,
      aliases="", url=""):
    return dict(slug=slug, name=name, domain=domain, kind=kind, status=status, regions=regions,
                summary=summary, lead=lead, participants=participants, started=started,
                aliases=aliases, url=url)


INITIATIVES = [
    # ---- D1 Global and cross-border -------------------------------------------------
    I("nexus", "Project Nexus", "cross-border", "cross-border", "pilot", ["IN", "SG", "ASEAN"],
      "One hub that links domestic instant payment systems, so each country connects once instead of "
      "building a bilateral link with every other. Designed by the BIS Innovation Hub and now being "
      "built for live use by Nexus Global Payments.",
      lead="Nexus Global Payments (from a BIS Innovation Hub design)",
      participants="Founding central banks of India, Malaysia, the Philippines, Singapore and Thailand",
      started=2021, aliases="Nexus Global Payments, NGP",
      url="https://www.bis.org/about/bisih/topics/fmis/nexus.htm"),
    I("agora", "Project Agorá", "cross-border", "central-bank", "research", ["GLOBAL", "EU", "UK", "US", "JP"],
      "Tests tokenised correspondent banking: tokenised commercial bank deposits and wholesale central bank "
      "money on one programmable platform, aiming at faster, cheaper cross-border payments.",
      lead="BIS, with the Institute of International Finance",
      participants="Bank of France (for the Eurosystem), Bank of Japan, Bank of Korea, Bank of Mexico, Swiss "
                   "National Bank, Bank of England and the Federal Reserve Bank of New York; over 40 private firms",
      started=2024, aliases="Agora, Agorá",
      url="https://www.bis.org/about/bisih/topics/fmis/agora.htm"),
    I("mandala", "Project Mandala", "cross-border", "central-bank", "research", ["AU", "SG", "ASEAN"],
      "Encodes each country's policy and compliance rules into a shared protocol so cross-border payments "
      "can be checked automatically before they are sent.",
      lead="BIS Innovation Hub Singapore Centre",
      participants="Reserve Bank of Australia, Bank of Korea, Bank Negara Malaysia, Monetary Authority of Singapore",
      started=2022, url="https://www.bis.org/about/bisih/topics/cbdc/mandala.htm"),
    I("mbridge", "mBridge", "cross-border", "cross-border", "pilot", ["HK", "CN", "GULF", "ASEAN"],
      "Shared platform where central banks issue wholesale CBDC for cross-border payments. Reached minimum "
      "viable product in 2024; the BIS stepped back from the project later that year and the central banks continue it.",
      lead="Participating central banks",
      participants="Hong Kong Monetary Authority, Bank of Thailand, People's Bank of China (Digital Currency "
                   "Institute), Central Bank of the UAE, Saudi Central Bank",
      started=2021, aliases="Project mBridge, m-Bridge"),
    I("dunbar", "Project Dunbar", "cross-border", "central-bank", "ended", ["AU", "SG", "ASEAN", "AFRICA"],
      "Prototyped a shared platform for several central banks' digital currencies, so institutions could pay "
      "each other across borders directly.",
      lead="BIS Innovation Hub Singapore Centre",
      participants="Reserve Bank of Australia, Bank Negara Malaysia, Monetary Authority of Singapore, "
                   "South African Reserve Bank", started=2021),
    I("icebreaker", "Project Icebreaker", "cross-border", "central-bank", "ended", ["EU", "GLOBAL"],
      "Tested a hub connecting retail CBDC systems for cross-border payments, with an FX-provider marketplace.",
      lead="BIS Innovation Hub Nordic Centre",
      participants="Bank of Israel, Norges Bank, Sveriges Riksbank", started=2022),
    I("jura", "Project Jura", "cross-border", "central-bank", "ended", ["EU"],
      "Cross-border settlement of tokenised assets and FX using two wholesale CBDCs on one DLT platform.",
      lead="BIS Innovation Hub Swiss Centre",
      participants="Banque de France, Swiss National Bank, private sector partners", started=2021),
    I("mariana", "Project Mariana", "cross-border", "central-bank", "ended", ["EU", "SG"],
      "Tested cross-border exchange of wholesale CBDCs using automated market makers on a public blockchain.",
      lead="BIS Innovation Hub (Swiss, Singapore and Eurosystem centres)",
      participants="Banque de France, Monetary Authority of Singapore, Swiss National Bank", started=2022),
    I("upi-paynow", "UPI–PayNow link", "cross-border", "cross-border", "live", ["IN", "SG"],
      "Bilateral link between India's UPI and Singapore's PayNow for real-time person-to-person transfers.",
      lead="Reserve Bank of India and Monetary Authority of Singapore", started=2023,
      aliases="UPI-PayNow, PayNow-UPI"),
    I("paynow-promptpay", "PayNow–PromptPay link", "cross-border", "cross-border", "live", ["SG", "ASEAN"],
      "The first bilateral link between two fast payment systems (Singapore and Thailand), using mobile numbers.",
      lead="Monetary Authority of Singapore and Bank of Thailand", started=2021,
      aliases="PromptPay-PayNow"),
    I("asean-rpc", "ASEAN Regional Payment Connectivity", "cross-border", "cross-border", "live", ["ASEAN"],
      "Central bank cooperation to link QR and fast payment systems across ASEAN. Five central banks signed in "
      "2022 (Indonesia, Malaysia, the Philippines, Singapore, Thailand); others have joined since.",
      lead="ASEAN central banks", started=2022, aliases="Regional Payment Connectivity"),
    I("buna", "Buna", "cross-border", "cross-border", "live", ["GULF", "AFRICA"],
      "Multi-currency cross-border payment system for Arab and partner countries.",
      lead="Arab Regional Payments Clearing and Settlement Organization (Arab Monetary Fund)", started=2020),
    I("iso-20022", "ISO 20022 migration", "cross-border", "standard", "live", ["GLOBAL"],
      "Richer, structured payment messages. Swift's coexistence period for cross-border payments ended in "
      "November 2025; domestic high-value systems are migrating on their own timelines.",
      lead="Swift and payment system operators", aliases="ISO20022, MX messages"),
    I("g20-roadmap", "G20 cross-border roadmap", "cross-border", "regulation", "live", ["GLOBAL"],
      "Targets for cheaper, faster, more transparent and more accessible cross-border payments by end-2027, "
      "coordinated by the FSB with the CPMI.",
      lead="Financial Stability Board and CPMI", started=2020,
      aliases="G20 roadmap, cross-border payments roadmap"),

    # ---- D2 Domestic rails, real-time payments and QR ------------------------------
    I("npp-payto", "NPP and PayTo", "real-time-rails", "payment-system", "live", ["AU"],
      "Australia's New Payments Platform: real-time account-to-account payments with PayID addressing, Osko, "
      "and PayTo mandated payments.", lead="Australian Payments Plus", started=2018,
      aliases="New Payments Platform, PayTo, PayID, Osko"),
    I("becs-decommission", "BECS decommissioning", "real-time-rails", "payment-system", "live", ["AU"],
      "Plan to retire the Bulk Electronic Clearing System by 2030 and move direct entry volume to the NPP.",
      lead="Australian Payments Network and industry", started=2024, aliases="BECS"),
    I("upi", "UPI", "real-time-rails", "payment-system", "live", ["IN"],
      "India's Unified Payments Interface: interoperable real-time payments from any bank app, now including "
      "credit lines and international links.", lead="National Payments Corporation of India", started=2016,
      aliases="Unified Payments Interface, NPCI"),
    I("fednow-rtp", "FedNow and RTP", "real-time-rails", "payment-system", "live", ["US"],
      "The two US instant payment services: the Federal Reserve's FedNow (2023) and The Clearing House's RTP network (2017).",
      lead="Federal Reserve; The Clearing House", aliases="FedNow, RTP network"),
    I("sepa-instant", "SEPA Instant and Verification of Payee", "real-time-rails", "regulation", "live", ["EU"],
      "EU Instant Payments Regulation: euro instant credit transfers offered at no extra cost, with payee name "
      "checks before payment.", lead="European Union; European Payments Council",
      aliases="SCT Inst, Instant Payments Regulation, Verification of Payee"),
    I("tips", "TIPS", "real-time-rails", "payment-system", "live", ["EU"],
      "TARGET Instant Payment Settlement: the Eurosystem's service settling instant payments in central bank money, 24/7.",
      lead="European Central Bank", started=2018, aliases="TARGET Instant Payment Settlement"),
    I("uk-fps", "UK Faster Payments", "real-time-rails", "payment-system", "live", ["UK"],
      "The UK's real-time payment system, running since 2008.", lead="Pay.UK", started=2008,
      aliases="Faster Payments, FPS"),
    I("uk-npv", "UK National Payments Vision", "real-time-rails", "regulation", "research", ["UK"],
      "UK government plan for next-generation payments infrastructure and a renewed Faster Payments system.",
      lead="HM Treasury", started=2024, aliases="National Payments Vision"),
    I("pix", "Pix", "real-time-rails", "payment-system", "live", ["LATAM"],
      "Brazil's instant payment system, with QR codes, keys and fast-growing overlay services.",
      lead="Banco Central do Brasil", started=2020),
    I("paynow", "PayNow and FAST", "real-time-rails", "payment-system", "live", ["SG"],
      "Singapore's instant transfers addressed by mobile number or company ID, running on FAST.",
      lead="Association of Banks in Singapore; MAS", started=2017),
    I("promptpay", "PromptPay", "real-time-rails", "payment-system", "live", ["ASEAN"],
      "Thailand's national instant payment service, addressed by phone or ID number.",
      lead="Bank of Thailand; National ITMX", started=2017),
    I("duitnow", "DuitNow", "real-time-rails", "payment-system", "live", ["ASEAN"],
      "Malaysia's real-time transfer service with proxy addressing and a national QR.",
      lead="PayNet (Payments Network Malaysia)", started=2018),
    I("bi-fast", "BI-FAST", "real-time-rails", "payment-system", "live", ["ASEAN"],
      "Indonesia's central bank real-time retail payment infrastructure.", lead="Bank Indonesia", started=2021),
    I("instapay", "InstaPay", "real-time-rails", "payment-system", "live", ["ASEAN"],
      "The Philippines' real-time low-value electronic fund transfer service.", lead="Philippine Payments Management Inc. (BSP oversight)", started=2018),
    I("hk-fps", "Hong Kong Faster Payment System", "real-time-rails", "payment-system", "live", ["HK"],
      "Real-time payments in HKD and RMB across banks and wallets, with proxy addressing and QR.",
      lead="Hong Kong Monetary Authority", started=2018, aliases="FPS Hong Kong"),
    I("aani", "Aani", "real-time-rails", "payment-system", "live", ["GULF"],
      "The UAE's instant payment platform.", lead="Al Etihad Payments (Central Bank of the UAE)", started=2023),
    I("emvco-qr", "EMVCo QR specification", "real-time-rails", "qr", "live", ["GLOBAL"],
      "The common format for payment QR codes, both merchant-presented and consumer-presented. Most national "
      "QR standards build on it.", lead="EMVCo", aliases="EMV QR, EMVCo QR"),
    I("india-qr", "UPI QR and BharatQR", "real-time-rails", "qr", "live", ["IN"],
      "India's interoperable QR acceptance, mostly UPI QR at merchants of every size.", lead="NPCI", aliases="BharatQR, UPI QR"),
    I("sgqr", "SGQR", "real-time-rails", "qr", "live", ["SG"],
      "Singapore's single QR label combining many payment schemes at a merchant.", lead="MAS and IMDA", started=2018),
    I("thai-qr", "Thai QR Payment", "real-time-rails", "qr", "live", ["ASEAN"],
      "Thailand's standard QR for PromptPay and card schemes.", lead="Bank of Thailand", started=2017,
      aliases="Thai QR, PromptPay QR"),
    I("duitnow-qr", "DuitNow QR", "real-time-rails", "qr", "live", ["ASEAN"],
      "Malaysia's national QR standard.", lead="PayNet", started=2019),
    I("qris", "QRIS", "real-time-rails", "qr", "live", ["ASEAN"],
      "Quick Response Code Indonesian Standard: one national QR for all payment providers, and the base for "
      "cross-border QR links in ASEAN.", lead="Bank Indonesia", started=2019),
    I("qr-ph", "QR Ph", "real-time-rails", "qr", "live", ["ASEAN"],
      "The Philippines' national QR standard over InstaPay and PESONet.", lead="Bangko Sentral ng Pilipinas", started=2019),
    I("alipay-plus", "Alipay+", "real-time-rails", "industry", "live", ["CN", "ASEAN"],
      "Lets travellers pay abroad with their home e-wallets at merchants that accept Alipay+.",
      lead="Ant International", started=2020),

    # ---- D3 Digital assets ---------------------------------------------------------
    I("stablecoin-rules", "Stablecoin regimes", "digital-assets", "regulation", "live", ["GLOBAL"],
      "How the major jurisdictions license and supervise stablecoin issuers. See MiCA, the GENIUS Act and the "
      "Hong Kong and Singapore frameworks.", aliases="stablecoin"),
    I("mica", "MiCA", "digital-assets", "regulation", "live", ["EU"],
      "EU Markets in Crypto-Assets Regulation. Stablecoin rules applied from mid-2024 and the full regime "
      "from end-2024.", lead="European Union; ESMA and EBA", started=2023,
      aliases="Markets in Crypto-Assets"),
    I("genius-act", "GENIUS Act", "digital-assets", "regulation", "live", ["US"],
      "US federal framework for payment stablecoins, signed into law in July 2025.", lead="US Congress",
      started=2025),
    I("hk-stablecoins", "Hong Kong stablecoin regime", "digital-assets", "regulation", "live", ["HK"],
      "Licensing of fiat-referenced stablecoin issuers under the Stablecoins Ordinance, in force from 2025.",
      lead="Hong Kong Monetary Authority", started=2025, aliases="Stablecoins Ordinance"),
    I("mas-stablecoins", "MAS stablecoin framework", "digital-assets", "regulation", "live", ["SG"],
      "Singapore's framework for single-currency stablecoins issued in Singapore.",
      lead="Monetary Authority of Singapore", started=2023),
    I("digital-euro", "Digital euro", "digital-assets", "central-bank", "research", ["EU"],
      "ECB preparation of a retail CBDC, pending EU legislation.", lead="European Central Bank", started=2021),
    I("digital-pound", "Digital pound", "digital-assets", "central-bank", "research", ["UK"],
      "Design work on a possible UK retail CBDC.", lead="Bank of England and HM Treasury", started=2023),
    I("e-rupee", "e-rupee", "digital-assets", "central-bank", "pilot", ["IN"],
      "RBI's retail and wholesale CBDC pilots.", lead="Reserve Bank of India", started=2022,
      aliases="e₹, digital rupee"),
    I("e-cny", "e-CNY", "digital-assets", "central-bank", "pilot", ["CN"],
      "China's retail CBDC, in large-scale pilot.", lead="People's Bank of China", started=2020,
      aliases="digital yuan, e-CNY"),
    I("eaud", "eAUD pilot", "digital-assets", "central-bank", "ended", ["AU"],
      "RBA and the Digital Finance CRC tested use cases for a pilot Australian CBDC; followed by Project Acacia.",
      lead="Reserve Bank of Australia; Digital Finance CRC", started=2022),
    I("project-guardian", "Project Guardian", "digital-assets", "central-bank", "pilot", ["SG", "GLOBAL"],
      "MAS-led industry pilots of tokenised assets and decentralised finance under regulatory guard rails.",
      lead="Monetary Authority of Singapore", started=2022),
    I("project-orchid", "Project Orchid", "digital-assets", "central-bank", "pilot", ["SG"],
      "MAS work on purpose-bound money: digital money with conditions on how it can be spent.",
      lead="Monetary Authority of Singapore", started=2022, aliases="purpose-bound money"),
    I("uk-dss", "Digital Securities Sandbox", "digital-assets", "regulation", "live", ["UK"],
      "Lets firms issue, trade and settle digital securities under modified rules.",
      lead="Bank of England and FCA", started=2024),

    # ---- D4 Tokenised deposits and wholesale settlement -----------------------------
    I("acacia", "Project Acacia", "tokenised-deposits", "central-bank", "research", ["AU"],
      "RBA and the Digital Finance CRC exploring how wholesale tokenised asset markets in Australia could "
      "settle, including in tokenised central bank money.",
      lead="Reserve Bank of Australia; Digital Finance CRC", started=2023),
    I("ensemble", "Project Ensemble", "tokenised-deposits", "central-bank", "pilot", ["HK"],
      "HKMA programme for tokenised deposits settling interbank in wholesale CBDC, with a sandbox for real use cases.",
      lead="Hong Kong Monetary Authority", started=2024),
    I("pontes", "Pontes", "tokenised-deposits", "central-bank", "pilot", ["EU"],
      "Eurosystem bridge between DLT platforms and TARGET services so tokenised transactions can settle in "
      "central bank money.", lead="European Central Bank", started=2025),
    I("appia", "Appia", "tokenised-deposits", "central-bank", "research", ["EU"],
      "The Eurosystem's longer-term work on an integrated European ecosystem for tokenised finance.",
      lead="European Central Bank", started=2025),
    I("bank-deposit-tokens", "Bank deposit token platforms", "tokenised-deposits", "bank-platform", "live", ["GLOBAL"],
      "Banks' own platforms for programmable, 24/7 movement of deposits.",
      participants="Kinexys (J.P. Morgan), Citi Token Services, HSBC Tokenised Deposit Service, Partior",
      aliases="Kinexys, Citi Token Services, Partior, deposit token, tokenised deposit, tokenized deposit"),
    I("rln", "Regulated Liability Network", "tokenised-deposits", "industry", "research", ["UK", "US"],
      "Shared ledger concept for all regulated money (central bank, commercial bank, e-money).",
      aliases="RLN"),

    # ---- D5 Regulation and compliance ------------------------------------------------
    I("au-spf", "Scams Prevention Framework (AU)", "regulation", "regulation", "live", ["AU"],
      "Australian law placing scam prevention, detection and response duties on banks, telcos and digital "
      "platforms, with sector codes to follow.", lead="Australian Government; ACCC", started=2025,
      aliases="Scams Prevention Framework"),
    I("au-licensing", "Payments licensing reform (AU)", "regulation", "regulation", "research", ["AU"],
      "Bringing payment service providers, including stored value and payment initiation, into one licensing regime.",
      lead="Treasury; ASIC; APRA"),
    I("cps-230", "APRA CPS 230", "regulation", "regulation", "live", ["AU"],
      "Operational risk management standard for APRA-regulated entities, in force from July 2025.",
      lead="APRA", started=2025, aliases="CPS 230"),
    I("cdr", "Consumer Data Right", "regulation", "regulation", "live", ["AU"],
      "Australia's data sharing regime covering banking and energy, with action initiation planned.",
      lead="Treasury; ACCC; OAIC", started=2020, aliases="CDR, open banking Australia"),
    I("psd3", "PSD3 and the Payment Services Regulation", "regulation", "regulation", "research", ["EU"],
      "EU payments rulebook update: licensing, fraud sharing, IBAN-name checks and open banking.",
      lead="European Union", aliases="PSD3, Payment Services Regulation"),
    I("dora", "DORA", "regulation", "regulation", "live", ["EU"],
      "EU Digital Operational Resilience Act, applying from January 2025.", lead="European Union",
      aliases="Digital Operational Resilience Act"),
    I("eu-ai-act", "EU AI Act", "regulation", "regulation", "live", ["EU"],
      "EU rules for AI systems by risk level, applying in phases.", lead="European Union", started=2024,
      aliases="AI Act"),
    I("uk-app-reimbursement", "UK APP fraud reimbursement", "regulation", "regulation", "live", ["UK"],
      "Mandatory reimbursement of authorised push payment scam victims on Faster Payments, shared between "
      "sending and receiving firms.", lead="Payment Systems Regulator", started=2024,
      aliases="APP fraud, APP scam reimbursement"),

    # ---- D6 Innovation -----------------------------------------------------------------
    I("agentic-payments", "Agentic payments", "innovation", "industry", "pilot", ["GLOBAL"],
      "AI agents that find, initiate and authorise payments on someone's behalf, and the scheme rules and "
      "protocols forming around them.", aliases="agentic commerce, AI agent payments"),
    I("visa-intelligent-commerce", "Visa Intelligent Commerce", "innovation", "industry", "pilot", ["GLOBAL"],
      "Visa's programme for agent-initiated card payments using tokenised credentials.", lead="Visa", started=2025),
    I("mastercard-agent-pay", "Mastercard Agent Pay", "innovation", "industry", "pilot", ["GLOBAL"],
      "Mastercard's framework for registered AI agents to pay with agentic tokens.", lead="Mastercard", started=2025),
    I("ap2", "Agent Payments Protocol (AP2)", "innovation", "standard", "pilot", ["GLOBAL"],
      "Open protocol for agents to carry verifiable mandates when they pay.", lead="Google and partners",
      started=2025, aliases="AP2, Agent Payments Protocol"),
    I("pay-by-bank", "Pay by bank and open banking", "innovation", "industry", "live", ["AU", "UK", "EU"],
      "Account-to-account payments at checkout, built on open banking and instant rails.",
      aliases="pay by bank, open banking, open finance, A2A"),
]

# (name, organiser, city, typical month, level, why, domain codes)
EVENTS = [
    ("Sibos", "Swift", "Rotates", 10, "attend",
     "Cross-border, ISO 20022 and tokenisation, with bank decision makers in one place.", ["D1", "D4"]),
    ("Singapore FinTech Festival", "MAS", "Singapore", 11, "attend",
     "Nexus, MAS projects and APAC regulators together.", ["D1", "D3", "D4"]),
    ("Global Fintech Fest", "PCI, NPCI, FCC", "Mumbai", 10, "attend",
     "UPI, RBI direction and India delivery partners.", ["D2", "D5"]),
    ("Australian Payments Network Summit", "AusPayNet", "Sydney", 12, "attend",
     "NPP, BECS migration and scams: the home market.", ["D2", "D5"]),
    ("Intersekt", "FinTech Australia", "Melbourne", 9, "attend", "Australian fintech and CDR community.", ["D6"]),
    ("Money20/20 Europe", "Money20/20", "Amsterdam", 6, "watch", "Pay by bank, PSD3, agentic commerce.", ["D5", "D6"]),
    ("Money20/20 USA", "Money20/20", "Las Vegas", 10, "watch", "Stablecoins, FedNow adoption, vendor landscape.", ["D2", "D3"]),
    ("Point Zero Forum", "", "Zurich", 5, "watch", "Central banks and tokenisation policy; small and senior.", ["D3", "D4"]),
    ("EBAday", "Euro Banking Association", "Rotates", 6, "watch", "European transaction banking and instant payments.", ["D2"]),
]

# Checked to respond with valid RSS/Atom (November 2026). (name, url, kind, relevant_only)
# relevant_only: a busy, general source; keep only items that match a domain or initiative.
FEEDS = [
    ("BIS press releases", "https://www.bis.org/doclist/all_pressrels.rss", "regulator", False),
    ("BIS central bankers' speeches", "https://www.bis.org/doclist/cbspeeches.rss", "regulator", True),
    ("RBA media releases", "https://www.rba.gov.au/rss/rss-cb-media-releases.xml", "regulator", False),
    ("RBA speeches", "https://www.rba.gov.au/rss/rss-cb-speeches.xml", "regulator", False),
    ("RBI press releases", "https://www.rbi.org.in/pressreleases_rss.xml", "regulator", True),
    ("HKMA press releases", "https://www.hkma.gov.hk/eng/other-information/rss/rss_press-release.xml", "regulator", True),
    ("ECB press", "https://www.ecb.europa.eu/rss/press.html", "regulator", True),
    ("Federal Reserve press releases", "https://www.federalreserve.gov/feeds/press_all.xml", "regulator", True),
    ("Bank of England news", "https://www.bankofengland.co.uk/rss/news", "regulator", True),
    ("Financial Stability Board", "https://www.fsb.org/feed/", "regulator", False),
    ("Ledger Insights", "https://www.ledgerinsights.com/feed/", "industry", False),
    ("Payments Dive", "https://www.paymentsdive.com/feeds/news/", "industry", False),
    ("PYMNTS", "https://www.pymnts.com/feed/", "news", True),
    ("CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/", "news", True),
    ("The Block", "https://www.theblock.co/rss.xml", "news", True),
]


def _blank(value) -> bool:
    return value in (None, "", [])


async def seed(db: AsyncSession) -> dict[str, int]:
    added = {"domains": 0, "initiatives": 0, "events": 0, "feeds": 0, "guides": 0}
    domains = {d.slug: d for d in (await db.scalars(select(Domain))).all()}
    for sort, (slug, code, name, summary) in enumerate(DOMAINS, start=1):
        if slug not in domains:
            domains[slug] = Domain(slug=slug, code=code, name=name, summary=summary, sort=sort)
            db.add(domains[slug])
            added["domains"] += 1
    await db.flush()

    have = {i.slug: i for i in (await db.scalars(select(Initiative))).all()}
    for sort, spec in enumerate(INITIATIVES, start=1):
        row = have.get(spec["slug"])
        if row is None:
            db.add(Initiative(
                slug=spec["slug"], name=spec["name"], domain_id=domains[spec["domain"]].id,
                kind=spec["kind"], status=spec["status"], regions=spec["regions"], summary=spec["summary"],
                lead=spec["lead"], participants=spec["participants"], started=spec["started"],
                aliases=spec["aliases"], url=spec["url"], sort=sort,
            ))
            added["initiatives"] += 1
            continue
        # Fill what is still blank; leave anything a person has written.
        untouched = _blank(row.lead) and _blank(row.regions)
        if untouched and row.kind == "industry":
            row.kind = spec["kind"]
        for field in ("regions", "lead", "participants", "started", "aliases", "url", "summary"):
            if _blank(getattr(row, field)) and not _blank(spec[field]):
                setattr(row, field, spec[field])

    have_events = set((await db.scalars(select(Event.name))).all())
    for name, organiser, city, month, level, why, codes in EVENTS:
        if name not in have_events:
            db.add(Event(name=name, organiser=organiser, city=city, typical_month=month,
                         level=level, why=why, domain_codes=codes))
            added["events"] += 1

    have_feeds = set((await db.scalars(select(Feed.url))).all())
    for name, url, kind, relevant_only in FEEDS:
        if url not in have_feeds:
            db.add(Feed(name=name, url=url, kind=kind, relevant_only=relevant_only))
            added["feeds"] += 1

    have_guides = set((await db.scalars(select(Guide.slug))).all())
    for sort, g in enumerate(GUIDES, start=1):
        if g["slug"] not in have_guides:
            domain = domains.get(g["domain"]) if g.get("domain") else None
            db.add(Guide(
                slug=g["slug"], title=g["title"], summary=g["summary"], body=g["body"].strip() + "\n",
                level=g["level"], status="draft", domain_id=domain.id if domain else None,
                initiative_slugs=g.get("initiatives", []), sort=sort, updated_by="Starter content",
            ))
            added["guides"] += 1
    await db.commit()
    return added
