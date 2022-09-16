export interface SyncConfig {
  host: string
  user: string
  password: string
  source: string
  destination: string
  settings?: Record<string, any>
  exclude?: string[]
  excludeGlob?: string[]
  include?: string[]
  includeGlob?: string[]
  parallel?: number
  dryRun: boolean
}

export type DeployConfig = SyncConfig
