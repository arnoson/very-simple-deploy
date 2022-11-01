import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline'
import pc from 'picocolors'

export const ask = (question: string): Promise<boolean> =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input, output })
    rl.question(question, (answer) => {
      rl.close()
      const hasAgreed = ['yes', 'y'].includes(answer.toLowerCase())
      resolve(hasAgreed)
    })
  })

export const logError = (error: string) => console.log(pc.red(error))

export const isGit = (dir: string) => existsSync(join(dir, '.git'))

export const getBranch = () =>
  new Promise((resolve, reject) =>
    exec('git branch --show-current', (error, stdout, stderr) => {
      if (error) return reject(error.message)
      if (stderr) return logError(stderr)
      resolve(stdout.trim())
    })
  )
