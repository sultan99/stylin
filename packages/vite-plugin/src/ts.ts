import type {Plugin} from "vite"
import Handlebars from "handlebars"
import {createFilter} from '@rollup/pluginutils'
import {dirname, basename, join} from 'node:path'
import {parseProperty, parseVariable} from "./ts-parser.js"
import {resultCache} from "./index.js"
import {writeFile, readFileSync} from 'node:fs'

/** @ts-ignore support both CommonJS and ESM */
const currentDirname = typeof __dirname !== `undefined` ? __dirname : import.meta.dirname

const template = readFileSync(join(currentDirname, `template.hbs`), `utf8`)
const toDTS = Handlebars.compile(template, {noEscape: true})

const filter = createFilter(/\.module\.s?css$/)
const shouldTransform = (id: string) => filter(id) && resultCache.has(id)

const nameFile = (path: string): string => {
  const dirName = dirname(path)
  const baseName = basename(path)
  return join(dirName, `${baseName}.d.ts`)
}

function generateDeclarationFile(options: { id: string; onError?: (error: Error) => void }) {
  const {id, onError} = options
  const {msa} = resultCache.get(id)
  const exports = msa.map(({componentName, className, properties, tagName, variables}) => {
    const parsedProperties = parseProperty(properties)
    const parsedVariables = parseVariable(variables)
    return {
      className,
      componentName,
      isExtended: tagName && (parsedProperties || parsedVariables) && true,
      properties: parsedProperties,
      propsType: `${componentName}Props`,
      styledPropsType: `Styled${componentName}Props`,
      tagName,
      variables: parsedVariables,
    }
  })

  writeFile(
    nameFile(id),
    toDTS({exports}),
    error => error && onError && onError(error)
  )
}

export default function tsLoader(): Plugin {
  return {
    name: `vite-ts-stylin`,
    enforce: 'post',

    transform(code, id) {
      if (shouldTransform(id)) {
        generateDeclarationFile({id, onError: this.error})
      }
    },

    handleHotUpdate(ctx) {
      const id = ctx.file
      if (shouldTransform(id)) {
        generateDeclarationFile({id, onError: console.error})
      }
    },
  }
}
