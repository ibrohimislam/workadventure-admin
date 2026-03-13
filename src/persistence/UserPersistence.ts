export interface UserSaveData {
  name?: string
  textureIds?: string[]
  companionTextureId?: string | null
}

export interface UserPersistence {
  get(userIdentifier: string): Promise<UserSaveData | undefined>
  save(userIdentifier: string, data: Partial<UserSaveData>): Promise<void>
}
