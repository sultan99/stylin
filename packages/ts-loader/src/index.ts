import * as R from 'ramda'
import * as Handlebars from 'handlebars'
import {SharedData} from '@stylin/msa-loader/index'
import {dirname, basename, join} from 'path'
import {getOptions} from 'loader-utils'
import {parseProperty, parseVariable} from './parser'
import {readFileSync, writeFile} from 'fs'

const template = readFileSync(join(__dirname, `template.hbs`), `utf8`)
const toDTS = Handlebars.compile(template, {noEscape: true})

const defOptions = {
  propsType: (name: string) => `${name}Props`,
  styledPropsType: (name: string) => `Styled${name}Props`,
}

const nameFile = (path: string): string => {
  const dirName = dirname(path)
  const baseName = basename(path)
  return join(dirName, `${baseName}.d.ts`)
}

const toCamelCase = R.pipe(
  R.toLower,
  R.replace(/(^\w|[-_][a-z])/g,
    R.pipe(
      R.toUpper,
      R.replace(`-`, ``),
      R.replace(`_`, ``),
    )
  )
)

function loader(content: string, sourceMap: string, meta: SharedData) {
  const onComplete = this.async()
  const {propsType, styledPropsType} = R.merge(defOptions, getOptions(this))
  const exports = meta.msa.map(({componentName, className, properties, tagName, variables}) => {
    const parsedProperties = parseProperty(properties)
    const parsedVariables = parseVariable(variables)
    return {
      className,
      componentName,
      isExtended: tagName && !!(parsedVariables || parsedVariables),
      isStyled: !tagName,
      properties: parsedProperties,
      propsType: propsType(componentName, this.resource),
      styledPropsType: styledPropsType(componentName || toCamelCase(className)),
      tagName,
      variables: parsedVariables,
    }
  })
  const isRestyled = exports.some(({isStyled}) => isStyled)

  writeFile(
    nameFile(this.resource),
    toDTS({isRestyled, exports}),
    error => error && this.emitWarning(error),
  )

  onComplete(null, content, sourceMap, meta)
}

export default loader
