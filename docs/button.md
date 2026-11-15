# Button

Runs an action. Built on ui-sdk's Button, so it handles keyboard, disabled focus and pending state.

## When to use it

- Use Button for an action on this page: save, send, open a dialog.
- Use a link, not a Button, when it goes to another page.

## Variants

- `primary`: the one most important action on a screen. At most one per view.
- `secondary`: everything else. This is the default; most buttons are secondary.

There is no `ghost`, `destructive` or `link` variant. Don't invent one.

## Sizes

- `md` (36px): the default.
- `sm` (30px): inside dense rows, toolbars and table cells only.

## Pending

Return a Promise from `onClick`. The button shows `data-pending` and ignores presses until it settles. Don't add your own spinner state.

## Right

```tsx
<Button variant="primary" onClick={publish}>Publish</Button>
<Button onClick={close}>Cancel</Button>
```

## Wrong

```tsx
<Button variant="primary">Save</Button>
<Button variant="primary">Publish</Button>   // two primaries on one screen
<Button className="text-red-500">Delete</Button>   // Button takes no className
```
