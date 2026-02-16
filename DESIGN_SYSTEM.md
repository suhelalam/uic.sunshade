# UIC Sunshade — Design System

This document explains how the University of Illinois Chicago (UIC) digital identity was interpreted and applied so the site reads as an official UIC-affiliated property, not just a generic site recolored in blue and red.

## Research sources

- **brand.uic.edu** — Official color palette, typography, and usage
- **uic.edu**, **today.uic.edu**, **cs.uic.edu** — Global navigation, header/footer patterns, section blocks, and CTA usage

## Design logic (how UIC was interpreted)

1. **Navy (#001E62) = structural and institutional**
   - Used for: headers, footers, section titles, primary borders, navigation chrome
   - Conveys authority and hierarchy; not used for large blocks of body text

2. **Red (#D50032) = intentional and action-oriented**
   - Used sparingly for: primary CTAs (Submit, Apply, Delete confirm), active filter states, links, highlights, error/destructive emphasis
   - Never as large background with light text (avoid red-on-navy for accessibility)

3. **Steel gray (#333333) = readability**
   - Body copy and secondary text; ensures WCAG contrast on white and Expo White

4. **Expo White (#F2F7EB) = light section background**
   - Page background and alternate section blocks; keeps the palette from feeling cold

5. **White**
   - Primary content areas (cards, modals, form surfaces) for maximum readability

6. **No gradients or flashy effects**
   - Flat, professional academic tone; subtle borders and shadows only

## Color system (hex)

| Role            | Hex       | Usage |
|-----------------|-----------|--------|
| Navy            | `#001E62` | Headers, footers, headings, structural borders |
| Navy dark       | `#00154a` | Hover on navy elements (optional) |
| Red             | `#D50032` | CTAs, active states, links, errors/destructive |
| Red dark        | `#b00028` | Hover on red buttons |
| Steel           | `#333333` | Body text, labels |
| Expo White      | `#F2F7EB` | Page/section backgrounds |
| White           | `#ffffff` | Content cards, inputs, modals |

CSS variables in `src/app/globals.css` define these and a spacing scale for consistency.

## Component-level application

- **Header / Footer**: Full-width navy (`#001E62`) with a red accent line (bottom border on header, top border on footer). Two-tier header: thin “eyebrow” + main nav block.
- **Buttons**: Primary = red background; secondary = outline with navy or red border and steel/navy text. Hover darkens (e.g. `#b00028` for red).
- **Cards / Sections**: White or Expo White background, `border-[#001E62]/15`, rounded corners, light shadow. Section titles in navy, uppercase optional with tracking.
- **Forms**: Inputs use navy focus ring (`focus:ring-[#001E62]/15`); errors use red tint border and background (`#D50032`/10–30%).
- **Links / “View details”**: Red (`#D50032`) with hover underline.
- **Filters**: Pills use red when active; inactive = white with steel text and light border.
- **Map**: Marker accent and popup “View details” use red; location error text in red.

## Layout and spacing

- **Page**: Single main column, `max-w-7xl`, consistent vertical padding.
- **Sections**: Semantic `<section>` blocks (e.g. campus map, events) with clear headings and optional alternating Expo White backgrounds.
- **Spacing**: Scale from `globals.css` (e.g. `--space-4` = 16px) used for padding and gaps where applicable.

## Typography

- **Font stack**: Helvetica Neue, Helvetica, Arial (aligned with UIC’s Theinhardt-like sans).
- **Headings**: Navy; weight and size create hierarchy (e.g. section titles bold, uppercase optional).
- **Body**: Steel gray; no red or navy for long copy.

## Accessibility

- Contrast ratios kept for navy and steel on white/Expo White; red reserved for CTAs and accents on light backgrounds.
- Focus states use navy ring; error states use red with sufficient contrast (e.g. dark red text on light red tint).

---

Together, these choices make the site feel like an official UIC digital property: navy for structure, red for action, and a clear hierarchy that matches UIC’s departmental and brand patterns.
