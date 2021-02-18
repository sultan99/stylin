import React, {FC} from 'react'
import {MSA} from '@stylin/msa-loader/index'

interface CreateComponent {
  <T>(css: Record<string, string>): (msa: MSA) => (props: T) => FC<T>
}

export const createComponent: CreateComponent = css => msa => props => {
  const className = css[msa.className] || ``
  const {tagName, properties, variables} = msa
  const finalProps = Object
    .entries(props)
    .reduce((acc, [name, value]: [string, string]) => {
      if (properties[name]) {
        if (value === undefined) return acc
        const cssName = properties[name][value] || properties[name][`@default`]
        const hashName = css[cssName]
        if (hashName) {
          acc.className += ` ${hashName}`
        }
        return acc
      }
      if (variables[name]) {
        const [defaultValue, variable] = variables[name]
        if (defaultValue !== value) {
          acc.style[variable] = value
        }
        return acc
      }
      acc[name] = value
      return acc
    }, {className, style: {}})

  return React.createElement(tagName, finalProps)
}
