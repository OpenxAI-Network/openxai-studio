import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const demo_url = 'https://demo.openxai.org'

export interface PublicDemoXnode {
  id: string
  reserved_until?: number
}

export interface ReservedDemoXnode {
  id: string
  reservation: {
    secret: string
    reserved_until: number
  }
}

export function useDemosAvailable() {
  return useQuery({
    queryKey: ['demo-xnode', 'demo-available'],
    queryFn: async () => {
      return await axios
        .get(`${demo_url}/demo/xnodes`)
        .then((res) => res.data as PublicDemoXnode[])
    },
  })
}

export function useDemoCPUUsage({
  xnode_id,
  secret,
}: {
  xnode_id: string
  secret: string
}) {
  return useQuery({
    queryKey: ['demo-xnode', 'demo-cpu-usage', xnode_id],
    refetchInterval: 1000, // 1 sec
    queryFn: async () => {
      return await axios
        .post(`${demo_url}/demo/forward_request`, {
          secret,
          request: {
            xnode_id,
            request_type: {
              Get: {
                path: 'usage/cpu',
              },
            },
          },
        })
        .then(
          (res) =>
            res.data as {
              name: string
              used: number
              frequency: number
            }[]
        )
    },
  })
}

export function useDemoMemoryUsage({
  xnode_id,
  secret,
}: {
  xnode_id: string
  secret: string
}) {
  return useQuery({
    queryKey: ['demo-xnode', 'demo-memory-usage', xnode_id],
    refetchInterval: 1000, // 1 sec
    queryFn: async () => {
      return await axios
        .post(`${demo_url}/demo/forward_request`, {
          secret,
          request: {
            xnode_id,
            request_type: {
              Get: {
                path: 'usage/memory',
              },
            },
          },
        })
        .then(
          (res) =>
            res.data as {
              used: number
              total: number
            }
        )
    },
  })
}

export function useDemoDiskUsage({
  xnode_id,
  secret,
}: {
  xnode_id: string
  secret: string
}) {
  return useQuery({
    queryKey: ['demo-xnode', 'demo-disk-usage', xnode_id],
    refetchInterval: 10 * 1000, // 10 sec
    queryFn: async () => {
      return await axios
        .post(`${demo_url}/demo/forward_request`, {
          secret,
          request: {
            xnode_id,
            request_type: {
              Get: {
                path: 'usage/disk',
              },
            },
          },
        })
        .then(
          (res) =>
            res.data as {
              name: string
              used: number
              total: number
            }[]
        )
    },
  })
}

export async function reserveDemo({ xnode_id }: { xnode_id: string }) {
  return await axios
    .post(`${demo_url}/demo/reserve`, { xnode_id })
    .then((res) => res.data as ReservedDemoXnode)
}

export async function deployModel({
  xnode_id,
  secret,
  model,
  email,
  password,
}: {
  xnode_id: string
  secret: string
  model: string
  email: string
  password: string
}) {
  return await axios.post(`${demo_url}/demo/set_app`, {
    xnode_id,
    secret,
    flake: `
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-stable.url = "github:NixOS/nixpkgs/nixos-24.11";
    xnode-ai-chat = {
      url = "github:OpenxAI-Network/xnode-ai-chat";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.nixpkgs-stable.follows = "nixpkgs-stable";
    };
  };

  outputs =
    {
      self,
      nixpkgs-stable,
      xnode-ai-chat,
      ...
    }:
    let
      system = "x86_64-linux";
    in
    {
      nixosConfigurations.container = nixpkgs-stable.lib.nixosSystem {
        inherit system;
        specialArgs = {
          inherit xnode-ai-chat;
        };
        modules = [
          (
            { xnode-ai-chat, ... }:
            {
              imports = [
                xnode-ai-chat.nixosModules.default
              ];

              boot.isContainer = true;

              services.xnode-ai-chat = {
                enable = true;
                defaultModel = "${model}";
                admin = {
                  name = "Xnode";
                  email = "${email}";
                  password = "${password}";
                };
              };

              networking = {
                firewall.allowedTCPPorts = [ 8080 ];
              };

              system.stateVersion = "24.11";
            }
          )
        ];
      };
    };
}
    `,
  })
}
