import * as R from 'ramda'
import {MSABase, ParserParams, parseProperty, parseVariable} from './parser'
import {readFile} from 'fs'

export interface MSA extends MSABase {
  className: string
  compName: string
  tagName: string
}
export interface SharedData {
  msa?: MSA[]
}

const pickRawValues = R.applySpec<ParserParams>({
  defValue: R.nth(1),
  isOptional: R.pipe(R.nth(2), R.equals(`?`)),
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
        R.lensProp(`variables`),
        R.assoc(raw.defValue, parsedVariable),
        match(re)
      )
    }
    const parsedProperty = parseProperty(raw)
    if (parsedProperty) {
      return R.over(
        R.lensProp(`properties`),
        R.assoc(raw.defValue, parsedProperty),
        match(re)
      )
    }
    return result
  }
  return match(reVariable)
}

function extract(name: string, text: string): string {
  const re = new RegExp(`@${name}[:\\s]+(\\w+)`)
  const [, value] = text.match(re) || []
  return value
}

const defineComponents = R.compose(
  R.join(`\n`),
  R.map(({compName, ...msa}) =>
    `export const ${compName} = styled(${JSON.stringify(msa)});`
  ),
)

function loader(content: string, sourceMap, meta: SharedData = {}) {
  meta.msa = this.data.msa
  this.addDependency(this.resource)
  const onComplete = this.async()
  const exports = defineComponents(this.data.msa)
  const result = `\
    import {createComponent} from "@stylin/style";
    ${content}
    const styled = createComponent(content.locals);
    ${exports}
  `
  onComplete(null, result, sourceMap, meta)
}

const parseCommentOnly = R.pipe(
  R.replace(/@\w+[:\s]+(\w+)/g, ``),
  R.when(
    R.includes(`{`),
    R.replace(/\{\s*(\n|\r|.)+?\}/gm, R.replace(/\n|\r/g, ``))
  ),
  parseComment,
)

function parseComments(text: string): MSA[] {
  const reComment = /\/\*+((\r|\n|.[^*])+)\*+\/[\n\r]+\.([\w-]+)/gm
  const match = (re: RegExp) => {
    const matches = re.exec(text)
    if (!matches) return []
    const [, comment, , className] = matches
    const pack = R.append({
      className,
      compName: extract(`component`, comment),
      tagName: extract(`tag`, comment) || `div`,
      ...parseCommentOnly(comment),
    })
    return pack(match(re))
  }
  return match(reComment)
}

export function pitch(skip: any, me: any, sharedData: SharedData) {
  const onComplete = this.async()
  readFile(this.resource, `utf8`, (error, data) => {
    sharedData.msa = parseComments(data)
    onComplete(error)
  })
}

export default loader
