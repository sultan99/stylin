import {promises as fs} from 'fs'
import path from 'path'

const copyTemplates = async (srcDir, destDir, extension) => {
  try {
    await fs.mkdir(destDir, {recursive: true})
    const files = await fs.readdir(srcDir)
    const filteredFiles = files.filter(file => file.endsWith(extension))

    for (const file of filteredFiles) {
      const srcFile = path.join(srcDir, file)
      const destFile = path.join(destDir, file)
      await fs.copyFile(srcFile, destFile)
    }
  }
  catch (error) {
    console.error(`Error copying files:`, error)
  }
}

copyTemplates(`./src`, `./dist/esm`, `.hbs`)
copyTemplates(`./src`, `./dist/cjs`, `.hbs`)
