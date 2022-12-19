import { Config } from 'payload/config'
import { redisContext } from './adapters'
import { upsertCacheHook } from './hooks'
import { PluginOptions } from './types'
import { extendWebpackConfig } from './webpack'

export const cachePlugin =
  (pluginOptions: PluginOptions) =>
  (config: Config): Config => {
    const { redisUrl } = pluginOptions
    // Redis connection
    redisContext.init(redisUrl)

    // apply to all collections
    // TODO use an array of collections intead of using all of them
    const collections = config.collections?.map((collection) => {
      const { hooks } = collection

      const afterChange = [...(hooks?.afterChange || []), upsertCacheHook]

      return {
        ...collection,
        hooks: {
          ...hooks,
          afterChange
        }
      }
    })

    return {
      ...config,
      admin: {
        ...(config.admin || {}),
        webpack: extendWebpackConfig({ config })
      },
      collections
    }
  }
