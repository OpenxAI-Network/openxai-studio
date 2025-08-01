"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode, useEffect, useState } from "react";
import { useRequestPopup } from "./request-popup";
import { NixEditor } from "@/components/ui/nix-editor";
import { xnode } from "@openmesh-network/xnode-manager-sdk";
import {
  useConfigContainerGet,
  useConfigContainerSet,
} from "@openmesh-network/xnode-manager-sdk-react";

export interface AppEditParams {
session?: xnode.utils.Session;
  container: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}

export function AppEdit({ session, container, open, setOpen }: AppEditParams) {
  return (
    // <Dialog>
    //   <DialogTrigger asChild>
    //     <Button>Edit</Button>
    //   </DialogTrigger>
    //   <DialogContent className="flex flex-col sm:max-w-7xl">
    //     <AppEditInner {...params} />
    //   </DialogContent>
      // </Dialog>
       <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col sm:max-w-7xl">
        <AppEditInner session={session} container={container} />
      </DialogContent>
    </Dialog>
  );
}

function AppEditInner({ session, container }: { session?: xnode.utils.Session; container: string }) {
  const setRequestPopup = useRequestPopup();
  const { mutate: set } = useConfigContainerSet({
    overrides: {
      onSuccess({ request_id }) {
        setRequestPopup({ request_id });
      },
    },
  });

  const { data: config } = useConfigContainerGet({
    session,
    container,
  });

  const [networkEdit, setNetworkEdit] = useState<string>("");
  const [flakeEdit, setFlakeEdit] = useState<string>("");

  useEffect(() => {
    if (!config) {
      return;
    }

    setNetworkEdit(config.network ?? "host");
    setFlakeEdit(config.flake);
  }, [config]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit {container}</DialogTitle>
        <DialogDescription>Edit app configuration</DialogDescription>
      </DialogHeader>
      {config && (
        <div className="flex flex-col gap-2">
          <Item title="Network">
            <Select
              value={networkEdit}
              onValueChange={(v) => setNetworkEdit(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="host">host</SelectItem>
                <SelectItem value="containernet">containernet</SelectItem>
              </SelectContent>
            </Select>
          </Item>
          <NixEditor title="Flake" value={flakeEdit} onChange={setFlakeEdit} />
        </div>
      )}
      {config && (
        <DialogFooter>
          <Button
            onClick={() => {
              setFlakeEdit(config.flake);
              setNetworkEdit(config.network ?? "host");
            }}
            disabled={
              flakeEdit === config.flake &&
              networkEdit === (config.network ?? "host")
            }
          >
            Reset
          </Button>
          {session && (
            <DialogClose asChild>
              <Button
                onClick={() => {
                  set({
                    session,
                    path: { container },
                    data: {
                      settings: {
                        flake: flakeEdit,
                        network: networkEdit === "host" ? null : networkEdit,
                      },
                      update_inputs: null,
                    },
                  });
                }}
              >
                Apply
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      )}
    </>
  );
}

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{title}</Label>
      {children}
    </div>
  );
}