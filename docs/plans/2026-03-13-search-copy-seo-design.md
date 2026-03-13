# Search Copy SEO Cleanup Design

**Date:** 2026-03-13

## Goal

Search-facing pages should consistently describe the product as a guest recruitment service, and legal pages should stop influencing search result snippets.

## Scope

- Keep the homepage metadata as the canonical search-facing wording.
- Replace outdated `용병` terminology on indexed public copy where it can affect search snippets.
- Mark legal pages as `noindex` while keeping them crawlable.
- Remove legal pages from the sitemap.
- Add a small regression check that fails if indexed-copy files reintroduce banned phrases or if legal pages stop exporting `noindex`.

## Decisions

### Terminology

- Use `게스트 모집` as the public-facing product term.
- Replace legal-page copy such as `농구 용병 모집 플랫폼` with `농구 게스트 모집 및 매칭 플랫폼`.
- Keep internal domain model values and non-search-facing copy unchanged in this task.

### Indexing Strategy

- `terms` and `privacy` remain publicly accessible, but export `noindex` metadata.
- `robots.txt` continues to allow crawling for those pages so Google can see the `noindex`.
- `sitemap.xml` lists only pages we want indexed.

### Verification

- Add a Node test that scans indexed-copy source files for banned search-facing phrases and checks that legal pages export `index: false`.
- Run the test first to confirm it fails, then apply the smallest code changes to make it pass.
