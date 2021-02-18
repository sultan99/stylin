import * as R from 'ramda'

export type MsaVariable = [string, string, boolean]
export type MsaProperty = Record<string, string> | Record<`@isOptional`, boolean>
export interface MSABase {
  properties: Record<string, MsaProperty>
  variables: Record<string, MsaVariable>
}
export interface ParserParams {
  defValue?: string
  isOptional: boolean
  value: string
}
interface IsOptional {
  '@isOptional': boolean // eslint-disable-line
}
interface ParserValue {
  (value: ParserParams): MsaProperty | false
}
interface ParseVariable {
  (value: ParserParams): MsaVariable | false
}
interface ParseProperty {
  (value: ParserParams): MsaProperty | false
}

const removeSpaces = R.compose(
  R.trim,
  R.replace(/\s\s+/g, ` `)
)

// propertyName {
//   true: css-one
//   false: css-two
// }
const isMapped = R.both(
  R.is(String),
  R.includes(`{`),
)
const parseMapped = (initValue: IsOptional) => R.pipe(
  R.match(/(?![\s])([\w-]+)[\s:]+([\w-]+)/g),
  R.map(R.split(`:`)),
  R.reduce((acc, [property, css]) =>
    R.assoc(property, css.trim(), acc)
  , initValue),
)
const parseMappedValues: ParserValue = ({value, isOptional}) => (
  isMapped(value) &&
  parseMapped({'@isOptional': isOptional})(value)
)

// propertyName: css-one | css-two | css-three
const isMultiple = R.both(
  R.is(String),
  R.includes(`|`),
)
const parseMultiple = (initValue: IsOptional) => R.pipe(
  R.split(`|`),
  R.reduce((acc, next) => R.assoc(
    removeSpaces(next),
    removeSpaces(next),
    acc
  ), initValue),
)
const parseMultipleValues: ParserValue = ({value, isOptional}) => (
  isMultiple(value) &&
  parseMultiple({'@isOptional': isOptional})(value)
)

// propertyName: true ? css-one : css-two
const parseTernaryValue: ParserValue = ({value, isOptional}) => {
  if (typeof value !== `string`) return false
  const chunks = value.split(/\?|:/)
  if (!chunks || chunks.length !== 3) return false
  const [test, cssTrue, cssFalse] = chunks.map(removeSpaces)
  return {
    [test]: cssTrue,
    '@default': cssFalse,
    '@isOptional': isOptional
  }
}

// propertyName: true css-one
const parseConditionalValue : ParserValue = ({value, isOptional}) => {
  if (typeof value !== `string`) return false
  const result = removeSpaces(value).split(/\s/)
  if (result.length !== 2) return false
  const [test, cssTrue] = result
  return {[test]: cssTrue, '@isOptional': isOptional}
}

// propertyName: true
const parseSingleValue: ParserValue = ({defValue, isOptional, value}) => {
  if (typeof value !== `string`) return false
  const test = removeSpaces(value)
  if (!test) return false
  return {[test]: defValue, '@isOptional': isOptional}
}

// variableName: --css-variable def-value
const isVariable = R.both(
  R.is(String),
  R.includes(`--`),
)
export const parseVariable: ParseVariable = ({value, isOptional}) => {
  if (!isVariable(value)) return false
  const reValue = /(.+)\s+(--[\w-]+)/
  const [all, defaultValue, variable] = reValue.exec(value) || []
  return all ? [removeSpaces(defaultValue), variable, isOptional] : false
}

export const parseProperty: ParseProperty = value => (
  parseMappedValues(value) ||
  parseMultipleValues(value) ||
  parseTernaryValue(value) ||
  parseConditionalValue(value) ||
  parseSingleValue(value)
)
