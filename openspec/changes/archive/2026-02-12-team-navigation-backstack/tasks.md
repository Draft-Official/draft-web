## 1. Safe Back Navigation Hook

- [x] 1.1 Create `src/shared/lib/hooks/use-safe-back.ts` with history.state.idx check
- [x] 1.2 Export hook from `src/shared/lib/hooks/index.ts`
- [x] 1.3 Add TypeScript type for useSafeBack return value

## 2. Team Detail Tab URL Sync

- [x] 2.1 Update `team-detail-view.tsx` to use useSearchParams for tab state
- [x] 2.2 Implement handleTabChange with router.replace for URL updates
- [x] 2.3 Add validation for view query param (home|schedule|members)
- [x] 2.4 Ensure non-member tab restriction works with URL params
- [ ] 2.5 Test tab state persistence on page refresh

## 3. Team Pages Back Navigation

- [x] 3.1 Update `team-detail-view.tsx` header back button to use useSafeBack('/team')
- [x] 3.2 Update `team-settings-view.tsx` back buttons to use useSafeBack(`/team/${code}`)
- [x] 3.3 Update `team-profile-edit-view.tsx` back button to use useSafeBack(`/team/${code}/settings`)
- [x] 3.4 Update `pending-members-view.tsx` back button to use useSafeBack(`/team/${code}`)
- [x] 3.5 Update `team-match-detail-view.tsx` back button to use useSafeBack(`/team/${code}`)

## 4. Bottom Nav Smart Behavior

- [x] 4.1 Update `bottom-nav.tsx` to replace Link with button + onClick
- [x] 4.2 Implement handleNavClick with pathname check logic
- [x] 4.3 Add scroll-to-top behavior for same tab clicks
- [ ] 4.4 Test navigation from sub-pages to parent tab

## 5. Share Functionality

- [x] 5.1 Add share button to `team-detail-header.tsx` UI
- [x] 5.2 Implement handleShare with Web Share API check
- [x] 5.3 Add clipboard fallback with toast notification
- [x] 5.4 Include current view query param in shared URL
- [ ] 5.5 Test share functionality on mobile and desktop

## 6. Testing & Validation

- [ ] 6.1 Test deep link navigation (e.g., from KakaoTalk) and back button behavior
- [ ] 6.2 Test tab state sharing and direct navigation to specific tabs
- [ ] 6.3 Test non-member restriction with ?view=schedule URL param
- [ ] 6.4 Test bottom nav same-tab clicks for scroll behavior
- [ ] 6.5 Verify browser history management (no unnecessary stack pollution)
- [ ] 6.6 Test on mobile devices (iOS Safari, Android Chrome)
