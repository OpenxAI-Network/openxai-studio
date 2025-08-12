import { useMemo } from 'react'
import { xnode } from '@openmesh-network/xnode-manager-sdk'
import { useConfigContainerSet } from '@openmesh-network/xnode-manager-sdk-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const demo_url = 'https://demo.core.openxai.org'

export interface DemoXnode {
  id: string
  reservation?: {
    reversed_by: string
    reserved_until: number
  }
}

export function useDemosAvailable() {
  return useQuery({
    queryKey: ['demo-xnode', 'demo-available'],
    queryFn: async () => {
      return await axios
        .get(`${demo_url}/demo/xnodes`)
        .then((res) => res.data as DemoXnode[])
    },
  })
}

export async function reserveDemo({ xnode_id }: { xnode_id: string }) {
  return await axios
    .post(`${demo_url}/demo/reserve`, { xnode_id })
    .then((res) => res.data as DemoXnode)
}

export function demoSession({ xnode_id }: { xnode_id: string }) {
  return {
    baseUrl: `https://${xnode_id}`,
    axiosInstance: axios.create(),
  } satisfies xnode.utils.Session
}

export function useDemoSession({ xnode_id }: { xnode_id?: string }) {
  return useMemo(() => {
    if (!xnode_id) {
      return undefined
    }

    return demoSession({ xnode_id })
  }, [xnode_id])
}

export function useDeployModel() {
  const { mutateAsync: set } = useConfigContainerSet()

  return useMemo(
    () =>
      ({ session, model }: { session: xnode.utils.Session; model: string }) =>
        set({
          session,
          path: {
            container: 'xnode-ai-chat',
          },
          data: {
            update_inputs: null,
            settings: {
              network: 'containernet',
              flake: getFlake({ model, gpu: false }),
              nvidia_gpus: null,
            },
          },
        }),
    [set]
  )
}

export function getFlake({ model, gpu }: { model: string; gpu: boolean }) {
  return `{
  inputs = {
    xnode-manager.url = "github:Openmesh-Network/xnode-manager";
    xnode-ai-chat.url = "github:OpenxAI-Network/xnode-ai-chat";
    nixpkgs.follows = "xnode-ai-chat/nixpkgs";
  };

  nixConfig = {
    extra-substituters = [
      "https://openxai.cachix.org"
      "https://nix-community.cachix.org"
      "https://cuda-maintainers.cachix.org"
    ];
    extra-trusted-public-keys = [
      "openxai.cachix.org-1:3evd2khRVc/2NiGwVmypAF4VAklFmOpMuNs1K28bMQE="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
      "cuda-maintainers.cachix.org-1:0dq3bujKpuEPMCX6U4WylrUDZ9JyUG0VpVZa7CNfq5E="
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
        inputs.xnode-ai-chat.nixosModules.default
        (
          { pkgs, ... }@args:
          {
            # START USER CONFIG
            services.xnode-ai-chat.defaultModel = "${model}";
            # END USER CONFIG

            services.xnode-ai-chat.enable = true;

            ${
              gpu
                ? `services.ollama.acceleration = "cuda";
            hardware.graphics = {
              enable = true;
              extraPackages = [
                pkgs.nvidia-vaapi-driver
              ];
            };
            hardware.nvidia.open = true;
            services.xserver.videoDrivers = [ "nvidia" ];`
                : ''
            }

            networking.firewall.allowedTCPPorts = [
              8080
            ];
          }
        )
      ];
    };
  };
}`
}

export function toXnodeAddress({ address }: { address: string }): string {
  return `eth:${address.replace('0x', '').toLowerCase()}`
}
