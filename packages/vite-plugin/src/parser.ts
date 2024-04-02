import * as R from 'ramda'
import type {MSA, MSABase, MsaProperty, MsaVariable, ParserParams} from './types'

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

const isMapped = R.both(
  R.is(String),
  R.includes(`{`),
)

const parseMapped = (initValue: MsaProperty) => R.pipe(
  R.match(/(?![\s])([\w-]+)[\s:]+([\w-]+)/g),
  R.map(value => {
    const [a, b] = value?.split(`:`)
    return [a, b] as [string, string]
  }),
  R.reduce((acc, [property, css]) =>
    R.assoc(property, css.trim(), acc)
  , initValue),
)
const parseMappedValues: ParserValue = ({value, isOptional}) => (
  isMapped(value) &&
  parseMapped({'@isOptional': isOptional})(value)
)

const isMultiple = R.both(
  R.is(String),
  R.includes(`|`),
)
const parseMultiple = (initValue: MsaProperty) => R.pipe(
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

const parseConditionalValue : ParserValue = ({value, isOptional}) => {
  if (typeof value !== `string`) return false
  const result = removeSpaces(value).split(/\s/)
  if (result.length !== 2) return false
  const [test, cssTrue] = result
  return {[test]: cssTrue, '@isOptional': isOptional}
}

const parseSingleValue: ParserValue = ({defValue, isOptional, value}) => {
  if (typeof value !== `string`) return false
  const test = removeSpaces(value)
  if (!test) return false
  return {[test]: defValue, '@isOptional': isOptional}
}

const isVariable = R.both(
  R.is(String),
  R.includes(`--`),
)
const parseVariable: ParseVariable = ({value, isOptional}) => {
  if (!isVariable(value)) return false
  const reValue = /(.+)\s+(--[\w-]+)/
  const [all, defaultValue, variable] = reValue.exec(value) || []
  return all ? [removeSpaces(defaultValue), variable, isOptional] : false
}

const parseProperty: ParseProperty = value => (
  parseMappedValues(value) ||
  parseMultipleValues(value) ||
  parseTernaryValue(value) ||
  parseConditionalValue(value) ||
  parseSingleValue(value)
)

function extract(name: string, text: string): string {
  const re = new RegExp(`@${name}[:\\s]+(.+)[\n|\r]+`)
  const [, value = ``] = text.match(re) || []
  return value.trim()
}

const toCamelCase = R.replace(/(^\w|[-_][a-z])/g,
  R.pipe(
    R.toUpper,
    R.replace(`-`, ``),
    R.replace(`_`, ``),
  )
)

const pickRawValues = R.applySpec<ParserParams>({
  defValue: R.nth(1),
  isOptional: R.pipe(R.nth(2), R.ifElse(R.is(String), R.equals(`?`), R.always(false))),
  value: R.nth(3),
})

function parseComment(text: string): MSABase {
  const reVariable = /(\w+)(\??)[:\s]+([\w|\s{}-][^\n\r}]+)/g
  const match = (re: RegExp): MSABase => {
    const matches = re.exec(text)
    const result: MSABase = {properties: {}, variables: {}}
    if (!matches) return result
    const raw = pickRawValues(matches)
    const parsedVariable = parseVariable(raw)
    if (parsedVariable) {
      return R.over(
        // @ts-ignore
        R.lensProp(`variables`),
        // @ts-ignore
        R.assoc(raw.defValue, parsedVariable),
        match(re)
      )
    }
    const parsedProperty = parseProperty(raw)
    if (parsedProperty) {
      return R.over(
        // @ts-ignore
        R.lensProp(`properties`),
        // @ts-ignore
        R.assoc(raw.defValue, parsedProperty),
        match(re)
      )
    }
    return result
  }
  return match(reVariable)
}

const parseCommentOnly = R.pipe(
  R.replace(/@.+/g, ``),
  R.when(
    R.includes(`{`),
    R.replace(/{(.*|\n)*}/g, R.replace(/\n/g, ``)),
  ),
  R.trim,
  parseComment,
)

function parseComments(text: string): MSA[] {
  const reComment = /\/\*+((\r|\n|.[^*])+)\*+\/[\n\r]+\.([\w-]+)/gm
  const match: (re: RegExp) => MSA[] = (re: RegExp) => {
    const matches = re.exec(text)
    if (!matches) return []
    const [, comment, , className] = matches
    const pack = R.append({
      className,
      componentName: extract(`component`, comment) || toCamelCase(className),
      tagName: extract(`tag`, comment),
      ...parseCommentOnly(comment),
    })
    return pack(match(re))
  }
  return match(reComment)
}

export {parseComments}
