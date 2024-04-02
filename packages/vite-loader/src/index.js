import { readFileSync } from 'node:fs';
import { parseComments } from './parser.js';
import { createFilter } from '@rollup/pluginutils';
function stringify(o) {
    return JSON.stringify(o);
}
export const resultCache = new Map();
const filter = createFilter(/\.module\.s?css$/);
function compileCSS(options) {
    const { id, code } = options;
    const rawCSS = readFileSync(id, `utf-8`);
    const msa = parseComments(rawCSS);
    const exportReg = /export const (.*);/g;
    let result;
    const mapping = {};
    while ((result = exportReg.exec(code)) !== null) {
        const parse = /(.*) = \"(.*)\"/.exec(result[1]);
        if (parse) {
            const [, key, value] = parse;
            mapping[key] = value;
        }
    }
    return {
        mapping,
        msa
    };
}
export default function stylinLoader() {
    return {
        name: `vite-plugin-stylin`,
        enforce: `post`,
        transform(code, id) {
            if (filter(id)) {
                const { msa, mapping } = compileCSS({ id, code });
                resultCache.set(id, { msa });
                const transformedCode = `import {applyStyle as style, createComponent} from '@stylin/style';
${code.replace(/(export default [\S\s]*;)/, `
const styleComponent = createComponent(${stringify(mapping)});
${msa.map((value) => `export const ${value.componentName} = styleComponent(${stringify(value)})`)}
export const applyStyle = style(${stringify(mapping)})(${JSON.stringify(msa)});
$1`)}`;
                return {
                    code: transformedCode,
                    map: { mappings: `` }
                };
            }
        }
    };
}
//# sourceMappingURL=index.js.map