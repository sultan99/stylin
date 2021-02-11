<div align="center">
  <img src="./logo.svg" width="150px"/>
  <br/>
  <br/>
  <br/>
</div>
<br/>
<br/>


# Stylin
Stylin is a built-time CSS library that offers an elegant way to style React components. It extends CSS Modules and adds some missing features like dynamic variables or auto-typing. 

```jsx
import styles from './styles.scss'
import applyCss from 'stylin'

const styled = applyCss(styles)
const Title = styled.h1(`title`)

<Title color="tomato" size="large">
  Hello world!
</Title>
```

#### 💅 `style.scss`
```css
/**
  @color: --color #38383d
  @size: small | medium | large
*/
.title {
  --color: #38383d;
  color: var(--color);
  font-size: 18px;
  
  &.small {
    font-size: 14px;
    margin: 2px 0;
  }
  &.medium {
    font-size: 18px;
    margin: 4px 0;
  }
  &.large {
    font-size: 20px;
    margin: 6px 0;
  }
}
```

All the magic is behind the style annotations, which you can find in the comment section. It is like JSDoc, but for CSS. However, it is not a CSSDoc. It is more about mapping styles with component properties. 

With the annotations you can:
 - map styles with components
 - generate TypeScript types
 - generate documents or even stories for StoryBook

 For all these, you will need a specific package, plugin, or webpack loader.

<br/>
<br/>

## Motivation
I needed a fast runtime CSS library. I didn't wish to mix styles with the code or matching CSS classes with the component state to get a value for the className. I wanted to declare some CSS styles in a separate file and get the component ready for use. 

Using this library, you can style your components without global CSS without mixing it with the main code. No conditions or functions in your styles, but what you will have to is declarative annotations for mapping relations between components and styles. As a bonus, you will get typed styled-components and documentation for your stylesheets.