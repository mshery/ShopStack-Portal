# React Patterns

ShopStack Portal uses React 19. These rules cover component shape, hooks discipline, refs, Suspense, and the patterns that keep the tree predictable. They are downstream of `architecture.md` (layering) and `coding.md` (the prime directive).

## Component contract

A component receives props and renders. That's it.

```tsx
type Props = Readonly<{
  user: User
  onEdit: (id: UserId) => void
}>

export function UserRow({ user, onEdit }: Props) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>
        <Button onClick={() => onEdit(user.id)}>Edit</Button>
      </td>
    </tr>
  )
}
```

Function declarations for exported components; arrow functions are fine for inline children. Use `function` (not `React.FC`); `React.FC` is deprecated guidance from the React team.

## The Rules of Hooks (Anthropic-/React-team-strict)

1. **Call hooks at the top level.** Never inside a condition, loop, or nested function.
2. **Call hooks only from React functions** (components or other hooks).
3. **Hook names start with `use`.** ESLint's `react-hooks` plugin enforces this — we run with `--max-warnings 0`.
4. **Dependencies are complete.** No `// eslint-disable-next-line react-hooks/exhaustive-deps`. If a dep is intentionally omitted, the design is wrong — pull the value through a ref or restructure the effect.

## `useEffect` — last resort

`useEffect` is for **synchronizing with external systems** (DOM APIs, subscriptions, browser storage). It is **not** for computing derived state or transforming data.

```tsx
// ❌ WRONG — derived state in effect
const [fullName, setFullName] = useState("")
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])

// ✅ CORRECT — derive during render
const fullName = `${first} ${last}`
```

Don't use `useEffect` to: format data, filter lists, reset state on prop change (use `key` instead), trigger fetches (use TanStack Query), notify parents (call the handler directly).

## `useMemo` and `useCallback` — for stability

Memoize when (a) the value is passed to a memoized child, (b) the value is non-trivially derived, or (c) it's a dep of another hook and identity matters.

```tsx
// ✅ vm is passed to children
const vm = useMemo(() => ({ users, canRefresh: status !== "loading" }), [users, status])

// ✅ actions are deps of effects and props of memoized children
const refresh = useCallback(async () => { /* ... */ }, [])

// ❌ pointless — trivial scalar
const count = useMemo(() => users.length, [users])
```

The React 19 compiler is opt-in and we haven't adopted it; until we do, memoize the things above by hand.

## State

- `useState` for ephemeral UI state (open/closed, hover, focused index).
- **Zustand** for client state that crosses components or persists across navigation.
- **TanStack Query** for any server state. Never store server data in `useState` or Zustand.

If you find yourself synchronizing `useState` with a prop, lift the state or use a controlled component pattern. Don't introduce `useEffect` to copy props into state.

## Controlled inputs + react-hook-form

All forms use `react-hook-form` with `zod` resolvers (`@hookform/resolvers/zod`).

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
type FormValues = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormValues>({ resolver: zodResolver(schema) })
```

Rules:

- One schema per form; live next to the form file (`login.schema.ts`).
- The form's submit handler receives the validated `FormValues` — no manual validation.
- Disable the submit button on `isSubmitting`.
- Show field-level errors with `aria-invalid` and `aria-describedby`.

## Refs

`useRef` is for **mutable values that should not trigger re-render** or for **DOM access**. Forward refs with the React 19 syntax — refs are now props.

```tsx
type Props = Readonly<{ ref?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>>

export function TextField({ ref, ...rest }: Props) {
  return <input ref={ref} {...rest} />
}
```

Do **not** read `ref.current` during render. It's only valid in effects and event handlers.

## Suspense + Error Boundaries

App shell wraps the routed area in:

```
<ErrorBoundary fallback={<AppError />}>
  <Suspense fallback={<AppSpinner />}>
    <RouterProvider router={router} />
  </Suspense>
</ErrorBoundary>
```

Lazy-load routes with `React.lazy` (see `performance.md`). For inline error recovery on a single section, wrap that section in a smaller error boundary.

## Composition over configuration

Prefer children/slots over boolean-flag props.

```tsx
// ❌ WRONG
<Modal hasHeader hasFooter primaryAction="Save" secondaryAction="Cancel" />

// ✅ CORRECT
<Modal>
  <Modal.Header>Edit profile</Modal.Header>
  <Modal.Body><ProfileForm /></Modal.Body>
  <Modal.Footer>
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </Modal.Footer>
</Modal>
```

Radix UI primitives already follow this — match their shape when you wrap them.

## Keys

`key` must be a stable id from the data (`user.id`), not the array index. Index keys are only allowed for static lists that never reorder.

## Don't `cloneElement`, don't `Children.map`

If you need to inject props into children, use a render-prop or context. `React.Children` is a legacy API.

## Conditional rendering — explicit > clever

```tsx
// ❌ WRONG — 0 leaks into the DOM
{items.length && <List items={items} />}

// ✅ CORRECT
{items.length > 0 ? <List items={items} /> : <Empty />}
```

## Event handlers

- Prefix props with `on*`: `onClick`, `onSubmit`, `onValueChange`.
- Prefix internal handlers with `handle*`: `handleClick`, `handleSubmit`.
- Don't pass anonymous handlers to memoized children (breaks memoization). Wrap with `useCallback` or hoist.

## Accessibility hooks in

Every interactive component needs a name, a role, and a focus path. See `accessibility.md`. Lean on Radix primitives — they get these right by default.

## See also

- `architecture.md` — where components live
- `zustand-stores.md` — when to reach for a store
- `service-patterns.md` — TanStack Query usage
- `performance.md` — memoization, splitting
- `accessibility.md` — interactive component requirements
