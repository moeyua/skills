---
name: app-development
description: Vue/Nuxt/Tailwind application conventions. Use when building web apps, choosing between Vite and Nuxt, or writing Vue components.
---

# App Development

## Framework Selection

| Use Case | Choice |
|----------|--------|
| SPA, client-only, library playgrounds | Vite + Vue |
| SSR, SSG, SEO-critical, file-based routing, API routes | Nuxt |

## Dev Server

Use [portless](https://github.com/vercel-labs/portless) to wrap dev server commands with stable `.localhost` URLs. Configure in `package.json` scripts:

```jsonc
{
  "scripts": {
    "dev": "portless run next dev",        // instead of "next dev"
    "dev": "portless run nuxi dev",        // instead of "nuxi dev"
    "dev": "portless run vite",            // instead of "vite"
  }
}
```

When setting up or modifying `dev` scripts in app projects, always wrap the dev command with `portless run`.

## Vue Conventions

| Convention | Preference |
|------------|------------|
| Script syntax | Always `<script setup lang="ts">` |
| State | Prefer `shallowRef()` over `ref()` |
| Objects | Use `ref()`, avoid `reactive()` |
| Styling | Tailwind CSS |
| Utilities | VueUse |

### Props and Emits

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

interface Emits {
  (e: 'update', value: number): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

const emit = defineEmits<Emits>()
</script>
```
