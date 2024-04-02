export type MsaVariable = [string, string, boolean] // [default_value, css_var_name, is_optional]
export type MsaProperty = Record<string, string> | Record<`@isOptional`, boolean>
export interface MSABase {
  properties: Record<string, MsaProperty>
  variables: Record<string, MsaVariable> // { var_name: [def_val, css_name, is_optional], ... }
}
export interface ParserParams {
  defValue?: string
  isOptional: boolean
  value: string
}

export interface MSA extends MSABase {
  className: string
  componentName: string
  tagName: string
}
export interface SharedData {
  msa?: MSA[]
}

export type ResultCacheValue = { msa: MSA[] };
