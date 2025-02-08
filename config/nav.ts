import {
  BookText,
  ChartLine,
  Cloud,
  Cpu,
  DatabaseZap,
  Gauge,
  Globe,
  Home,
  IdCard,
  PackageOpen,
  Rocket,
  Star,
  TestTubeDiagonal,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { type Icon } from '@/components/Icons'

type NavCategory = 'main'
export type NavItem = {
  name: string
  icon?: LucideIcon | Icon
} & (
  | {
      type: 'item'
      href: string
    }
  | {
      type: 'category'
      items: NavItem[]
      disabled?: boolean
    }
)
export const navItems: Record<NavCategory, NavItem[]> = {
  main: [
    {
      type: 'item',
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      type: 'item',
      name: 'App Store',
      href: '/app-store',
      icon: PackageOpen,
    },
    {
      type: 'item',
      name: 'Dashboard',
      href: '/dashboard',
      icon: Gauge,
    },
    {
      type: 'item',
      name: 'Deployments',
      href: '/deployments',
      icon: Rocket,
    },
    {
      type: 'item',
      name: 'Rewards',
      href: '/rewards',
      icon: Star,
    },
    {
      type: 'item',
      name: 'Resources',
      href: '/resources',
      icon: DatabaseZap,
    },
    {
      type: 'item',
      name: 'Documentation',
      href: 'https://openxai-docs.vercel.app/',
      icon: BookText,
    },
    {
      type: 'item',
      name: 'Community',
      href: 'https://openxai.discourse.group/',
      icon: Users,
    },
  ]
}
