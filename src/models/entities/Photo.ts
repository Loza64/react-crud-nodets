import BaseEntity from '@/sdk/model/entities/BaseEntity'

export default interface Photo extends BaseEntity {
  url: string
  secureUrl?: string
  originalFilename?: string
  width?: number
  height?: number
}
