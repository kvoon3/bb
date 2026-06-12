#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(import.meta.url), '../..')
const readmePath = resolve(projectRoot, 'README.md')
const helpCommand = 'bb -h'

async function runHelp(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'tsx', 'packages/cli/src/index.ts', '-h'], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString('utf-8')
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8')
    })

    child.on('error', reject)

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command "${helpCommand}" exited with code ${code}: ${stderr}`))
        return
      }

      const help = stdout
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trimEnd()

      resolve(help)
    })
  })
}

async function updateDocs() {
  const readme = await readFile(readmePath, 'utf-8')
  const markerStart = '<!-- cli-help-start -->'
  const markerEnd = '<!-- cli-help-end -->'
  const pattern = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`)

  if (!pattern.test(readme)) {
    throw new Error(`Could not find ${markerStart} ... ${markerEnd} markers in README.md`)
  }

  const help = await runHelp()
  const replacement = `${markerStart}\n\n\`\`\`bash\n$ ${helpCommand}\n${help}\n\`\`\`\n\n${markerEnd}`
  const updated = readme.replace(pattern, replacement)

  await writeFile(readmePath, updated, 'utf-8')
  console.log(`Updated CLI help in ${readmePath}`)
}

updateDocs().catch((error) => {
  console.error(error)
  process.exit(1)
})
