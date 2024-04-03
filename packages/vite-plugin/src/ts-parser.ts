import type {MsaProperty, MsaVariable} from './types'
import * as R from 'ramda'

const isOptional = (value: MsaProperty | MsaVariable) => (
  (Array.isArray(value) && value[2]) || (!Array.isArray(value) && value[`@isOptional`]) ? `?` : ``
)

const isBoolean = R.ifElse(
  R.test(/^(true|false)$/),
  R.always(`boolean`),
  R.F
)

const isNumber = R.ifElse(
  R.test(/^\d+$/),
  R.always(`number`),
  R.F
)

const toLiteral = R.pipe(
  R.keys,
  R.reject(R.equals(`@isOptional`)),
  R.map((value: string) => `'${value}'`),
  R.join(` | `),
)

const extractName = R.pipe(
  R.keys,
  R.reject(R.equals(`@isOptional`)),
  R.head,
)

function definePropertyType(value: MsaProperty) {
  const varName = extractName(value) as string
  return (
    isBoolean(varName) ||
    isNumber(varName) ||
    toLiteral(value)
  )
}

const defineVariableType = R.pipe(
  R.head,
  (value: string) => isBoolean(value) || isNumber(value) || `string`,
)

const parseProperty = R.compose(
  R.when(R.isEmpty, R.always(``)),
  R.join(`\n`),
  R.map(([key, value]: [string, MsaProperty]) =>
    `${key}${isOptional(value)}: ${definePropertyType(value)}`
  ),
  R.toPairs
)

const parseVariable = R.compose(
  R.join(`\n`),
  R.map(([key, value]: [string, MsaVariable]) =>
    `${key}${isOptional(value)}: ${defineVariableType(value)}`
  ),
  R.toPairs,
)

export {parseProperty, parseVariable}
