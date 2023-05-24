import { loadConfig } from 'c12'
import pc from 'picocolors'
import { sync } from './sync'
import { DeployConfig } from './types'
import { ask, getBranch, isGit, logError } from './utils'

export const deploy = async () => {
  const { config } = await loadConfig<DeployConfig>({
    name: 'deploy',
    dotenv: true,
  })

  if (!config.host) throw new Error(`No ftp host defined`)
  if (!config.user) throw new Error(`No ftp user defined`)
  if (!config.password) throw new Error(`No ftp password defined`)
  if (!config.source) throw new Error(`No source defined`)
  if (!config.destination) throw new Error(`No destination defined`)

  try {
    const branch = isGit(process.cwd()) && (await getBranch())
    const sourceInfo = `${config.source} ${branch ? `(${branch})` : ''}`

    const path = config.destination.startsWith('./')
      ? config.destination.substring(1)
      : config.destination

    const url = `${config.host}${path}`
    console.log(`Deploy ${pc.magenta(sourceInfo)} to ${pc.magenta(url)}\n`)
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
