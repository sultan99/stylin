import React, {ComponentClass, FunctionComponent, ReactNode} from 'react'
import {MSA} from '@stylin/msa-loader/index'

type CSS = Record<string, string>
type ReactComponent<P> = FunctionComponent<P> | ComponentClass<P>
type ReactProps = {
  className?: string
  children?: ReactNode[]
}

type ApplyStyle = (
  <P>(css: CSS) => (msa: MSA[]) => (style: string, component: ReactComponent<P>) =>
  (props: P & ReactProps) => ReturnType<typeof React.createElement>
)

type CreateComponent = (
  <P> (css: CSS) => (msa: MSA, component?: ReactComponent<P>) => (props: P & ReactProps) =>
  ReturnType<typeof React.createElement>
)

export const createComponent: CreateComponent =
  css => (msa, component) => ({className: firstClassName = ``, ...props}) => {
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
      }, {className, style: {}}) as any

    return React.createElement(component || tagName, finalProps)
  }

export const url = (value: string) => `url(${value})`

export const applyStyle: ApplyStyle = css => msaList => (style, component) => {
  const msa = msaList.find(({className}) => className === style)
    || ({className: style, properties: {}, variables: {}} as MSA)
  return createComponent(css)(msa, component)
}
