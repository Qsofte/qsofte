# Decision log

Significant design, content and architecture choices, and the open business
decisions they leave. "Owner" means a decision only the business can make; each one
was taken conservatively and is easy to reverse.

| # | Decision | Why | Reversible by |
| --- | --- | --- | --- |
| D1 | Keep the home headline **"Products that solve. Expertise that delivers."** | Chosen by the owner on 25 Nov 2026. The suggested "Complex problems. Simple technology." was assessed: it is accurate and product-led, but drops the explicit two-line structure the owner asked for. Offered as an alternative (Owner, O1). | Editing `hero` in `content.ts` |
| D2 | Rename RAM to **Samewe** on the site | Approved brand architecture. The repository is still named `ram`; that is internal. | `products` in `content.ts` |
| D3 | Samewe is shown as **in development**, with module status taken from `ram/docs/features` (12 Nov 2026) | Only the foundation is done. Presenting it as available would be false. Next step is "register interest", not "request a demo". | Update the status table when modules ship |
| D4 | Srovi is shown as **in use**, with capabilities limited to those verified in `om` | Production deploy workflow and code for each claimed capability. Blinkit and Flipkart are kept because they appear in the company's own brief, attributed as clients in that brief. | `srovi` in `content.ts` |
| D5 | **Qsofte Engineering** replaces *Services* and *Industries*; each capability shows its evidence | The architecture names it; the two old pages overlapped. The invented domain bullet lists are removed. | 301s back; old pages in git history |
| D6 | **Agentic contact centre as a service** stays, stated as an offering, not as delivered work | Owner statement (24 Nov 2026), no repository evidence. No clients, metrics or platforms are named (Owner, O2). | Remove from `engineering` |
| D7 | **Payments and cards** described as an area of work, with Westpac and Chilli Masala as the evidence | Owner statement plus legacy-site clients. The earlier "deep expertise" wording is softened until specifics are supplied (Owner, O3). | `engineering` copy |
| D8 | Client logos retained (Westpac, Chilli Masala, Adyopant Legal, Atmabodh) | Owner instruction to preserve clients; all four were on the original website. | `clients` |
| D9 | Prerender with React's own server renderer at build time | Fixes SEO without a framework migration or new runtime dependency. Pages stay a React SPA after load. | Remove the `prerender` step from `build` |
| D10 | nginx returns real 404s and 301s; the SPA fallback is removed | Soft 404s and duplicate URLs hurt indexing. Every real page is prerendered, so no fallback is needed. | Restore `try_files … /index.html` |
| D11 | Strict CSP: no inline scripts or styles; Formspree allowed for the form | Defence in depth. JSON-LD is a data block, which CSP does not execute. | Header in the nginx templates |
| D12 | **No analytics** | Nothing is tracked today and the privacy notice can say so truthfully. Enquiries are counted in Formspree (Owner, O4). | Add a privacy-friendly tool and update `/privacy` |
| D13 | Privacy notice written conservatively, with retention "as long as needed to respond, then deleted on request" | The site collects personal data; New Zealand's Privacy Act 2020 applies to a NZ-based business. Needs legal review (Owner, O5). | `privacy` in `content.ts` |
| D14 | No product screenshots | None were available, and fabricating them is ruled out. The Srovi passport is labelled "example" (Owner, O6). | Add real screenshots under `src/assets/` |
| D15 | `--ink-3` darkened from #7a8399 to #5e6780 | 3.79:1 to ≥ 4.5:1 on white and on `--surface-2`. | Token in `tokens.css` |
| D16 | Product identities: Srovi keeps its logo; Samewe is a text wordmark | No Samewe logo exists yet. Both sit under "A Qsofte product" to show the relationship (Owner, O7). | Logo assets |
| D17 | No linter added | TypeScript strict and the design guard catch most issues; adding ESLint is backlog P3-2. | — |

## Open business decisions

- **O1** Headline: keep D1, or adopt "Complex problems. Simple technology.".
- **O2** Agentic contact centre: platforms, a reference client or a pilot that can be named.
- **O3** Payments: specifics (schemes, roles, programmes) to substantiate depth.
- **O4** Whether to measure conversions, and with what tool.
- **O5** Legal review of `/privacy`: legal entity name, retention period, and whether NZ is the only jurisdiction.
- **O6** Real screenshots or short recordings of Srovi and Samewe.
- **O7** A Samewe logo, and whether Samewe should get its own domain.
- **O8** Rotate the exposed Azure secret (P0-1) and decide whether to rewrite history.
- **O9** `www.qsofte.com`: add DNS and a redirect, or leave it unused.
