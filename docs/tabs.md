# Tabs

Switches between related panels, one at a time.

## When to use it

- Use Tabs when each choice shows a different panel of content on the same page.
- Use SegmentedControl when the choice only changes how the same content looks.
- Use links when each choice is its own page with its own URL.

## Rules

- `TabsList` needs an `aria-label`.
- Give each `TabsTab` and its `TabsPanel` the same `value`.
- `orientation="vertical"` for a sidebar list of sections.

## Right

```tsx
<Tabs defaultValue="tokens">
  <TabsList aria-label="Explorer">
    <TabsTab value="tokens">Tokens</TabsTab>
    <TabsTab value="components">Components</TabsTab>
  </TabsList>
  <TabsPanel value="tokens">…</TabsPanel>
  <TabsPanel value="components">…</TabsPanel>
</Tabs>
```
