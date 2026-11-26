"""The Desk's fixed vocabularies. Stored as plain strings; validated here at the API edge.

Labels shown to people live in the frontend's content.ts; these are the values.
"""

from typing import Literal

NoteType = Literal["signal", "brief", "thesis", "meeting", "debrief"]
Region = Literal["AU", "IN", "SG", "ASEAN", "HK", "CN", "JP", "GULF", "EU", "UK", "US", "LATAM", "AFRICA", "GLOBAL"]
Horizon = Literal["now", "12m", "3y"]
Stance = Literal["watch", "explore", "invest", "lead"]
ShowUp = Literal["speak", "host", "attend", "watch", "skip"]
EventStatus = Literal["considering", "confirmed", "done"]
InitiativeStatus = Literal["research", "pilot", "live", "paused", "ended"]
InitiativeKind = Literal[
    "central-bank",    # a central bank or BIS Innovation Hub project
    "cross-border",    # a link or platform between countries' systems
    "payment-system",  # a domestic rail or its overlay services
    "qr",              # a QR payment standard or scheme
    "bank-platform",   # a bank or bank consortium's platform
    "regulation",      # a law, rulebook or supervisory standard
    "standard",        # a messaging or technical standard
    "industry",        # an industry programme, protocol or market shift
]
GuideLevel = Literal["primer", "deep-dive"]
GuideStatus = Literal["draft", "reviewed"]
FeedKind = Literal["regulator", "industry", "news"]
FeedItemState = Literal["new", "starred", "dismissed", "noted"]

# Capability maturity, 0..4. Index is the stored value.
CAPABILITY_LEVELS = ("aware", "informed", "credible", "proven", "leading")

# A domain position older than this is due for review.
POSITION_REVIEW_DAYS = 30
