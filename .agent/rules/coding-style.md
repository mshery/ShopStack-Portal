---
trigger: always_on
---

ANTIGRAVITY RULES — Frontend Development

## 1. Mandatory Commands After Changes

### 1.1 Dependency Changes

When installing, removing, or updating dependencies:

```bash
npm install
npm run lint
npm run build
npm run dev

React + Zustand Edition (with ViewModel, Null-Safety & Memoization)

These are non-negotiable mental laws for frontend development.

They exist to:

prevent fragile UI

prevent over-engineering

keep velocity high as the app grows

make code easy to delete

make UI impossible to crash

If a decision is unclear, default to these rules.

0) THE PRIME DIRECTIVE

Code must be easier to DELETE than to WRITE.

If removing a feature:

requires touching many files

requires understanding hidden behavior

breaks unrelated screens

then the design is already wrong.

1) UI IS NOT ALLOWED TO THINK

UI renders. UI does not decide.

UI responsibilities:

layout

rendering

styling

trivial presentation branching

UI is forbidden from:

business logic

side effects

API calls

retries

data fetching

non-trivial derivation

❌ WRONG
if (user.isPremium) {
  await upgradeUser()
}

✅ CORRECT
<button disabled={!vm.canUpgrade} onClick={actions.upgrade} />


If a component contains behavior-changing if/else, it is not UI.

2) DATA FLOWS IN ONE DIRECTION ONLY

API → Normalizer → Store → Screen Hook → Page → Component

Never reverse the flow.

❌ Component → API
❌ Page → API
❌ Store → UI
❌ UI mutating state shape

If data flows backward, bugs multiply.

3) ALL EXTERNAL DATA IS HOSTILE

If it can be null, it WILL be null.

APIs lie.
Backends change.
Fields disappear.

RULE

Normalize once at the boundary

After normalization, downstream code must not need defensive checks

4) NULL-SAFETY RULE (CRITICAL)

Optional chaining is a LAST LINE OF DEFENSE, not a strategy.

❌ WRONG (leaks backend instability into UI)
<Text>{user?.name}</Text>


This hides bugs and spreads uncertainty.

✅ CORRECT — NORMALIZE EARLY
export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

const user = {
  name: asString(raw.name, "Unknown"),
}

<Text>{user.name}</Text>

WHEN ?. IS ALLOWED

?. is allowed ONLY when:

dealing with truly optional relationships

absence is a valid domain state

Examples:

user.avatarUrl && <Avatar src={user.avatarUrl} />
settings?.theme

WHEN ?. IS FORBIDDEN
user?.name
order?.id
profile?.email


If a field is conceptually required, normalize it.
Do not push null-handling into UI.

5) ARRAYS ARE NEVER OPTIONAL

If something is a list, it is ALWAYS an array.

Missing field → []

Failed request → []

Null response → []

❌ WRONG
items?: Item[]

✅ CORRECT
items: Item[]


If .map() can crash, the design is wrong.

6) STORES ARE BORING ON PURPOSE

A boring store is a healthy store.

Zustand stores:

hold state

expose setters

do nothing else

Forbidden in stores:

async logic

API calls

UI derivation

business rules

✅ CORRECT STORE
export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),

  errorMessage: null,
  setErrorMessage: (msg) => set({ errorMessage: msg }),
}))

7) SIDE EFFECTS HAVE HARD BOUNDARIES

Async logic must be contained or it spreads.

Allowed:

API modules

screen hooks

Forbidden:

UI components

pages

Zustand stores

8) EVERY SCREEN HAS EXACTLY ONE LOGIC HOOK

Hooks own behavior. Pages own layout.

Rules:

one screen → one hook

hook owns fetching, actions, side effects

page consumes results only

9) EVERY ASYNC SCREEN HAS EXACTLY FOUR STATES

No exceptions. No shortcuts.

Loading

Error

Empty

Success

type AsyncStatus = "loading" | "error" | "empty" | "success"

10) SCREEN HOOK IS THE BRAIN

The screen hook orchestrates everything.

It produces three explicit outputs:

status

vm (View Model)

actions

11) VIEW MODEL (vm) — THE UI CONTRACT

vm is the ONLY data shape UI reasons about.

PURPOSE

freeze UI thinking

centralize derivation

prevent logic leakage

provide stable UI contracts

RULES

vm contains derived, UI-ready data

vm contains NO functions

vm contains NO side effects

vm must be small and intentional

❌ WRONG
vm: {
  users,
  rawUsers,
  filteredUsers,
  sortedUsers,
  hasUsers,
  isEmpty,
}

✅ CORRECT
vm: {
  users,
  canRefresh,
}

12) MEMOIZATION RULES (IMPORTANT)

Memoization is about STABILITY, not performance micro-optimizations.

RULE 1 — vm MUST BE MEMOIZED
const vm = useMemo(() => ({
  users,
  canRefresh: status !== "loading",
}), [users, status])


This prevents:

unnecessary re-renders

unstable props

memoized components breaking

RULE 2 — ACTIONS MUST BE STABLE
const refresh = useCallback(async () => {
  // ...
}, [])


Actions passed to UI must not change identity unnecessarily.

RULE 3 — DO NOT MEMOIZE EVERYTHING

❌ WRONG

const isEmpty = useMemo(() => users.length === 0, [users])


This adds noise for zero gain.

MEMOIZE ONLY WHEN

values are passed to components

values are derived (not trivial)

identity stability matters

13) REQUIRED SCREEN HOOK PATTERN
export function useUsersScreen() {
  const { users, setUsers, setErrorMessage } = useUsersStore()
  const [status, setStatus] = useState<AsyncStatus>("loading")

  const refresh = useCallback(async () => {
    setStatus("loading")
    try {
      const data = await fetchUsers()
      setUsers(data)
      setStatus(data.length === 0 ? "empty" : "success")
    } catch (e) {
      setErrorMessage(toUserMessage(e))
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const vm = useMemo(() => ({
    users,
    canRefresh: status !== "loading",
  }), [users, status])

  const actions = useMemo(() => ({
    refresh,
  }), [refresh])

  return { status, vm, actions }
}

14) PAGES DO NOT FETCH DATA

Pages select layout, nothing more.

export function UsersPage() {
  const { status, vm, actions } = useUsersScreen()

  if (status === "loading") return <Skeleton />
  if (status === "error") return <Error onRetry={actions.refresh} />
  if (status === "empty") return <Empty />

  return <UsersList users={vm.users} />
}

15) COMPONENTS ARE PURE AND DUMB

Components render props. Nothing else.

Components:

do not fetch

do not derive meaning

do not mutate state

16) FAIL FAST IN DEV, FAIL SAFE IN UI

Developers see crashes. Users see messages.

API throws real errors

hooks convert errors to user-safe strings

UI never throws

17) DUPLICATION > WRONG ABSTRACTION

Bad abstraction is harder to delete than duplication.

18) NAMING IS A DESIGN DECISION

If naming is hard, the design is wrong.

19) OPTIMIZE FOR READING, NOT WRITING

Explicit > clever. Predictable > elegant.

20) THE EXIT RULE

Before merging, ask:

“Can another developer understand this screen by reading only the hook and page in under 30 seconds?”

If not:

simplify

split

rename

delete

FINAL RULE

The best code is code that does not exist.

Delete aggressively.
Normalize early.
Memoize intentionally.
Protect the UI at all costs.
```
