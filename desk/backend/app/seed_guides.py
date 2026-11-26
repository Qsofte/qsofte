"""Starter primers for the Library, from public sources. Seeded as drafts: someone checks the
facts and marks each one reviewed before it is quoted to a client.

Markdown subset the Desk renders: #/##/### headings, paragraphs, - and 1. lists, **bold**,
*italic*, `code` and [links](https://...).
"""

GUIDES = [
    {
        "slug": "instant-payments-primer",
        "title": "Instant payments in ten minutes",
        "level": "primer",
        "domain": "real-time-rails",
        "initiatives": ["npp-payto", "upi", "fednow-rtp", "pix", "sepa-instant"],
        "summary": "How a real-time payment system works, what sits on top of it, and what banks have to change.",
        "body": """
## What makes a payment "instant"

An instant (or real-time, or fast) payment system moves money between accounts at different banks in seconds,
at any hour, every day of the year. The payee's bank confirms the credit while the payer is still in the app.

Four things are usually true:

- **Always on.** 24/7/365 processing, so banks' own systems, fraud checks and liquidity have to be always on too.
- **Irrevocable.** Once sent, the payment cannot be pulled back by the scheme. That is why scams move to instant rails.
- **Rich data.** Most modern systems use ISO 20022 messages, so a payment can carry structured remittance details.
- **Settlement.** Either each payment settles one by one in central bank money (Australia's NPP settles through the
  RBA's Fast Settlement Service), or payments clear instantly and banks settle net positions later, backed by
  collateral or pre-funding.

## The layers

1. **Core rail**: the clearing and settlement infrastructure (NPP, UPI, FedNow, RTP, Pix, TIPS, Faster Payments).
2. **Addressing**: proxies such as a mobile number, email or company ID instead of account numbers (PayID, UPI IDs,
   PayNow, Pix keys). A shared directory is what makes "pay by phone number" work across banks.
3. **Overlay services**: products built on the rail, such as Osko, PayTo mandates, request-to-pay, QR at the till,
   and confirmation of payee.
4. **Front ends**: bank apps, wallets and merchant checkouts.

## Where it is going

- **Account-to-account at checkout**, competing with cards (Pix and UPI show the scale this can reach).
- **Mandated and recurring payments** (PayTo in Australia, UPI AutoPay, variable recurring payments in the UK).
- **Retiring older batch systems**, as Australia plans with BECS by 2030.
- **Cross-border links** between national systems: first bilateral (UPI–PayNow, PayNow–PromptPay), then hubs like Nexus.
- **Scam controls**: payee name checks, delays on risky first payments, and shared liability rules.

## What it means for a bank

Real-time fraud and AML decisions in the payment path; 24/7 operations and liquidity; ISO 20022 data carried end to
end; migrating volume from batch systems; and new products on overlays rather than on the core.

## Questions to ask a client

- Which payments still run on batch rails, and what is the plan to move them?
- How long does a fraud decision take today, and can it run inside the payment?
- Who owns the customer experience for PayTo or request-to-pay?
""",
    },
    {
        "slug": "cross-border-primer",
        "title": "Cross-border payments: why they are slow and what is changing",
        "level": "primer",
        "domain": "cross-border",
        "initiatives": ["g20-roadmap", "nexus", "agora", "mbridge", "iso-20022", "asean-rpc"],
        "summary": "Correspondent banking, the G20 targets, and the three main ways countries are linking payment systems.",
        "body": """
## How a cross-border payment works today

Most cross-border payments travel through **correspondent banking**: a chain of banks holding accounts with each
other, passing a message (often over Swift) and moving balances hop by hop. Each hop adds cost, time, compliance
checks and the chance of a missing or mangled data field.

The pain points the G20 named: **high cost, low speed, limited access and limited transparency**.

## The G20 targets for end-2027

The Financial Stability Board and the CPMI coordinate a roadmap with targets for 2027, including:

- Retail payments costing on average no more than **1%**, and remittances no more than **3%**.
- **75%** of payments credited within an hour, and the rest within one business day.
- Full transparency on fees, FX rate and time before the customer pays.

Progress reports have said the targets are unlikely to be met everywhere by 2027, which keeps pressure on all of
the initiatives below.

## Three ways to link payment systems

1. **Bilateral links** between two countries' fast payment systems, such as UPI–PayNow and PayNow–PromptPay.
   Quick to start, but n countries need about n² links.
2. **Hubs** that each country connects to once. **Project Nexus** is the leading example: it standardises
   messaging, addressing, FX quotes and compliance between connected systems.
3. **Shared ledgers** holding tokenised money from several jurisdictions, such as **mBridge** (wholesale CBDCs)
   and **Project Agorá** (tokenised commercial bank deposits alongside wholesale central bank money).

Alongside these: **ISO 20022** (richer data, so fewer manual repairs and better screening), Swift's tracking
(gpi), and **Project Mandala** (encoding each country's rules so compliance checks run automatically).

## Questions to ask a client

- Which corridors matter most by volume and by complaint?
- Does the bank want to be a connected participant in a hub like Nexus, or rely on correspondents?
- Can its screening use the structured ISO 20022 data, or does it still read free text?
""",
    },
    {
        "slug": "money-on-ledgers",
        "title": "Tokenised deposits, stablecoins and CBDC compared",
        "level": "primer",
        "domain": "tokenised-deposits",
        "initiatives": ["bank-deposit-tokens", "stablecoin-rules", "acacia", "agora", "ensemble", "rln"],
        "summary": "Three kinds of digital money on ledgers: who issues them, what backs them, and where each fits.",
        "body": """
## Three kinds of money

- **CBDC** is issued by a central bank and is its direct liability. **Wholesale CBDC** is for banks settling with
  each other (mBridge, Helvetia, Acacia trials); **retail CBDC** is for the public (e-CNY, the digital euro work,
  the e-rupee pilots).
- **Tokenised deposits** are ordinary commercial bank deposits recorded on a ledger. They are the bank's liability,
  sit inside deposit protection and bank regulation, and can be programmed (move at a set time, on a condition, or
  24/7 between a bank's clients). Examples: Kinexys (J.P. Morgan), Citi Token Services, HSBC's Tokenised Deposit Service.
- **Stablecoins** are issued by a non-bank or bank subsidiary, backed by a reserve of assets, and usually move on
  public blockchains. The holder's claim is on the issuer and its reserve, not a bank deposit. New regimes license
  issuers and set reserve rules: MiCA (EU), the GENIUS Act (US), Hong Kong's Stablecoins Ordinance, and MAS's framework.

## Why banks care about tokenised deposits

- They keep the deposit (and its funding value) on balance sheet while offering stablecoin-like features.
- They allow **atomic settlement**: an asset and its payment move together, so neither side is exposed.
- Interoperability between banks is the hard part; that is what **Agorá**, the **Regulated Liability Network** and
  **Project Ensemble** work on, with **wholesale central bank money** as the settlement asset between banks.

## Australian angle

**Project Acacia** (RBA and the Digital Finance CRC) examined how wholesale tokenised asset markets could settle in
Australia, including with tokenised bank deposits and a wholesale CBDC.

## Questions to ask a client

- What would the bank tokenise first: deposits for treasury clients, or settlement for a tokenised asset market?
- How would it settle with other banks on the same ledger?
- Is a stablecoin a competitor, a product to distribute, or a reserve-management business?
""",
    },
    {
        "slug": "nexus-explained",
        "title": "Project Nexus explained",
        "level": "deep-dive",
        "domain": "cross-border",
        "initiatives": ["nexus", "upi", "paynow", "promptpay", "duitnow", "instapay"],
        "summary": "What Nexus standardises, who is building it, and what a connected bank or payment system has to do.",
        "body": """
## The idea

Instead of every country building a bilateral link with every other, each domestic instant payment system (IPS)
connects once to a **Nexus gateway** and can then reach all other connected systems. Nexus sets one set of rules
and technical standards for the whole network.

## What Nexus standardises

- **Messaging**: ISO 20022 messages between systems.
- **Addressing**: sending to a mobile number or other proxy in another country, with the payee's name shown
  before the payer confirms.
- **FX**: quotes from FX providers that the sender sees up front, with the amount the recipient will get.
- **Compliance**: sanctions screening and the data each side needs, agreed once rather than per corridor.
- **Speed**: designed for payments to arrive in under 60 seconds in most cases.

## Who is building it

The BIS Innovation Hub designed Nexus and tested it with central banks. **Nexus Global Payments (NGP)** was set
up by the founding central banks of India, Malaysia, the Philippines, Singapore and Thailand to build and run it
for live use. Their domestic systems (UPI, DuitNow, InstaPay, FAST/PayNow and PromptPay) are the first to connect.

## Roles in the network

- **IPS operators** connect their system to Nexus.
- **Payment service providers** (banks and others) send and receive Nexus payments through their IPS.
- **FX providers** quote rates and manage liquidity in each currency.
- **Settlement access providers** help FX providers that are not members of a domestic system.

## What it means for Qsofte's clients

- Banks in connected countries will need to support Nexus flows in their apps and payment hubs: proxy lookup
  abroad, FX quote display, pre-validation and screening.
- FX providers and treasury teams have a new role to price.
- Australia is not a founding member. Watch whether the RBA and NPP connect, and how Nexus relates to Mandala.

## Check before quoting

Membership and go-live dates move. Check NGP and BIS announcements (the Desk's feeds tag them to Nexus).
""",
    },
    {
        "slug": "agora-explained",
        "title": "Project Agorá explained",
        "level": "deep-dive",
        "domain": "cross-border",
        "initiatives": ["agora", "bank-deposit-tokens", "rln"],
        "summary": "Tokenised correspondent banking on a unified ledger: the participants, the design and why it matters.",
        "body": """
## The idea

Agorá tests whether cross-border payments can run on a **unified ledger**: one programmable platform holding
**tokenised commercial bank deposits** and **tokenised wholesale central bank money** together. Correspondent
banking would then move from a chain of messages and account updates to updates on one shared state.

## Who is involved

The BIS leads it with the Institute of International Finance. Seven central banks take part (the Bank of France
for the Eurosystem, the Bank of Japan, the Bank of Korea, the Bank of Mexico, the Swiss National Bank, the Bank of
England and the Federal Reserve Bank of New York) with over forty private financial firms.

## Why a unified ledger

- **Atomic settlement**: the deposit transfer at each bank and the central bank money settlement between banks
  happen together or not at all.
- **Programmability**: compliance checks, FX and conditions can run inside the transaction.
- **Two-tier money preserved**: banks keep issuing deposits; central banks keep providing settlement money.

## Questions it has to answer

Legal finality across jurisdictions, governance of a shared platform, data privacy between competing banks, and
how it connects to existing payment systems.

## What it means for Qsofte's clients

A bank's core and payment hub may one day need to hold and move tokenised deposits on a shared ledger. Start by
understanding what tokenised deposits mean for treasury and correspondent banking (see the comparison guide).
""",
    },
    {
        "slug": "qr-payments-primer",
        "title": "QR payments: standards, schemes and cross-border links",
        "level": "primer",
        "domain": "real-time-rails",
        "initiatives": ["emvco-qr", "india-qr", "sgqr", "qris", "thai-qr", "duitnow-qr", "qr-ph", "asean-rpc", "pix", "alipay-plus"],
        "summary": "Merchant-presented and consumer-presented QR, national standards in Asia, and how QR links work across borders.",
        "body": """
## Two ways a QR payment works

- **Merchant-presented (MPM)**: the shop shows a QR code (static, or dynamic with the amount) and the customer scans
  it with a bank or wallet app. Cheap to accept: a printed sticker is enough.
- **Consumer-presented (CPM)**: the customer's app shows a code and the merchant scans it at the till.

**EMVCo's QR specification** defines a common data format for both. Most national standards build on it.

## National QR standards

Many markets unified their QR codes so one code works with every bank and wallet:

- India: **UPI QR** (and BharatQR), the largest by far, at merchants of every size.
- Singapore: **SGQR**, one label for many schemes.
- Indonesia: **QRIS**; Malaysia: **DuitNow QR**; Thailand: **Thai QR Payment** (PromptPay); the Philippines: **QR Ph**.
- Brazil: **Pix** QR codes; Hong Kong: FPS QR.

Behind most of these is an instant payment system, so the merchant is paid in seconds and the fee is low.

## Cross-border QR

**ASEAN Regional Payment Connectivity** links national QR schemes so a tourist can scan the local code with their
home app and pay in their own currency. Bilateral QR links already run between several ASEAN countries, and India
has linked UPI QR acceptance with partner countries. Separately, wallet networks such as **Alipay+** let
travellers' home e-wallets pay at foreign merchants.

## What it means for Qsofte's clients

- For banks: acceptance at small merchants without card terminals, and a channel cards do not reach.
- For merchants and acquirers: one sticker, many apps; reconciliation and refunds become the hard part.
- For Australia: QR is less common than tap-and-go cards; watch PayTo, NPP QR use cases and inbound tourist QR.
""",
    },
]
