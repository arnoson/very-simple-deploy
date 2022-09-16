import { loadEsmConfig } from 'load-esm-config'
import { join } from 'node:path'
import * as pc from 'picocolors'
import { sync } from './sync'
import { DeployConfig } from './types'
import { ask, getBranch, isGit, logError } from './utils'

export const deploy = async () => {
  const result = await loadEsmConfig<DeployConfig>({ name: 'deploy' })
  const { config } = result ?? {}
  if (!config) return logError('No deploy config found.')

  try {
    const branchInfo = isGit(process.cwd()) ? ` (${await getBranch()})` : ''
    const path = join(config.host, config.destination)
    console.log(
      `Deploy ${pc.magenta(config.source + branchInfo)} to ${pc.magenta(
        path
      )}\n`
    )
  } catch (e) {
    return logError(e)
  }

  if (config.dryRun) {
    console.log('Review outgoing changes:')
    try {
      await sync(config)
    } catch (e) {
      return logError(e)
    }

    const proceed = await ask(`\nOK? ${pc.yellow('(y/n)')} `)
    if (!proceed) return
    console.log() // Add line break.
  } else {
    console.log('Changes:')
  }

  try {
    await sync({ ...config, dryRun: false })
  } catch (e) {
    logError(e)
  }
}
