import { createClient, type RedisClientType } from 'redis'
import type { UserPersistence, UserSaveData } from './UserPersistence'

export class RedisUserPersistence implements UserPersistence {
  private client: RedisClientType

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl })
    this.client.on('error', (err) => console.error('Redis client error', err))
    this.client.connect()
  }

  async get(id: string): Promise<UserSaveData | undefined> {
    const data = await this.client.hGetAll(`user:${id}`)
    if (!Object.keys(data).length) return undefined
    return {
      name: data.name || undefined,
      textureIds: data.textureIds ? JSON.parse(data.textureIds) : undefined,
      companionTextureId:
        data.companionTextureId === '__null__'
          ? null
          : (data.companionTextureId || undefined),
    }
  }

  async save(id: string, patch: Partial<UserSaveData>): Promise<void> {
    const fields: Record<string, string> = {}
    if (patch.name !== undefined) fields.name = patch.name
    if (patch.textureIds !== undefined)
      fields.textureIds = JSON.stringify(patch.textureIds)
    if (patch.companionTextureId !== undefined)
      fields.companionTextureId =
        patch.companionTextureId === null ? '__null__' : patch.companionTextureId
    if (Object.keys(fields).length) await this.client.hSet(`user:${id}`, fields)
  }
}
