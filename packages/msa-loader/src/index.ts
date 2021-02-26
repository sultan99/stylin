import * as R from 'ramda'
import * as Handlebars from 'handlebars'
import {MSABase, ParserParams, parseProperty, parseVariable} from './parser'
import {join} from 'path'
import {readFile, readFileSync} from 'fs'

export interface MSA extends MSABase {
  className: string
  componentName: string
  tagName: string
}
export interface SharedData {
  msa?: MSA[]
}

Handlebars.registerHelper(`json`, JSON.stringify)

const template = readFileSync(join(__dirname, `template.hbs`), `utf8`)
const toDTS = Handlebars.compile(template, {noEscape: true})

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

const pickLocals = R.pipe(
  R.match(/export default (.+);/),
  R.nth(1)
)

const parseCommentOnly = R.pipe(
  R.replace(/@.+/g, ``),
  R.when(
    R.includes(`{`),
    R.replace(/\n|\r/g, ` `)
  ),
  parseComment,
)

function extract(name: string, text: string): string {
  const re = new RegExp(`@${name}[:\\s]+(.+)[\n|\r]+`)
  const [, value = ``] = text.match(re) || []
  return value.trim()
}

function parseComments(text: string): MSA[] {
  const reComment = /\/\*+((\r|\n|.[^*])+)\*+\/[\n\r]+\.([\w-]+)/gm
  const match = (re: RegExp) => {
    const matches = re.exec(text)
    if (!matches) return []
    const [, comment, , className] = matches
    const pack = R.append({
      className,
      componentName: extract(`component`, comment),
      tagName: extract(`tag`, comment),
      ...parseCommentOnly(comment),
    })
    return pack(match(re))
  }
  return match(reComment)
}

function loader(content: string, sourceMap, meta: SharedData = {}) {
  meta.msa = this.data.msa
  this.addDependency(this.resource)
  const onComplete = this.async()
  const dts = toDTS({
    content,
    isStyleLoader: content.includes(`import content`),
    locals: pickLocals(content),
    msa: meta.msa,
  })
  onComplete(null, dts, sourceMap, meta)
}

export function pitch(skip: any, me: any, sharedData: SharedData) {
  const onComplete = this.async()
  readFile(this.resource, `utf8`, (error, data) => {
    sharedData.msa = parseComments(data)
    onComplete(error)
  })
}

export default loader
