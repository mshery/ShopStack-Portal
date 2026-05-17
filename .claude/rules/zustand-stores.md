# Zustand Stores

Zustand 5 is the **client-state** layer. **TanStack Query is the server-state layer.** Never confuse the two: anything that came from an HTTP response belongs in a query, not a store.

## The boring-store rule

A store holds state and exposes setters. **That's it.**

Forbidden in a store:

- ❌ Async logic (`async`/`await`, promises)
- ❌ `axios` or `fetch` calls
- ❌ React imports
- ❌ Cross-store calls
- ❌ Derived/computed UI data (compute in the screen hook)
- ❌ Business rules ("a cart with > 10 items shows a warning")

If a store does any of these, move them to the screen hook or a query.

## Canonical shape

```ts
// modules/cart/store/cart.store.ts
import { create } from "zustand"
import type { CartItem } from "../types"

type CartState = {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}))
```

Notice: no async, no fetch, no derivation. The screen hook orchestrates; the store remembers.

## The curried `create<T>()(...)` form (mandatory)

Always call `create` with the **curried** form — `create<State>()(initializer)` — not `create<State>(initializer)`. The curried form is required for middleware to type-infer correctly.

```ts
// ❌ Breaks when you add devtools/persist
export const useStore = create<CartState>((set) => ({ /* ... */ }))

// ✅ Works with any middleware composition
export const useStore = create<CartState>()((set) => ({ /* ... */ }))
```

## Separating state from actions in the type

For stores past a few setters, split the type into state and actions. It makes the surface obvious and keeps the file scannable.

```ts
type CartState = {
  items: CartItem[]
  promoCode: string | null
}

type CartActions = {
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  setPromoCode: (code: string | null) => void
  clear: () => void
}

export const useCartStore = create<CartState & CartActions>()((set) => ({
  items: [],
  promoCode: null,
  // ...setters
}))
```

## Selectors — always

**Never** subscribe to the whole store from a component. Always select the slice you need.

```ts
// ❌ WRONG — re-renders on every state change
const cart = useCartStore()

// ✅ CORRECT — re-renders only when items change
const items = useCartStore((s) => s.items)
const addItem = useCartStore((s) => s.addItem)
```

For multiple values, use the `useShallow` helper (Zustand 5):

```ts
import { useShallow } from "zustand/react/shallow"

const { items, addItem } = useCartStore(useShallow((s) => ({
  items: s.items,
  addItem: s.addItem,
})))
```

Extract reusable selectors to module scope when they appear in multiple components:

```ts
// modules/cart/store/cart.selectors.ts
import type { CartState, CartActions } from "./cart.store"

export const selectItemCount = (s: CartState & CartActions) => s.items.length
export const selectTotalCents = (s: CartState & CartActions) =>
  s.items.reduce((sum, i) => sum + i.priceCents * i.qty, 0)

// Component
const total = useCartStore(selectTotalCents)
```

## Slices — typed composition

When a feature's state grows past ~5 setters or splits into two concerns, split into slices and compose. The `StateCreator` generic is required so each slice can see the full store type via `get()`.

```ts
import { create, type StateCreator } from "zustand"

type ItemsSlice = {
  items: CartItem[]
  addItem: (item: CartItem) => void
}

type PromoSlice = {
  promoCode: string | null
  applyPromo: (code: string) => void
}

const createItemsSlice: StateCreator<
  ItemsSlice & PromoSlice,  // full store type
  [],
  [],
  ItemsSlice                 // this slice
> = (set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
})

const createPromoSlice: StateCreator<
  ItemsSlice & PromoSlice,
  [],
  [],
  PromoSlice
> = (set) => ({
  promoCode: null,
  applyPromo: (code) => set({ promoCode: code }),
})

export const useCartStore = create<ItemsSlice & PromoSlice>()((...a) => ({
  ...createItemsSlice(...a),
  ...createPromoSlice(...a),
}))
```

Slices live in `modules/<x>/store/slices/`.

## Persistence

For state that must survive a refresh (auth token? **no** — see `security.md` — but theme, cart draft, last-viewed filters):

```ts
import { persist, createJSONStorage } from "zustand/middleware"

export const useFiltersStore = create<FiltersState & FiltersActions>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: "shopstack:filters",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
```

