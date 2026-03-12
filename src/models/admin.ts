/**
 * Request/response models for WorkAdventure Admin API
 * Based on https://play.workadventu.re/openapi/admin
 */

// GET /api/map
export interface MapQuerystring {
  playUri: string
  userId?: string
  accessToken?: string
}

// GET /api/room/access
export interface RoomAccessQuerystring {
  userIdentifier?: string
  isLogged?: string
  accessToken?: string
  playUri: string
  ipAddress: string
  characterTextureIds?: string[]
  companionTextureId?: string
}

// GET /api/login-url/:organizationMemberToken
export interface LoginUrlParams {
  organizationMemberToken: string
}
export interface LoginUrlQuerystring {
  playUri: string
}

// POST /api/report
export interface ReportQuerystring {
  reportedUserUuid?: string
  reportedUserComment: string
  reporterUserUuid?: string
  roomUrl?: string
}

// GET /api/ban
export interface BanQuerystring {
  ipAddress: string
  token: string
  roomUrl: string
}

// GET /api/room/sameWorld, /api/room/tags
export interface RoomUrlQuerystring {
  roomUrl: string
}

// POST /api/save-name
export interface SaveNameBody {
  roomUrl: string
  name: string
  userIdentifier: string
}

// POST /api/save-textures
export interface SaveTexturesBody {
  roomUrl: string
  textures: string[]
  userIdentifier: string
}

// POST /api/save-companion-texture
export interface SaveCompanionTextureBody {
  roomUrl: string
  texture: string
  userIdentifier: string
}

// GET /api/chat/members
export interface ChatMembersQuerystring {
  roomUrl: string
  searchText?: string
}

// GET /api/members
export interface MembersSearchQuerystring {
  playUri: string
  searchText: string
}

// GET /members/:memberUUID
export interface MemberUuidParams {
  memberUUID: string
}

// PUT /api/members/:userIdentifier/chatId
export interface MemberChatIdParams {
  userIdentifier: string
}
export interface MemberChatIdBody {
  roomUrl: string
  chatId: string
  userIdentifier: string
}

// GET /oauth/refreshtoken/:token
export interface OauthRefreshParams {
  token: string
}
export interface OauthRefreshQuerystring {
  provider?: string
  userIdentifier?: string
}

// GET /api/ice-servers
export interface IceServersQuerystring {
  roomUrl: string
  userIdentifier?: string
}

// GET /api/companion/list, GET /api/woka/list
export interface RoomUuidQuerystring {
  roomUrl: string
  uuid: string
}
