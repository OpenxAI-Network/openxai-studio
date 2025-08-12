import { useMemo } from 'react'

function extractUserConfig({ config }: { config: string }) {
  return config
    .split('# START USER CONFIG')
    .at(1)
    ?.split('# END USER CONFIG')
    .at(0)
    ?.split('\n')
    .slice(1, -1)
    .join('\n')
}

export function useUserConfig({ config }: { config?: string }) {
  return useMemo(
    () => (config ? extractUserConfig({ config }) : undefined),
    [config]
  )
}

export function useKeepUserConfig({
  config,
  updatedConfig,
}: {
  config?: string
  updatedConfig?: string
}) {
  const userConfig = useMemo(() => {
    if (!config) {
      return undefined
    }

    return config
      .split('# START USER CONFIG')
      .at(1)
      ?.split('# END USER CONFIG')
      .at(0)
  }, [config])
  const updatedWithoutUserConfig = useMemo(() => {
    if (!updatedConfig) {
      return undefined
    }

    const startSplit = updatedConfig.split('# START USER CONFIG')
    const endSplit = startSplit.at(1)?.split('# END USER CONFIG')
    return {
      beforeUserConfig: startSplit[0],
      afterUserConfig: endSplit?.at(1),
    }
  }, [updatedConfig])

  return updatedWithoutUserConfig === undefined || userConfig === undefined
    ? undefined
    : `${updatedWithoutUserConfig.beforeUserConfig}# START USER CONFIG${userConfig}# END USER CONFIG${updatedWithoutUserConfig.afterUserConfig}`
}
