# Design tokens (values measured from knoxfit.in via getComputedStyle, 2026-11-16)

Values only. No stylesheets or class names were copied. Measured at 1440px (desktop) and 390px (mobile).

## Fonts
| Role | Family | Source / licence |
|---|---|---|
| Display (section labels, small caps-like buttons) | **Bebas Neue** 400 | Google Fonts, SIL OFL 1.1 |
| Body / headings / UI | **Figtree** (variable, rendered at 300–700) | Google Fonts, SIL OFL 1.1 |
| (preloaded, not seen in use on Home/Pricing) | Mona Sans | GitHub, SIL OFL 1.1 |

All three are freely licensed. The rebuild loads Bebas Neue + Figtree from Google Fonts via `next/font` (self-hosted at build time).

## Colour
| Token | Value | Where |
|---|---|---|
| `--c-bg` | `#1B1B1B` rgb(27,27,27) | page background |
| `--c-surface` | `#222221` rgb(34,34,33) | accordion rows, tab track |
| `--c-surface-2` | `#343432` rgb(52,52,50) | package cards |
| `--c-surface-glass` | `rgba(250,250,250,.08)` | testimonial card |
| `--c-light-card` | `#E6E6E2` rgb(230,230,226) | "where do you need to go" tiles |
| `--c-text` | `#FAFAFA` | body text |
| `--c-text-muted` | `#D9D9D9` | section labels, secondary paragraphs |
| `--c-text-faint` | `rgba(250,250,250,.6)` | copyright |
| `--c-accent` | `#CCF904` rgb(204,249,4) | primary buttons, active nav, prices accent |
| `--c-accent-border` | `#C8E76E` rgb(200,231,110) | package card border (mobile) |
| `--c-on-accent` | `#000` / `#292929` | text on accent buttons |
| `--c-ink` | `#111111` | dark button on lime band |
| `--c-pill` | `#676767` rgb(103,103,103) | "Locate on maps" pill |

## Type scale (desktop → mobile)
| Role | Family | Size / line-height | Weight | Notes |
|---|---|---|---|---|
| Section label ("WELCOME TO KNOX") | Bebas | 40/40 → 32/32 | 400 | colour `--c-text-muted`, uppercase in content |
| Page title ("TRAIN ON YOUR TERMS") | Bebas | 40/60 → 32/48 | 400 | ls 0.01em |
| Lead (intro paragraph) | Figtree | 32/48 → 24/36 | 400 | |
| Sub-lead (Knox Edge heading) | Figtree | 28/33.6 → 24/28.8 | 400 | |
| Body large | Figtree | 24/33.6 → 16/24 | 400 | muted |
| Body | Figtree | 16/24 | 400 | |
| Tile heading | Figtree | 40/50 → 24/30 | 400 | on light tiles |
| Category heading ("First Timer Packs") | Figtree | 32/48 → 24/36 | 400 | |
| Package name | Figtree | 16/22.9 → 14/21 | 600 | |
| Package price | Figtree | 48/48 → 40/60 | 400 | |
| Package description | Figtree | 11/16.5 | 400 | |
| Nav link | Figtree | 14/21 | 400 (active 700, accent) | ls 0.015em |
| Footer column title | Bebas | 16/16 → 14/16 | 400 | uppercase |
| Footer link | Figtree | 16/24 → 14/20 | 400 | |
| Copyright | Figtree | 10/15 | 400 | ls −0.5px |
| Button (primary) | Figtree | 16/20, uppercase | 600–700 | ls ≈0.457px |
| Button (card/pill) | Bebas | 14/21 (12–13 mobile) | 400 | |

## Shape & spacing
| Token | Value |
|---|---|
| Page gutter | 32px desktop, 16px mobile |
| Section padding | 96px top / 80px bottom (home intro); 48px (Knox Edge); 128px top studios (96 mobile) |
| Content inset for card grids | 80px desktop (pricing, link tiles), 8–16px mobile |
| Radius: primary button | 20–32px (fully rounded pill) |
| Radius: card (package) | 15px |
| Radius: tile | 16px; testimonial 10px |
| Radius: accordion row | 4px 4px 10px 10px |
| Package card padding | 24px 32px desktop, 16px mobile |
| Tab track | `--c-surface`, pill, 3–4px padding; active tab black fill |
| Primary button heights | 32px (header CTA / YES), 44–48px (section CTAs) |

## Breakpoints
Measured layouts switch between the 390px and 1440px captures. The live site ships two separate markup trees; the rebuild uses one responsive component with breakpoints at **768px** (tablet → stacked) and **1024px** (desktop nav). These two numbers are my choice and need checking at intermediate widths.
