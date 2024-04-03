import {type Plugin} from 'vite'
import {readFileSync} from 'node:fs'
import {extractClassNames, parseComments} from './parser.js'
import {createFilter} from '@rollup/pluginutils'
import type {MSA} from './types'

function stringify(o: Object) {
  return JSON.stringify(o)
}

type ResultCacheValue = { msa: MSA[] };
export const resultCache = new Map<string, ResultCacheValue>()

const filter = createFilter(/\.module\.s?css$/)

function compileCSS(options: { id: string; code: string }) {
  const {id, code} = options
  const rawCSS = readFileSync(id, `utf-8`)
  const msa = parseComments(rawCSS)

  const mapping = extractClassNames(code)

  return {
    mapping,
    msa
  }
}

export default function stylinLoader(): Plugin {
  return {
    name: `vite-plugin-stylin`,
    enforce: `post`,

    transform(code, id) {
      if (filter(id)) {
        const {msa, mapping} = compileCSS({id, code})
        resultCache.set(id, {msa})

        const transformedCode = `import {applyStyle as style, createComponent} from '@stylin/style'
${code.replace(/(export default [\S\s]*;)/, `
const styleComponent = createComponent(${stringify(mapping)})
${msa
    .map((value) => `export const ${value.componentName} = styleComponent(${stringify(value)})`)
    .join(`\n`)
}
export const applyStyle = style(${stringify(mapping)})(${JSON.stringify(msa)})
$1`)}`

        return {
          code: transformedCode,
          map: {mappings: ``}
        }
      }
    }
  }
}
