'use client'

import Image from 'next/image'
import Link from 'next/link'
import twitter from '@/assets/twitter.svg'
import logo from '@/public/images/openxai-logo.png'

export default function Footer() {
  const footerItems = [
    {
      label: 'Twitter',
      icon: twitter,
      href: `https://x.com/OpenxAINetwork`,
    },
  ]
  return (
    <footer className="z-50 flex h-16 w-full items-center justify-between bg-foreground px-6 py-3 md:pr-0">
      <div className="flex items-center">
        <Image src={logo} alt="OpenxAI Logo" width={40} height={40} />
        <div className="ml-6 hidden items-center text-sm text-gray-300 md:flex">
        Accelerate the AI industry without corporations — it is open, decentralized, and community-driven.
        </div>
      </div>

      <nav className="ml-32 flex items-center gap-x-3">
        {footerItems.map((option, index) => (
          <Link
            key={index}
            href={option.href}
            target="_blank"
            rel="noreferrer"
            className="flex size-[35px] items-center justify-center rounded-full bg-white p-1"
          >
            {option.icon && (
              <Image
                src={option.icon}
                alt={`${option.label} Icon`}
                width={18}
                height={18}
              />
            )}
          </Link>
        ))}
      </nav>
      <div className="ml:auto text-xs text-gray-300 md:mr-20">
        OpenxAI 2025
      </div>
    </footer>
  )
}
