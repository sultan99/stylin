# @stylin/ts-loader

Webpack loader for type auto-generation.

<img src="./typing-support.gif"/>
<br/>

## Installation
```sh
npm install --save-dev @stylin/ts-loader
```
<br/>

In webpack configuration file, place `@stylin/ts-loader` after `@stylin/msa-loader` in modules/rules section.

#### `webpack.config.js`
```js
module.exports = {
  module: {
    rules: [{
      test: /\.scss$/i,
      use: [
        `@stylin/ts-loader`,
        `@stylin/msa-loader`,
        {loader: MiniCssExtractPlugin.loader}, // it can be `style-loader`
        {loader: `css-loader`, options: {modules: true}},
        `sass-loader`, // optional
      ],
    }],
  }
}
```
<br/>

## Options
You can customize the generated type names. By default, they are equal:
```js
 propsType: (componentName: string) => `${componentName}Props`
 styledPropsType: (componentName: string) => `Styled${componentName}Props`,
```
<br/>

The generated interfaces for `User` component will be:
#### 💅 `*.scss.d.ts`
```ts
export interface UserProps extends ComponentProps<'div'> {
  status: 'online' | 'busy' | 'offline'
}

export const User: FC<UserProps>
```
<br/>

## Optional property
For optional component properties, add a question mark as you do in typescript:

```scss
/**
  @tag: input
  @component: Input
  disabled?: true
*/
```
<br/>

## ⚠ Webpack watcher
Webpack in watch mode keeps tracking file changes only if it is in the dependency graph. It means if you create a file that is not imported in your application code source, webpack will not track it and will not generate types for it. Before starting coding a new component, first of all, import it into your code and then begin implementation.
<br/>
<br/>
