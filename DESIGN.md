---
name: Bachanalia Fantastyczne
description: A printed festival ticket with poster energy and web discipline.
colors:
  paper: "#ffffff"
  paper-shade: "#eceef3"
  navy: "#191f5c"
  navy-deep: "#12163f"
  petrol: "#1a205d"
  coral: "#ee7489"
  pink: "#ff9cb3"
  rose: "#c0455f"
  slate: "#4e5079"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 6.4vw, 4rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.015em"
  section:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 4.6vw, 2.7rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Cinzel, serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  card: "3px"
spacing:
  compact: "0.75rem"
  row: "1rem"
  mobile-gutter: "1.25rem"
  tablet-gutter: "2rem"
  section-mobile: "3rem"
  section-desktop: "4rem"
components:
  section-heading:
    textColor: "{colors.navy}"
    typography: "{typography.display}"
    padding: "0 0 0.75rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.card}"
    height: "3rem"
  directory-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.card}"
---

# Design System: Bachanalia Fantastyczne

## Overview

**Creative North Star: “The Printed Festival Ticket”**

The shipped site treats each page as a piece of festival print: white paper, navy ink, coral registration marks, tariff-like information, and an occasional handwritten annotation. Its confidence comes from forty editions of community history, not from luxury styling or fantasy decoration.

Poster energy is balanced by web discipline. Type may be large and colour may be committed, but content stays factual, mobile-first, keyboard-accessible, and easy to scan. Playfulness appears through meaningful festival details—the perforation rule, screened key art, a market awning—not as a generic decorative layer.

## Colors

- **Paper** is the default page and component surface. **Paper shade** separates filters, image plates, and quiet states without implying elevation.
- **Navy** is the principal ink and dark field. **Navy deep** and **petrol** support large inverted sections.
- **Coral** is the primary physical mark: fills, selection, focus, and large accents. Use **rose** for small accent text on white; coral text on white does not meet AA.
- **Pink** is the inverted accent. **Slate** is muted text on white. Inverted muted text is derived from paper, never neutral gray.
- Dark sections opt into the `ink-inverted` semantic aliases instead of restyling descendants ad hoc.

## Typography

Bricolage Grotesque owns display and body work. The shipped page heading is `clamp(2.1rem, 6.4vw, 4rem)` at weight 600, 0.95 line-height, and -0.015em tracking; rendered desktop interiors resolve to 64px. Section headings use `clamp(1.7rem, 4.6vw, 2.7rem)`. Display text is optically nudged left when it meets a rule.

Cinzel is limited to compact labels and consequential button text. Caveat is a rare human annotation, never a second body face. Body copy defaults to 16px/24px; editorial WordPress content opens to 17px with 1.7 leading and a 70ch measure. Polish `latin-ext` coverage is mandatory.

## Layout

The stable page frame is a centered 72rem container. Gutters are 1.25rem on phones, 2rem from 40rem, and collapse into the container from 64rem. Standard interior pages begin 3rem below the header on mobile and 4rem on larger screens.

The sticky site header is 4rem high on phones and 4.5rem on larger screens. Dense directory and shop grids are one column on phones where copy is substantial, two columns from 40rem, and three or four only when the item remains readable. Section cadence grows from roughly 3rem on mobile to 4–6rem on larger screens.

Group related controls and facts tightly. Separate distinct sections generously. Long text stays around 65–75ch. Touch targets are at least 44px and horizontal scrolling is never part of ordinary navigation.

## Elevation & Depth

The system is intentionally flat. Tonal paper layers, solid rules, and dashed perforations establish hierarchy. Photographs and logos sit on paper-shade plates rather than floating cards.

If an interactive item needs lift, use one visible offset shadow with a small translation, as a printed object moving off the sheet. Do not combine a faint border with a wide ambient shadow, and do not use glass, blur, or zero-offset glow as generic depth.

## Shapes

Corners are almost square at 3px. Circular shapes are reserved for icon wells, compact controls, punched ticket details, and the mobile menu trigger. Pills are not a page-layout primitive.

A 2px solid navy rule closes major headings. A 1px solid rule divides compact groups. Dashed rules are perforations between rows or sections; they do not frame photographs or logos.

## Components

- **Site header:** sticky white paper, one hairline, real destination links, and a single framed accreditation CTA. Desktop navigation is restrained; mobile uses a sheet with dotted hierarchy.
- **Section heading:** shared `SectionHeading`, display type, optical left nudge, 2px navy rule, and an optional factual aside aligned to the baseline.
- **Event details:** the home hero is canonical. “Termin” and “Miejsce” are compact coral labels followed by real event facts, calendar action, and linked address; other hero surfaces reuse this component.
- **Inputs and filters:** 3rem tall, white, 3px radius, translucent navy border, native semantics, and the global coral focus outline. Filters are plain controls, not chip or pill collections.
- **Cards:** use only for genuinely repeated entities such as guests, products, partners, or exhibitors. Logos use `object-contain`; names use display type; metadata uses slate; hover may move the name to rose. Full descriptions remain readable text.
- **Buttons:** the existing framed Cinzel button is reserved for one consequential action. Secondary actions remain underlined text links with coral decoration.
- **Motion:** colour and small physical movement use the shipped `--ease-out`; spring easing is reserved for authored tactile moments. Reduced-motion removes nonessential animation globally.

## Do's and Don'ts

- Do use real event facts, current commerce data, real partner names, and honest empty or unavailable states.
- Do preserve the white-paper/navy-ink/coral-mark hierarchy across new routes.
- Do use dashed rules as separators and screened texture only on a surface that behaves like printed ink.
- Do verify AA contrast, visible focus, reduced motion, Polish diacritics, long names, missing images, and phone layouts.
- Don't use parchment, dragons, glassmorphism, purple gradients, generic corporate-event grids, or stock spectacle.
- Don't invent categories, booth numbers, application status, prices, or promotional claims.
- Don't add decorative motion when type, colour, spacing, and content already explain the interaction.
- Don't create a one-off visual language for an interior route; extend the shipped system and shared components.