Rules:

- Prefix every storage key with `shopstack:`.
- Bump `version` and provide a `migrate` function on any breaking change.
- **Never** persist anything sensitive (tokens, PII, payment info).
- Test the migration before merging.

### Partial persist with `partialize`

Most stores have transient fields that should not be persisted (loading flags, modal visibility). Use `partialize`:

```ts
persist(
  (set) => ({
    theme: "light",
    language: "en",
    isLoading: false,    // transient — don't persist
    error: null,         // transient — don't persist
    // ...setters
  }),
  {
    name: "shopstack:settings",
    partialize: (state) => ({
      theme: state.theme,
      language: state.language,
    }),
  }
)
```

### Version migration

When the persisted shape changes, bump `version` and migrate. Without this, returning users see crashes from stale shapes.

```ts
persist(
  (set) => ({ /* current store */ }),
  {
    name: "shopstack:cart",
    version: 2,
    migrate: (persisted: unknown, fromVersion: number) => {
      const state = persisted as Record<string, unknown>

      if (fromVersion === 0) {
        // v0 → v1: rename `cartItems` to `items`
        state.items = state.cartItems
        delete state.cartItems
      }
      if (fromVersion === 1) {
        // v1 → v2: add `promoCode: null` default
        state.promoCode = null
      }
      return state as CartState & CartActions
    },
  }
)
```

### Hydration detection

Persisted stores hydrate **asynchronously**. Reading state before hydration completes returns initial values, which can flash the wrong UI. When the UI depends on hydrated state, gate render on `onFinishHydration`:

```ts
export const useFiltersStore = create<...>()(persist(/* ... */))

// In the app shell — block render until hydrated
function App() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsubFinish = useFiltersStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    // Catch the synchronous case
    if (useFiltersStore.persist.hasHydrated()) setHydrated(true)
    return unsubFinish
  }, [])

  if (!hydrated) return <Splash />
  return <Router />
}
```

For stores where the initial value is acceptable until hydration, skip this — the trade-off is a brief incorrect frame.

## Devtools

Wrap in `devtools` middleware in dev only — Vite's `import.meta.env.DEV` keeps it out of prod:

```ts
import { devtools } from "zustand/middleware"

const middleware = <T,>(fn: T) =>
  import.meta.env.DEV ? devtools(fn, { name: "CartStore" }) : fn

export const useCartStore = create<CartState & CartActions>()(
  middleware((set) => ({ /* ... */ }))
)
```

Use named action labels when calling `set` inside devtools-wrapped stores — they show up in the timeline:

```ts
addItem: (item) =>
  set((s) => ({ items: [...s.items, item] }), false, "cart/addItem"),
```

## Middleware order

Apply middleware **inside-out**. The standard order in this project:

```ts
create<T>()(
  devtools(           // outermost — sees every change
    persist(           // wraps the core for storage
      (set) => ({ /* store */ }),
      { name: "shopstack:..." }
    ),
    { name: "...", enabled: import.meta.env.DEV }
  )
)
```

If you add Immer, it goes innermost: `devtools(persist(immer(...)))`.

## Immer middleware (optional)

For stores with deeply-nested state, `zustand/middleware/immer` lets you write "mutations" that produce immutable updates. Use it sparingly — most ShopStack stores are flat enough that immer is overhead, and immer requires `produce` to be in the bundle.

```ts
import { immer } from "zustand/middleware/immer"

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    blocks: [],
    updateBlock: (id, patch) =>
      set((state) => {
        const block = state.blocks.find((b) => b.id === id)
        if (block) Object.assign(block, patch)    // safe with immer
      }),
  }))
)
```

Don't reach for immer until you actually have a nested-update bug.

## Subscriptions (outside React)

Use `subscribe` for non-React listeners (analytics, broadcasting to a tab via `BroadcastChannel`, syncing across stores in a deliberate way). For selector-based subscriptions, import the `subscribeWithSelector` middleware:

```ts
import { subscribeWithSelector } from "zustand/middleware"

export const useCartStore = create<CartState & CartActions>()(
  subscribeWithSelector((set) => ({ /* ... */ }))
)

// In a one-time setup (app shell, analytics module)
const unsub = useCartStore.subscribe(
  (s) => s.items.length,
  (count, prev) => {
    if (count > prev) analytics.track("cart_item_added", { count })
  },
  { equalityFn: (a, b) => a === b, fireImmediately: false }
)

// Always clean up in the same scope
window.addEventListener("beforeunload", unsub)
```

