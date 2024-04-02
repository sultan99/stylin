import fs from 'node:fs'
import path from 'node:path'

const cjsOutDir = path.join(import.meta.dirname, `../dist/cjs`)
function createCJSModulePackageJson() {
  fs.writeFileSync(path.join(cjsOutDir, `package.json`), `{ "type": "commonjs" }`, `utf-8`)
}

createCJSModulePackageJson()
