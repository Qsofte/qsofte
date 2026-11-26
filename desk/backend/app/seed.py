"""Reference data the Desk starts with: the six domains, named initiatives and the event shortlist.

Public information only (this repository is public). Idempotent: inserts what is missing by
slug/name and never overwrites anything already edited in the app. No notes are seeded;
notes are written by people.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Domain, Event, Initiative

DOMAINS = [
    ("cross-border", "D1", "Global and cross-border",
     "Multilateral linking of payment systems, correspondent banking change, ISO 20022 and the G20 cross-border targets."),
    ("real-time-rails", "D2", "Domestic rails and real-time payments",
     "Instant payment systems and the overlay services built on them, by market."),
    ("digital-assets", "D3", "Digital assets",
     "Stablecoins, CBDCs and tokenised securities, and the rules forming around them."),
    ("tokenised-deposits", "D4", "Tokenised deposits",
     "Commercial bank money on shared ledgers, and wholesale settlement for tokenised assets."),
    ("regulation", "D5", "Regulation and compliance",
     "Payments regulation, scam and fraud liability, operational resilience and AI rules."),
    ("innovation", "D6", "Innovation",
     "Agentic payments, pay by bank, open banking and AI in fraud and operations."),
]

# (slug, name, domain slug, status, summary, url)
INITIATIVES = [
    ("nexus", "Project Nexus", "cross-border", "pilot",
     "BIS-designed scheme to link domestic instant payment systems through one hub. Taken forward by "
     "Nexus Global Payments, set up by central banks of India, Malaysia, the Philippines, Singapore and Thailand.",
     "https://www.bis.org/about/bisih/topics/fmis/nexus.htm"),
    ("mandala", "Project Mandala", "cross-border", "research",
     "BIS Innovation Hub work on encoding cross-border policy and compliance checks into a shared protocol. "
     "The Reserve Bank of Australia took part.",
     "https://www.bis.org/about/bisih/topics/cbdc/mandala.htm"),
    ("agora", "Project Agorá", "cross-border", "research",
     "BIS project with seven central banks and over 40 financial firms testing tokenised correspondent "
     "banking on a unified ledger with tokenised deposits and wholesale central bank money.",
     "https://www.bis.org/about/bisih/topics/fmis/agora.htm"),
    ("mbridge", "mBridge", "cross-border", "live",
     "Multi-CBDC platform for cross-border payments. The BIS stepped back from the project in 2024; "
     "participating central banks continue it.", ""),
    ("iso-20022", "ISO 20022 migration", "cross-border", "live",
     "Richer, structured payment messages. Swift's coexistence period for cross-border payments ended in November 2025.", ""),
    ("g20-roadmap", "G20 cross-border roadmap", "cross-border", "live",
     "FSB-coordinated targets for faster, cheaper, more transparent and accessible cross-border payments by 2027.", ""),
    ("npp-payto", "NPP and PayTo", "real-time-rails", "live",
     "Australia's New Payments Platform, Osko and PayTo mandated payments.", ""),
    ("becs-decommission", "BECS decommissioning", "real-time-rails", "live",
     "Australia's plan to retire the Bulk Electronic Clearing System by 2030 and move volume to the NPP.", ""),
    ("upi", "UPI and its international links", "real-time-rails", "live",
     "India's Unified Payments Interface, UPI on credit, and bilateral links to other fast payment systems.", ""),
    ("fednow-rtp", "FedNow and RTP", "real-time-rails", "live", "The two US instant payment services.", ""),
    ("sepa-instant", "SEPA Instant and Verification of Payee", "real-time-rails", "live",
     "EU Instant Payments Regulation: instant credit transfers at no extra cost, with payee name checks.", ""),
    ("pix", "Pix", "real-time-rails", "live", "Brazil's instant payment system and its overlay services.", ""),
    ("uk-npv", "UK National Payments Vision", "real-time-rails", "research",
     "UK plan for next-generation payments infrastructure and a renewed Faster Payments system.", ""),
    ("stablecoin-rules", "Stablecoin regimes", "digital-assets", "live",
     "US GENIUS Act, EU MiCA, and the Hong Kong and Singapore stablecoin frameworks.", ""),
    ("digital-euro", "Digital euro", "digital-assets", "research", "ECB retail CBDC preparation.", ""),
    ("e-rupee", "e-rupee", "digital-assets", "pilot", "RBI retail and wholesale CBDC pilots.", ""),
    ("acacia", "Project Acacia", "tokenised-deposits", "research",
     "RBA and the Digital Finance CRC exploring wholesale settlement for tokenised asset markets in Australia.", ""),
    ("bank-deposit-tokens", "Bank deposit token platforms", "tokenised-deposits", "live",
     "Kinexys (J.P. Morgan), Citi Token Services, HSBC Tokenised Deposit Service, Partior.", ""),
    ("rln", "Regulated Liability Network", "tokenised-deposits", "research",
     "Shared ledger for regulated money (central bank, commercial bank, e-money).", ""),
    ("au-spf", "Scams Prevention Framework (AU)", "regulation", "live",
     "Australian law placing scam prevention, detection and response duties on banks, telcos and digital platforms.", ""),
    ("au-licensing", "Payments licensing reform (AU)", "regulation", "research",
     "Bringing payment service providers into a single licensing regime.", ""),
    ("cps-230", "APRA CPS 230", "regulation", "live", "Operational risk management standard for APRA-regulated entities.", ""),
    ("psd3", "PSD3 and the Payment Services Regulation", "regulation", "research", "EU payments rulebook update.", ""),
    ("dora", "DORA", "regulation", "live", "EU Digital Operational Resilience Act.", ""),
    ("agentic-payments", "Agentic payments", "innovation", "pilot",
     "AI agents that find, initiate and authorise payments, and the card scheme and protocol rules forming around them.", ""),
    ("pay-by-bank", "Pay by bank and open banking", "innovation", "live",
     "Account-to-account payments at checkout; CDR in Australia, open banking in the UK and EU.", ""),
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


async def seed(db: AsyncSession) -> dict[str, int]:
    added = {"domains": 0, "initiatives": 0, "events": 0}
    domains = {d.slug: d for d in (await db.scalars(select(Domain))).all()}
    for sort, (slug, code, name, summary) in enumerate(DOMAINS, start=1):
        if slug not in domains:
            domains[slug] = Domain(slug=slug, code=code, name=name, summary=summary, sort=sort)
            db.add(domains[slug])
            added["domains"] += 1
    await db.flush()

    have = set((await db.scalars(select(Initiative.slug))).all())
    for sort, (slug, name, dslug, status, summary, url) in enumerate(INITIATIVES, start=1):
        if slug not in have:
            db.add(Initiative(slug=slug, name=name, domain_id=domains[dslug].id, status=status,
                              summary=summary, url=url, sort=sort))
            added["initiatives"] += 1

    have_events = set((await db.scalars(select(Event.name))).all())
    for name, organiser, city, month, level, why, codes in EVENTS:
        if name not in have_events:
            db.add(Event(name=name, organiser=organiser, city=city, typical_month=month,
                         level=level, why=why, domain_codes=codes))
            added["events"] += 1
    await db.commit()
    return added
