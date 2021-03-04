import * as R from 'ramda'
import * as Handlebars from 'handlebars'
import {SharedData} from '@stylin/msa-loader/index'
import {dirname, basename, join} from 'path'
import {getOptions} from 'loader-utils'
import {parseProperty, parseVariable} from './parser'
import {readFileSync, writeFile} from 'fs'

const template = readFileSync(join(__dirname, `template.hbs`), `utf8`)
const toDTS = Handlebars.compile(template, {noEscape: true})

const makeOptions = R.merge({
  propsType: (name: string) => `${name}Props`,
  styledPropsType: (name: string) => `Styled${name}Props`,
})

const nameFile = (path: string): string => {
  const dirName = dirname(path)
  const baseName = basename(path)
  return join(dirName, `${baseName}.d.ts`)
}

function loader(content: string, sourceMap: string, meta: SharedData) {
  const onComplete = this.async()
  const {propsType, styledPropsType} = makeOptions(getOptions(this))
  const exports = meta.msa.map(({componentName, className, properties, tagName, variables}) => {
    const parsedProperties = parseProperty(properties)
    const parsedVariables = parseVariable(variables)
    return {
      className,
      componentName,
      isExtended: tagName && (parsedProperties || parsedVariables) && true,
      isStyled: !tagName,
      properties: parsedProperties,
      propsType: propsType(componentName, this.resource),
      styledPropsType: styledPropsType(componentName),
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
