"""The Desk's fixed vocabularies. Stored as plain strings; validated here at the API edge.

Labels shown to people live in the frontend's content.ts; these are the values.
"""

from typing import Literal

NoteType = Literal["signal", "brief", "thesis", "meeting", "debrief"]
Region = Literal["AU", "IN", "SG", "GULF", "EU", "UK", "US", "GLOBAL"]
Horizon = Literal["now", "12m", "3y"]
Stance = Literal["watch", "explore", "invest", "lead"]
ShowUp = Literal["speak", "host", "attend", "watch", "skip"]
EventStatus = Literal["considering", "confirmed", "done"]
InitiativeStatus = Literal["research", "pilot", "live", "paused", "ended"]

# Capability maturity, 0..4. Index is the stored value.
CAPABILITY_LEVELS = ("aware", "informed", "credible", "proven", "leading")

# A domain position older than this is due for review.
POSITION_REVIEW_DAYS = 30
