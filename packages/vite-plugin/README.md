# @stylin/vite-plugin
This is the official Vite plugin for `@stylin/style` package. It supports import from both CSS and SCSS files.

## Installation
```sh
npm install --save-dev @stylin/vite-plugin
```

Register your plugin in `vite.config.ts`:

```ts
import stylin from '@stylin/vite-plugin'

export default defineConfig({
  plugins: [stylin(), otherPlugin()]
})
```

And enjoy! You can now import components from your `.module.css` and `.module.scss` files:

```ts
import { Button } from '~/components/button.module.scss';

export default function MyCustomButton() {
  return (
    <Button variant="success">Custom button</Button>
  )
}
```

**Important note**  
This plugin only supports importing from **CSS modules.** So make sure your files end with `.module.css` or `.module.scss`.

## Typescript Support
This plugin comes with support for Typescript built-in! Modify your `vite.config.ts` as follows:

```ts
import stylin from '@stylin/vite-plugin'
import stylinTS from '@stylin/vite-plugin/ts'

export default defineConfig({
  plugins: [stylin(), stylinTS(), otherPlugin()]
})
```
> **Make sure to put the Typescript plugin *after* the base plugin.**

This plugin detects files that end with `.module.css` or `.module.scss` in your project and creates matching `.d.ts` files alongside them. For example, if your source code directory has this structure:
```
|-- src
  |-- components
    |-- button.module.css
```
The plugin will create a `button.module.css.d.ts` file next to it:
```
|-- src
  |-- components
    |-- button.module.css
    |-- button.module.css.d.ts
```
