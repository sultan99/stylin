import React, {Ref} from 'react'
import {MSA} from '@stylin/msa-loader/index'
import {CreateComponent, ApplyStyle} from './types'

export const url = (value: string) => `url(${value})`

export const createComponent: CreateComponent = css => (msa, component) => {
  const Component = <T>({className: firstClassName = ``, ...props}, ref: Ref<T>) => {
    const className = `${firstClassName} ${css[msa.className] || ``}`
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
      }, {ref, className, style: {}}) as any
    return React.createElement(component || tagName, finalProps)
  }
  Component.displayName = msa.componentName
  return React.forwardRef(Component)
}

export const applyStyle: ApplyStyle = css => msaList => (style, component) => {
  const msa = msaList.find(({className}) => className === style)
    || ({className: style, properties: {}, variables: {}} as MSA)
  return createComponent(css)(msa, component)
}
