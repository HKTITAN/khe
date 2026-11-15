# SegmentedControl

Picks one of two to five options that change a view right away.

## When to use it

- Use SegmentedControl for view switches: List / Grid, Light / Dark / System.
- Use Tabs when each option shows a different panel of content.
- Use a Select when there are more than five options.

## Rules

- `aria-label` is required unless a visible label names it.
- Labels are one or two words, sentence case.

## Right

```tsx
<SegmentedControl aria-label="Theme" defaultValue="system"
  options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
```

## Wrong

```tsx
<SegmentedControl options={eightCountries} />   // too many options, no name
```
