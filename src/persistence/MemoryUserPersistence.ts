import type { UserPersistence, UserSaveData } from './UserPersistence'

export class MemoryUserPersistence implements UserPersistence {
  private store = new Map<string, UserSaveData>()

  async get(id: string): Promise<UserSaveData | undefined> {
    return this.store.get(id)
  }

  async save(id: string, data: Partial<UserSaveData>): Promise<void> {
    this.store.set(id, { ...this.store.get(id), ...data })
  }
}