Inside React, subscriptions live inside `useEffect` and **must** be cleaned up:

```ts
useEffect(() => {
  const unsub = useCartStore.subscribe((s) => s.items.length, onCountChange)
  return unsub
}, [])
```

## What goes in a store vs a query

| Question | Layer |
|---|---|
| "Did the user open the filter panel?" | Store |
| "What's in the cart right now?" | Store (synced from server on checkout) |
| "What are the search results for `query`?" | Query |
| "What's the current user?" | Query (with `staleTime: Infinity` if rarely changes) |
| "What route are we on?" | React Router, neither |
| "What theme is selected?" | Store (persisted) |

## One store per module

Don't create a god store. Each module owns one store at most (or one per slice). If two modules need the same state, it belongs in a third module both can import — and only through the public `index.ts`.

## Reading state outside React

Stores expose `getState()` / `setState()` / `subscribe()` for use in non-React code (interceptors, the axios `core/api/httpClient.ts`):

```ts
// core/api/httpClient.ts
import { useAuthStore } from "@/modules/auth"

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

Use `getState()` outside React; use the hook inside React.

## Testing stores

Stores are plain functions — no React required:

```ts
import { useCartStore } from "./cart.store"

beforeEach(() => useCartStore.setState({ items: [] }))

test("addItem appends", () => {
  useCartStore.getState().addItem({ id: "a", qty: 1, priceCents: 1000 })
  expect(useCartStore.getState().items).toHaveLength(1)
})
```

Reset state in `beforeEach`. Don't share state between tests.

If the store uses `persist`, also clear the storage key in `beforeEach`:

```ts
beforeEach(() => {
  localStorage.removeItem("shopstack:cart")
  useCartStore.setState(useCartStore.getInitialState())
})
```

## Anti-patterns

### ❌ Don't store derived state

```ts
// ❌ wrong — itemCount drifts from items
items: [],
itemCount: 0,
addItem: (item) => set((s) => ({
  items: [...s.items, item],
  itemCount: s.items.length + 1,
})),

// ✅ correct — derive in the screen hook (memoized)
const itemCount = useMemo(() => items.length, [items])
```

### ❌ Don't mutate state

```ts
// ❌ wrong — Zustand can't detect changes; components don't re-render
addItem: (item) => set((s) => {
  s.items.push(item)
  return s
}),

// ✅ correct — immutable update
addItem: (item) => set((s) => ({ items: [...s.items, item] })),
```

Use Immer if you genuinely need mutation-style updates (see above).

### ❌ Don't store server data

```ts
// ❌ wrong — duplicates TanStack Query cache, loses invalidation
useProductsStore.setState({ products: await fetchProducts() })

// ✅ correct — query owns server data
const { data: products } = useProductsQuery()
```

### ❌ Don't subscribe without cleanup

```ts
// ❌ memory leak
useEffect(() => {
  useStore.subscribe((s) => console.log(s))
}, [])

// ✅ cleanup
useEffect(() => {
  const unsub = useStore.subscribe((s) => console.log(s))
  return unsub
}, [])
```

### ❌ Don't cross-call stores from inside actions

```ts
// ❌ wrong — couples stores, breaks deletion, makes both untestable
const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  logout: () => {
    set({ user: null })
    useCartStore.getState().clear()  // hidden coupling
  },
}))

// ✅ correct — the hook coordinates, stores stay independent
function useLogoutAction() {
  const clearAuth = useAuthStore((s) => s.clear)
  const clearCart = useCartStore((s) => s.clear)
  return useCallback(() => {
    clearAuth()
    clearCart()
  }, [clearAuth, clearCart])
}
```

### ❌ Don't persist sensitive data

Tokens, PII, payment details. `localStorage` is XSS-readable. See `security.md`.

## See also

- `architecture.md` — where stores sit in the layer stack
- `data-flow.md` — how data reaches a store
- `service-patterns.md` — TanStack Query vs Zustand
- `security.md` — what never to persist
