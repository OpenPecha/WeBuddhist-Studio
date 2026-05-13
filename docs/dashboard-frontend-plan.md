# Dashboard frontend plan

This document captures the product and technical plan for the CMS dashboard (All / Plans / Series), aligned with design and backend reality as discussed.

---

## 1. Goals

| Area | Target |
|------|--------|
| **Navigation** | Single primary experience: chips **All \| Plans \| Series** (exactly one active). |
| **Table** | One table component for all three modes; no separate expand/chevron rows for series in the main list. |
| **Row layout** | Thumbnail, **title** with **tags under title**: language chip(s), status chip, duration (days; **0 days** allowed for series when API returns 0). |
| **Columns** | Enrolled, **date modified** (relative when `updated_at` exists; otherwise **—** or mock label), **featured** as **star icon only**, **⋮** actions. |
| **Add** | Dropdown: **Add Series**, **Add Plan**; **+** in a **red circular** (`#A51C21`) badge next to the word Add. |
| **Filters (toolbar)** | **Sort**: dropdown; initially **one option** — *Recently modified* (maps to `sort_by=updated_at`, `sort_order=desc` on plans API when supported). **Language**: English / 中国人 / བོད་སྐད། (`EN` / `ZH` / `BO`). **Status**: Draft, Published, Unpublished, Archived (pill styling per design). |
| **Actions** | Plan rows: same CMS behaviour as before (edit, status transitions, delete) via plan actions menu; **icon-only ⋮** trigger on the table. Series rows: edit link + delete when CMS exists; until then, stub or minimal menu. |

---

## 2. Backend assumptions (series)

From the shared CMS series code at the time of planning:

- **List** `GET /cms/series`: only `search`, `skip`, `limit` — no list-level language/status/sort query params exposed yet.
- **List payload**: `SeriesDTO` includes `name`, `image`, `status`, `featured`; list path did not populate full `plans` / aggregated **`total_days`** (often **0** on list) until backend changes.
- **CRUD**: list + get + create existed; **PATCH status / featured / DELETE** for series were not in the snippet — parity with plan ⋮ actions requires new endpoints.

Plans API: confirm support for **`updated_at`** sort and any **`language` / `status`** filters before relying on them for pagination correctness.

---

## 3. Revised strategy (two phases)

### Phase A — Ship UI; tolerate API gaps

1. **Unified table** (`DashboardContentTable`) + row model (`DashboardTableRow`, mappers in `dashboardTable.ts`).
2. **Plans**: call real list API; send **recently modified** sort when agreed with backend (`updated_at` + `desc`). If the API rejects unknown `sort_by`, remove or gate behind a flag until backend supports it.
3. **Series**: same table; map API/legacy shapes (`name` → title, `image` → thumbnail, etc.).
4. **Language / status filters**: apply on the **current page** client-side when the list API does not accept those params (no “filters apply only to loaded page” disclaimer in UI for **All**; **All** uses mock/imaginary feed — see below).
5. **Empty / error**: dashed **placeholder** when there is nothing to show or load fails; optional CTAs (Add plan / Add series).
6. **Featured**: plans keep `PATCH .../plans/:id/featured`; series stars read-only or omitted until a series featured endpoint exists.

### Phase B — Backend alignment

| Need | Typical backend change |
|------|-------------------------|
| Correct **All** pagination + global sort | **Single master list** endpoint with `type`, filters, sort, and cursor/`skip`/`limit`, **or** documented merge semantics if two list APIs stay. |
| Series filters + sort | Query params on `GET /cms/series` wired to repository (`order_by`, filters). |
| Meaningful **total_days** on series list | Aggregate in SQL or lightweight include without full nested plans. |
| **Modified** column for series | Expose `updated_at` (and/or `created_at`) on `SeriesDTO`. |
| **Enrolled** on series | Field on DTO if product requires it. |
| Series ⋮ parity | `PATCH` status, `PATCH` featured, `DELETE` (or soft delete) mirroring plans. |

---

## 4. “All” view — imaginary API + mock

- **Request**: `GET /api/v1/cms/dashboard/unified-feed` (placeholder path; name can change when backend exists).
- **Behaviour**: on **any failure** (404, network, etc.), return **mock rows** from `MOCK_DASHBOARD_ALL_ROWS` in `dashboardAllFeed.ts`, with client-side **search** slice + pagination over the mock list.
- **Mock richness** (as requested): rows include **realistic `image_url`s** and **`languages` as an array** of `EN` \| `ZH` \| `BO` (multiple allowed per row).

---

## 5. Language model (data + UI)

- **`DashboardTableRow.languages`**: `("EN" \| "ZH" \| "BO")[]`, order preserved, deduped when parsing from API (`language`, `languages`, or `language_codes` string/array).
- **Filters**: selecting a language keeps rows where **`languages` includes** that code.
- **Chips under title**: one pill per code (English / 中国人 / བོད་སྐད། styling).

---

## 6. Implementation map (frontend)

| Piece | Role |
|-------|------|
| `Dashboard.tsx` | Chips, search, Add menu, filter bar, queries, pagination, placeholders, maps API → `DashboardTableRow`, applies filters. |
| `DashboardContentTable.tsx` | Unified table UI, loading/empty rows, chips, star, plan vs series actions. |
| `dashboardTable.ts` | Types, `parseDashboardLanguages`, `mapPlanToTableRow`, `mapSeriesToTableRow`, `applyDashboardRowFilters`, `formatRowModified`, `isMockDashboardId`. |
| `dashboardAllFeed.ts` | Imaginary URL, `MOCK_DASHBOARD_ALL_ROWS`, `fetchDashboardAllImaginary`. |
| `DropdownButton.tsx` | `triggerVariant: "icon"` for table; invalidate/refetch plans + all-feed after mutations where relevant. |

Legacy **`DashBoardTable`** / **`SeriesTable`** may remain in the repo unused until fully removed.

---

## 7. Open decisions (with backend)

1. **One master list API vs three list APIs** for **All** — affects pagination and sort correctness.
2. **Exact `sort_by` values** for plans (e.g. `updated_at` vs `modified_at`).
3. **Tibetan label** in chips: product constants vs design (`བོད་ཡིག` vs `བོད་སྐད།`) — align copy everywhere if required.

---

## 8. Testing notes

- Default dashboard tab **Plans** for stable tests.
- Prefer **`findBy*` / `waitFor`** for query-driven UI; menu items via **`role="menuitem"`** to avoid duplicate “Add Series” text from placeholders.

---

*Last aligned with implementation in-repo (unified table, filters, mock All feed, multi-language mock rows). Update this file when Phase B lands or API contracts change.*
