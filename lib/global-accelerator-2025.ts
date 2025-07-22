import { useMemo } from 'react'
import type { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useConfigContainerSet } from '@openmesh-network/xnode-manager-sdk-react'

export const globalaccelerator2025templates = [
  {
    name: 'dead-earth-project',
    subdir: 'demo-app-ENVIRO-TRACK',
  },
] as const

export function useDeployDemo() {
  const { mutateAsync: set } = useConfigContainerSet()

  return useMemo(
    () =>
      ({
        session,
        name,
        subdir,
      }: {
        session: xnode.utils.Session
        name: string
        subdir: string
      }) =>
        set({
          session,
          path: {
            container: 'xnode-ai-chat',
          },
          data: {
            update_inputs: null,
            settings: {
              network: 'containernet',
              flake: `{
  inputs = {
    xnode-manager.url = "github:Openmesh-Network/xnode-manager";
    ${name}.url = "github:OpenxAI-Network/global-accelerator-2025?dir=${subdir}";
    nixpkgs.follows = "${name}/nixpkgs";
  };

  nixConfig = {
    extra-substituters = [
      "https://openxai.cachix.org"
    ];
    extra-trusted-public-keys = [
      "openxai.cachix.org-1:3evd2khRVc/2NiGwVmypAF4VAklFmOpMuNs1K28bMQE="
    ];
  };

  outputs = inputs: {
    nixosConfigurations.container = inputs.nixpkgs.lib.nixosSystem {
      specialArgs = {
        inherit inputs;
      };
      modules = [
        inputs.xnode-manager.nixosModules.container
        {
          services.xnode-container.xnode-config = {
            host-platform = ./xnode-config/host-platform;
            state-version = ./xnode-config/state-version;
            hostname = ./xnode-config/hostname;
          };
        }
        inputs.${name}.nixosModules.default
        (
          { pkgs, ... }@args:
          {
            services.${name}.enable = true;
            services.${name}.port = 8080;

            networking.firewall.allowedTCPPorts = [
              8080
            ];
          }
        )
      ];
    };
  };
}`,
            },
          },
        }),
    [set]
  )
}
