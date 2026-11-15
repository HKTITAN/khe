# Switch

Turns a setting on or off, and the change applies straight away.

## When to use it

- Use Switch for a setting that takes effect immediately, like dark mode or notifications.
- Use a checkbox inside a form when the choice only applies after Submit.

## Rules

- `label` is required. It names the setting, not the state: "Reduce motion", never "On".
- Keep the label the same in both states.

## Right

```tsx
<Switch label="Reduce motion" defaultChecked />
```

## Wrong

```tsx
<Switch label={on ? "Enabled" : "Disabled"} />   // label changes with state
```
