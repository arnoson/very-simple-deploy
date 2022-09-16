import { DeployConfig } from './types'

export * from './deploy'
export * from './sync'

export const defineDeployConfig = (config: DeployConfig) => config
