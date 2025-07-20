import { GlobalAccelerator2025Deploy } from './deploy'

export default function GlobalAccelerator2025Page() {
  return (
    <div className="m-5 flex flex-col gap-3">
      <span className="text-xl font-semibold">
        Deploy Global Accelerator Demo
      </span>
      <GlobalAccelerator2025Deploy />
    </div>
  )
}
