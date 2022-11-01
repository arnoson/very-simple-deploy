import { spawn } from 'node:child_process'
import * as os from 'node:os'
import pc from 'picocolors'
import { SyncConfig } from './types'

const logData = (data: string) =>
  data.split('\n').forEach((line) => {
    let match: RegExpMatchArray | undefined
    if ((match = line.match(/Transferring file `(.*)'/)))
      console.log(pc.blue('→ ' + match[1]))
    else if ((match = line.match(/Removing old (?:file|directory) `(.*)'/)))
      console.log(pc.red('⨯ ' + match[1]))
  })

export const sync = ({
  host,
  user,
  password,
  source,
  destination,
  settings = { 'ssl:verify-certificate': false, 'ftp:ssl-force': true },
  exclude = [],
  excludeGlob = [],
  include = [],
  includeGlob = [],
  parallel = 10,
  dryRun,
}: SyncConfig) => {
  const setSettings = Object.entries(settings).map(([k, v]) => `set ${k} ${v}`)

  const flags = [
    '--reverse',
    '--continue',
    '--only-newer',
    '--overwrite',
    '--use-cache',
    '--delete',
    `--parallel=${parallel}`,
    '--verbose',
    dryRun && '--dry-run',
    ...exclude.map((path) => `--exclude ${path}`),
    ...excludeGlob.map((path) => `--exclude-glob ${path}`),
    ...include.map((path) => `--include ${path}`),
    ...includeGlob.map((path) => `--include-glob ${path}`),
  ].filter(Boolean)

  const mirror = `mirror ${flags.join(' ')} ${source} ${destination}`

  const commands = [
    ...setSettings,
    `open ${host}`,
    `user ${user} ${password}`,
    mirror,
    'bye',
  ].join('; ')

  const isWindows = os.platform() === 'win32'
  const child = isWindows
    ? spawn('wsl', ['lftp', '-c', commands])
    : spawn('lftp', ['-c', commands])

  return new Promise<void>((resolve, reject) => {
    child.stdout.on('data', (data) => logData(data.toString()))
    child.stderr.on('data', (data) => reject(new Error(data.toString())))
    child.on('exit', resolve)
  })
}
