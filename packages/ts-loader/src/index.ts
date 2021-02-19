import * as R from 'ramda'
import {SharedData} from '@stylin/msa-loader/index'
import {dirname, basename, join} from 'path'
import {getOptions} from 'loader-utils'
import {typeProperty, typeVariable} from './parser'
import {writeFile} from 'fs'

const defOptions = {
  propType: (name: string) => `${name}Props`
}

const filename = (path: string): string => {
  const dirName = dirname(path)
  const baseName = basename(path)
  return join(dirName, `${baseName}.d.ts`)
}

const createInterface = ({compName, tagName, type, typedProperty, typedVariable}) => `
  export interface ${type} extends ComponentProps<'${tagName}'> {
    ${typedProperty}
    ${typedVariable}
  }
  export const ${compName}: FC<${type}>
`

function loader(content: string, sourceMap: string, meta: SharedData) {
  const onComplete = this.async()
  const {propType} = R.merge(defOptions, getOptions(this))
  const exports = meta.msa.map(({tagName, compName, properties, variables}) => {
    const type = propType(compName, this.resource)
    const typedProperty = typeProperty(properties)
    const typedVariable = typeVariable(variables)
    return (typedProperty || typedVariable)
      ? createInterface({compName, tagName, type, typedProperty, typedVariable})
      : `export const ${compName}: FC<ComponentProps<'${tagName}'>>`
  })
  const result = `
    import {FC, ComponentProps} from 'react'
    ${exports.join(`\n`)}`
    .replace(/^\s+/gm, ``)
    .replace(/^\w+/gm, group =>
      [`import`, `export`].includes(group) ? group : `  ${group}`
    )

  writeFile(filename(this.resource), result, error => {
    error && this.emitWarning(error)
  })
  onComplete(null, content, sourceMap, meta)
}

export default loader
