import { Package, Tags, type LucideIcon } from 'lucide-react'
import { RoutesEnum } from '@/enum/routes..app'

export interface MenuItem {
  label: string
  route?: RoutesEnum
  icon: LucideIcon
  children?: MenuItem[]
}

export const DASHBOARD_MENU: MenuItem[] = [
  { label: 'Productos', route: RoutesEnum.PRODUCTS, icon: Package },
  { label: 'Categorías', route: RoutesEnum.CATEGORIES, icon: Tags },
]
