import { useUserConfig } from "@/hooks/useUserConfig";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export enum Modes {
  Auto = "auto",
  Full = "full",
  User = "user",
}

export function NixEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [modeOverride, setModeOverride] = useState<Modes>(Modes.Auto);
  const userConfig = useUserConfig({ config: value });

  const auto = userConfig ? Modes.User : Modes.Full;
  const mode = modeOverride === Modes.Auto ? auto : modeOverride;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex place-items-center gap-2">
        <span className="font-semibold text-lg">{title}</span>
        <div className="grow" />
        <span className="text-sm">Editor Mode</span>
        <Select
          value={modeOverride}
          onValueChange={(m) => setModeOverride(m as Modes)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Modes.Auto}>Auto ({auto})</SelectItem>
            {userConfig && (
              <SelectItem value={Modes.User}>User Config</SelectItem>
            )}
            <SelectItem value={Modes.Full}>Full Flake</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Editor
        className="border border-black"
        height="400px"
        language="nix"
        value={mode === Modes.User ? userConfig : value}
        onChange={(v) =>
          onChange(
            mode === Modes.User
              ? value.replace(userConfig ?? "", v ?? "")
              : v ?? ""
          )
        }
      />
    </div>
  );
}