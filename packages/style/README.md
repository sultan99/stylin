# @stylin/style

Core library. It is very tiny ([35 lines of code](./src/index.ts)) and well optimized for performance.
<br/>

## Installation

```sh
npm install --save @stylin/style
```
<br/>

## Shortening
Here are some tips to make life easier. 

If your component property values are similar to CSS class names, like in the example below:

```
type {
  primary: primary
  secondary: secondary
  link: link
}
```

It can be shorten this way:

```
type: primary | secondary | link
```

### More zen

```
/* conditional */
isVisible {
  true: visible
  false: hidden
}
/* short version */
isVisible: true ? visible : hidden

/* by the way it can be string or number */
checked: on ? blue : gray
checked: 1 ? blue : gray

/* single value */
isVisible {
  true: visible
}
/* short version */
isVisible: true visible

/* if value == css-name */
enabled {
  true: enabled
}
/* short version */
enabled: true
```
<br/>

## Variables
To map component variables with styles, you should provide the CSS variable and its default value. Webpack loader uses the default value to define the variable type and avoid reassigning it with the same value.

```
componentPropertyName: defualt-value --css-variable
```

```scss
/**
  @tag: button
  @component: SexyButton
  width: 150px --btn-width
*/
.sexy-button {
  --btn-width: 150px;
  width: var(--btn-width);
}
```

```jsx
<SexyButton width='180px'>
  Love me
</SexyButton>

/* HTML output:
<button style="--btn-width: 180px">
  Love me
</button>
*/
```
<br/>

### Caveat with CSS variables
You can't interpolate CSS variables with url(), it means you can't do this:

```
background-image: url(var(--src)); // will not work
```

Why? Read the answer [here](https://stackoverflow.com/questions/42330075/is-there-a-way-to-interpolate-css-variables-with-url). To fix this issue, you need to wrap the value with `url()` on JS side:

```scss
/**
  @tag: div
  @component: Avatar
  url: unset --src;
*/
.avatar {
  background-image: var(--src);
}
```

```jsx
const src = `https://picsum.photos/150`

<Avatar url={`url(${src})`}/>
```
<br/>