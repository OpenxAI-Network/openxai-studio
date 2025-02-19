import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const demo_url = 'https://demo.openxai.org'

export interface DemoXnode {
  id: string
  reservation?: {
    reserved_by: string
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

export async function deployModel({
  xnode_id,
  model,
  email,
  password,
}: {
  xnode_id: string
  model: string
  email: string
  password: string
}) {
  return await axios.post(`${demo_url}/demo/set_app`, {
    xnode_id,
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
