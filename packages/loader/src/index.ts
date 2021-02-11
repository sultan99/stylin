const fs = require(`fs`)

type MsaVariable = [string, string]
type MsaProperty = Record<string, string>

interface Msa {
  properties: Record<string, MsaProperty>
  variables: Record<string, MsaVariable>
}
interface ParserValue {
  (value: string): MsaProperty | boolean
}

const removeSpaces = (str: string = ``) : string => (
  str.replace(/\s\s+/g, ` `).trim()
)

const parseMappedValues: ParserValue = value => (
  typeof value === `string`
    && value.includes(`{`)
    && value
      .match(/(?![\s])([\w-]+)[\s:]+([\w-]+)/g)
      .map(str => str.split(`:`))
      .reduce((acc, [property, css]) => {
        acc[property] = css.trim()
        return acc
      }, {})
)

const parseMultipleValues: ParserValue = value => (
  typeof value === `string`
    && value.includes(`|`)
    && value
      .split(/\|/)
      .reduce((acc, next) => {
        const propValue = removeSpaces(next)
        acc[propValue] = propValue
        return acc
      }, {})
)

const parseTernaryValue: ParserValue = value => {
  if (typeof value !== `string`) {
    return false
  }
  const split = value.split(/\?|:/)
  if (!split || split.length !== 3) {
    return false
  }
  const [test, cssTrue, cssFalse] = split.map(removeSpaces)

  return {
    [test]: cssTrue,
    '@default': cssFalse,
  }
}

const parseConditionalValue : ParserValue = value => {
  if (typeof value !== `string`) {
    return false
  }
  const result = removeSpaces(value).split(/\s/)
  if (result.length !== 2) {
    return false
  }
  const [test, cssTrue] = result

  return {[test]: cssTrue}
}

interface ParseSingleValue {
  (value: string, className: string): MsaProperty | boolean
}

const parseSingleValue: ParseSingleValue = (value, className) => {
  if (typeof value !== `string`) return false

  const test = removeSpaces(value)
  if (!test) return false

  return {[test]: className}
}

interface ParseVariable {
  (value: string): MsaVariable | boolean
}

const parseVariable: ParseVariable = value => {
  if (typeof value !== `string` || !value.includes(`--`)) {
    return false
  }
  const reValue = /(--[\w-]+)\s(.+)/
  const [all, variable, defaultValue] = reValue.exec(value) || []

  return all ? [variable, removeSpaces(defaultValue)] : false
}

function extractVariables(text: string): Msa {
  let matches: string[] | null
  const msa: Msa = {properties: {}, variables: {}}

  const reVariable = /@(\w+)[:\s]+(['".()\-\w|\s#?:{}\\]+)/g
  while ((matches = reVariable.exec(text)) !== null) {
    const [, name, value] = matches
    const parsedVariable = parseVariable(value)

    if (typeof parsedVariable !== `boolean`) {
      msa.variables[name] = parsedVariable
      continue
    }
    const parsedValue = parseMappedValues(value)
      || parseMultipleValues(value)
      || parseTernaryValue(value)
      || parseConditionalValue(value)
      || parseSingleValue(value, name)

    if (typeof parsedValue === `object`) {
      msa.properties[name] = parsedValue
    }
  }

  return msa
}

function load(source: string): string {
  // eslint-disable-next-line no-sync
  const resource = fs.readFileSync(this.resource, `utf8`)
  let matches: string[]
  const msa = {}

  // extract text from the comment section & the next CSS class name
  const reComment = /\/\*+[\s]+?(.+?)[\s]+?\*+\/[\s]+?\.?([\w\-]+)/g
  while ((matches = reComment.exec(resource.replace(/\r\n|\r|\n/g, ` `))) !== null) {
    const [, varText, className] = matches
    msa[className] = {...msa[className], ...extractVariables(varText)}
  }

  const msaExport = `,\n        "@react-msa": ${JSON.stringify(msa, null, `        `)}\n`
  const position = source.indexOf(`\n};\nexport default ___CSS_LOADER_EXPORT___;`)

  return [
    source.slice(0, position),
    msaExport,
    source.slice(position)
  ].join(``)
}

module.exports = load
