import {ComponentClass, FunctionComponent, ReactNode} from 'react'
import {MSA} from '@stylin/msa-loader/index'

type CSS = Record<string, string>
type ReactComponent<P> = FunctionComponent<P> | ComponentClass<P>
type ReactProps = {
  className?: string
  children?: ReactNode
}

export type ApplyStyle = (
  <P>(css: CSS) => (msa: MSA[]) => (style: string, component: ReactComponent<P>) =>
  (props: P & ReactProps) => ReactNode
)

export type CreateComponent = (
  <P> (css: CSS) => (msa: MSA, component?: ReactComponent<P>) => (props: P & ReactProps) =>
  ReactNode
)
