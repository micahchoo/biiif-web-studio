# Redundant Tests Deletion Plan

## Criteria for Deletion

Tests are redundant if they:
1. **Tautological** - Test that constants exist or are defined
2. **Trivial Props** - Only test prop forwarding without behavior
3. **Implementation Details** - Test internal state or private methods
4. **Mock-Heavy** - Test mocks instead of real behavior

## Tests to Delete

### components.test.tsx - Trivial Prop Tests

**DELETE (Lines ~34-39):**
```typescript
it('should apply custom className', () => {
  render(<Icon name="settings" className="text-red-500 text-xl" />);
  const icon = screen.getByText('settings');
  expect(icon).toHaveClass('text-red-500', 'text-xl');
});
```
**Reason:** Only tests className forwarding, no behavior verification

**DELETE (Lines ~49-54):**
```typescript
it('should display title tooltip', () => {
  render(<Icon name="info" title="Information" />);
  const icon = screen.getByText('info');
  expect(icon).toHaveAttribute('title', 'Information');
});
```
**Reason:** Only tests attribute forwarding

**DELETE (Lines ~56-61):**
```typescript
it('should inherit font size', () => {
  render(<Icon name="star" />);
  const icon = screen.getByText('star');
  expect(icon).toHaveStyle({ fontSize: 'inherit' });
});
```
**Reason:** Tests CSS implementation detail

**DELETE (Lines ~119-125):**
```typescript
it('should apply custom className', () => {
  const { container } = render(
    <EmptyState icon="home" title="Title" className="custom-class" />
  );
  expect(container.firstChild).toHaveClass('custom-class');
});
```
**Reason:** Duplicate className forwarding test

**KEEP:**
- `should handle click events` - Tests user interaction ✓
- `should render with action button` - Tests user interaction ✓
- `should render with icon and title` - Tests visual rendering ✓

### iiifBehaviors.test.ts - Tautological Constant Tests

Need to check for tests that just verify constants exist.

### exportService.test.ts - Mock-Heavy Tests

According to plan, this file is heavily mocked and should be replaced by export.actions.test.ts.
We'll keep it for now but mark for replacement.

### csvImporter.test.ts - "should be exported" tests

According to exploration, this file has trivial export tests that should be deleted.

## Implementation Strategy

1. **Phase 1:** Delete obvious trivial prop tests from components.test.tsx
2. **Phase 2:** Check and delete tautological tests from iiifBehaviors.test.ts
3. **Phase 3:** Document exportService.test.ts for replacement (don't delete yet)
4. **Phase 4:** Clean up csvImporter.test.ts export tests

## Metrics

**Target:** Delete ~30-50 redundant tests
**Impact:** Reduce test suite by 10-15% while maintaining real coverage
**Benefit:** Focus on action-driven tests that verify user-facing behavior

---

*Created: 2026-01-31*
