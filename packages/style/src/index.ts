import React from 'react'

const createComponent = css => element => defaultClass => props => {
  const className = css[defaultClass] || ``
  const msaTree = css[`@react-msa`] && css[`@react-msa`][defaultClass]
  if (!msaTree) {
    return React.createElement(element, {
      className, ...props
    })
  }

  const {properties, variables} = msaTree
  const finalProps = Object
    .entries(props)
    .reduce((acc, [name, value]: [string, string]) => {
      if (properties[name] && value !== undefined) {
        const cssName = properties[name][value] || properties[name][`@default`]
        const hashName = css[cssName]
        if (hashName) {
          acc.className += ` ${hashName}`
        }
        return acc
      }

      if (variables[name]) {
        const [variable, defaultValue] = variables[name]
        defaultValue !== value && (acc.style[variable] = value)
        return acc
      }
      acc[name] = value

      return acc
    }, {className, style: {}})

  return React.createElement(element, finalProps)
}

const styleComponent = css => (element, className) => {
  const create = createComponent(css)
  if (css[element] && !className) {
    return create(`div`)(element)
  }

  return className ? create(element)(className) : create(element)
}

const handler = {
  get: (target, prop) => target(prop)
}

const applyCss = css => new Proxy(styleComponent(css), handler)

export default applyCss
