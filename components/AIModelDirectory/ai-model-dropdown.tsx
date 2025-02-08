'use client'

// Custom dropdown component to fix the issue with the Radix UI Select component

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortDropdownProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function SortDropdown({ value, onValueChange, options }: SortDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-[180px] items-center justify-between rounded border border-input bg-background px-3 py-2 text-sm"
      >
        <span>{options.find(opt => opt.value === value)?.label || value}</span>
        <ChevronDown className="size-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[180px] rounded-md border bg-popover shadow-md">
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 