import * as R from 'ramda'
import {MsaProperty, MsaVariable} from '@stylin/msa-loader/parser'

const isOptional = (value: MsaProperty | MsaVariable) => (
  value[`@isOptional`] || value[2] ? `?` : ``
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

const toLiteral = R.pipe<MsaProperty[], string[], string[], string[], string>(
  R.keys,
  R.reject(R.equals(`@isOptional`)),
  R.map((value: string) => `'${value}'`),
  R.join(` | `),
)

const extractName = R.pipe<MsaProperty[], string[], string[], string>(
  R.keys,
  R.reject(R.equals(`@isOptional`)),
  R.head,
)

function definePropertyType(value: MsaProperty) {
  const varName = extractName(value)
  return (
    isBoolean(varName) ||
    isNumber(varName) ||
    toLiteral(value)
  )
}

const defineVariableType = R.pipe(
  R.head,
  value => isBoolean(value) || isNumber(value) || `string`,
)

export const parseProperty = R.compose(
  R.when(R.isEmpty, R.always(``)),
  R.join(`\n`),
  R.map(([key, value]: [string, MsaProperty]) =>
    `${key}${isOptional(value)}: ${definePropertyType(value)}`
  ),
  R.toPairs
)

export const parseVariable = R.compose(
  R.join(`\n`),
  R.map(([key, value]: [string, MsaVariable]) =>
    `${key}${isOptional(value)}: ${defineVariableType(value)}`
  ),
  R.toPairs,
)
