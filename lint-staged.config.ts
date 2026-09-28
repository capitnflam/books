import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

// oxlint-disable-next-line depend/ban-dependencies
import type { Configuration } from 'lint-staged'

function getPackageNameFromPath(pkgPath: string): string {
  // oxlint-disable-next-line typescript/no-unsafe-assignment typescript/no-unsafe-call
  const packageJsonContent = readFileSync(`${pkgPath}/package.json`, 'utf-8')
  // oxlint-disable-next-line typescript/no-unsafe-assignment typescript/no-unsafe-argument
  const packageJson = JSON.parse(packageJsonContent)

  // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-member-access
  return packageJson.name ?? pkgPath.split('/').pop() ?? ''
}

function computeFilesByPackage(filenames: readonly string[]): [string, string[]][] {
  const filesByApp = filenames.reduce<Record<string, string[]>>((acc, filename) => {
    const match = filename.match(/(?:^|\/)((apps|packages)\/[^/]+)\/(.+)/u)
    if (!match) {
      return acc
    }
    const pkgPath = match[1]
    if (!acc[pkgPath]) {
      acc[pkgPath] = []
    }
    acc[pkgPath].push(filename)
    return acc
  }, {})

  const filesByPackage = Object.entries(filesByApp).map<[string, string[]]>(([pkgPath, files]) => {
    const packageName = getPackageNameFromPath(pkgPath)
    // oxlint-disable-next-line typescript/no-unsafe-return typescript/no-unsafe-call
    const relativeFiles = files.map<string>((file) => relative(pkgPath, file))
    return [packageName, relativeFiles]
  })

  return filesByPackage
}

const lintStagedConfig: Configuration = {
  '(apps|packages)/**/!(*.gen).{ts,tsx}': (filenames) => {
    const filesByPackage = computeFilesByPackage(filenames)
    return filesByPackage.flatMap(([packageName, relativeFiles]) => {
      return [
        `pnpm --filter=${packageName} run lint:fix -- ${relativeFiles.join(' ')}`,
        `pnpm --filter=${packageName} run type:check`,
        `pnpm --filter=${packageName} run format:fix -- ${relativeFiles.join(' ')}`,
      ]
    })
  },
  '(apps|packages)/**/*.{json,css,scss,html,yaml,yml,md}': (filenames) => {
    const filesByPackage = computeFilesByPackage(filenames)
    return filesByPackage.flatMap(([packageName, relativeFiles]) => {
      return [`pnpm --filter=${packageName} run format:fix -- ${relativeFiles.join(' ')}`]
    })
  },
}

export default lintStagedConfig
