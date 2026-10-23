# EventConnect — Software Requirements Specification (SRS)

**SRS Scope:** Overview, use case, user stories and main functionality only. This is **not an exhaustive spec**.

---

# Table of Contents

<!-- TOC -->

* [1. Introduction](#1-introduction)

  * [1.1 Document Purpose](#11-document-purpose)
  * [1.2 Product Scope](#12-product-scope)
* [2. Requirements](#2-requirements)

  * [2.1 Use Case](#21-use-case)
  * [2.2 User Stories](#22-user-stories)
  * [2.3 Functional Requirements](#23-functional-requirements)

<!-- TOC -->

## 1. Introduction

This document specifies the core requirements for EventConnect, a community event registration web app. It exists so that design and development work — wireframes, high-fidelity mockups, and implementation — can be checked against a single agreed-upon source of truth. It is intended for designers and developers building or reviewing EventConnect screens.

### 1.1 Document Purpose

This SRS exists to give reviewers a fixed, testable reference for what the EventConnect listing, detail, and registration screens must do, so that wireframes and designs can be checked for mismatches before development starts. It is used by **designers** producing wireframes/mockups, **reviewers** auditing either against these requirements, and **developers** implementing screens.

### 1.2 Product Scope

EventConnect is a community event registration portal (v1) that lets community members browse local events, view event details, and register through a guided multi-step form. Its core capabilities are browsing/searching/filtering events, viewing full event details and availability, and completing a 3-step registration flow. It **does not cover** event creation/management by organizers, payments, or user account management — those are out of scope for this document.

## 2. Requirements

### 2.1 Use Case

- **Use Case ID**: UC-01
- **Primary Actor**: Prospective attendee
- **Goal**: Find and register for a community event
- **Precondition**: Attendee has the event listing page open
- **Main Success Criteria**:
  1. Attendee browses or searches the event listing and finds an event of interest.
  2. Attendee opens the event's detail page and reviews description, date/time, location, organizer, price, and availability.
  3. Attendee selects "Register Now" and completes Step 1 – Personal Info.
  4. Attendee completes Step 2 – Preferences.
  5. Attendee reviews the Step 3 summary and submits; the app confirms successful registration.

### 2.2 User Stories

> **User Story 1**

**As a** prospective attendee,
**I want to** search and filter the event listing by keyword and category,
**so that** I can quickly find events relevant to me.

**Acceptance Criteria**: The listing page provides a text search field and filter controls; results update to match the search/filter criteria; every card shows matched title, date/time, location, category, price, and availability as the events on the listing page.

> **User Story 2**

**As a** prospective attendee,
**I want to** clearly see whether an event still has open spots before I try to register,
**so that** I don't attempt to register for an event that's already full.

**Acceptance Criteria**: Availability is shown as Available, Limited, or Sold Out; for Sold Out events, "Register Now" is replaced by a disabled "Registration Closed" state; the price shown matches between the listing and detail pages.

> **User Story 3**

**As a** prospective attendee,
**I want to** complete registration in a short, clearly-labeled multi-step form,
**so that** I know what information is required and how much is left before I'm done.

**Acceptance Criteria**: The form has 3 steps (Personal Info, Preferences, Confirm) with a step indicator showing all 3 on every step; required and optional fields are clearly marked; Step 3 shows a read-only summary before final submit.

> **User Story 4**

**As a** prospective attendee,
**I want to** find answers to common questions from any screen,
**so that** I don't have to leave the app or contact support for basic help.

**Acceptance Criteria**: A FAQ / Help link is visible on every screen; it opens a page answering common questions about browsing, registering, and managing registrations.

### 2.3 Functional Requirements

**R1. Navigation.** The nav bar (brand, "Browse Events", "My Registrations", "About") appears identically on every screen of the app.

**R2. Event listing content.** Every event card on the listing page shows: title, date/time, location, category tag, price, and an availability status of exactly one of Available, Limited, or Sold Out.

**R3. Search and Filter.** The event listing page provides a text search field so users can search events by keyword, in addition to any filter controls, such as filter by category or upcoming date..

**R4. Event detail page.** Opening an event shows its full description, date/time, location, availability, category tag, and price.

**R5. Registration flow structure.** Registering for an event is a 3-step process — (1) Personal Info, (2) Preferences, (3) Confirm — and the step indicator on every step of the form shows all 3 steps.

**R6. Step 1 fields.** Step 1 (Personal Info) collects exactly three fields: Name (required), Email (required), and Phone Number (optional). Required fields are marked "required"; optional fields are marked "(optional)".

**R7. Step 2 fields.** Step 2 (Preferences) collects: Dietary Restrictions (checkboxes), Accessibility Needs (text area), and Parking Needed (single choice, required).

**R8. Step 3 confirmation.** Step 3 (Confirm) shows a read-only summary of the information entered in Steps 1–2, plus a submit action.

**R9. FAQ and Help.** The app provides a FAQ / Help page, reachable from a link visible on every screen. It answers users' frequently asked questions about using the EventConnect app.
