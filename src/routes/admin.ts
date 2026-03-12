import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { decodeJwt } from 'jose'
import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import type {
  MapQuerystring,
  RoomAccessQuerystring,
  LoginUrlParams,
  LoginUrlQuerystring,
  ReportQuerystring,
  BanQuerystring,
  RoomUrlQuerystring,
  SaveNameBody,
  SaveTexturesBody,
  SaveCompanionTextureBody,
  ChatMembersQuerystring,
  MembersSearchQuerystring,
  MemberUuidParams,
  MemberChatIdParams,
  MemberChatIdBody,
  OauthRefreshParams,
  OauthRefreshQuerystring,
  IceServersQuerystring,
  RoomUuidQuerystring,
} from '../models/admin'

const dataDir = join(process.cwd(), 'src')

/** JWT payload shape */
interface JwtPayload {
  sub: string
  email?: string
  name?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  realm_access?: { roles?: string[] }
  resource_access?: Record<string, { roles?: string[] }>
}

/**
 * WorkAdventure Pusher -> Admin API routes
 * Based on https://play.workadventu.re/openapi/admin
 */
export default async function adminRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // GET /api/capabilities - Get admin api capabilities
  fastify.get('/api/capabilities', async () => {
    return {}
  })

  // GET /api/map - Returns map details or redirect (playUri, userId?, accessToken?)
  fastify.get<{ Querystring: MapQuerystring }>('/api/map', async () => {
    return JSON.parse(readFileSync(join(dataDir, 'map.json'), 'utf-8'))
  })

  // GET /api/room/access - Returns member's info if they can access the room
  fastify.get<{ Querystring: RoomAccessQuerystring }>('/api/room/access', async (request, reply) => {
    const { accessToken } = request.query

    if (!accessToken) {
      return reply.code(401).send({ status: 'error', message: 'Missing accessToken' })
    }

    let payload: JwtPayload
    try {
      const decoded = decodeJwt(accessToken)
      payload = decoded as unknown as JwtPayload
    } catch (err) {
      return reply.code(401).send({ status: 'error', message: 'Invalid access token' })
    }

    if (payload.email != request.query.userIdentifier) {
      return reply.code(401).send({ status: 'error', message: 'Access token is not valid for this user' })
    }

    const roles = payload.realm_access?.roles ?? []
    const canEdit = roles.includes('editor')

    const wokaList = JSON.parse(readFileSync(join(dataDir, 'list.json'), 'utf-8'))
    const characterTextures: { id: string, url: string }[] = []

    const rawIds = request.query.characterTextureIds
    const characterTextureIds = Array.isArray(rawIds) ? rawIds : rawIds ? [rawIds] : []
    const collectionNamespace = ["accessory", "body", "clothes", "eyes", "hair", "hat", "woka"]
    for (const namespace of collectionNamespace) {
      for (const collection of wokaList[namespace].collections) {
        for (const texture of collection.textures) {
          if (characterTextureIds.includes(texture.id)) {
            characterTextures.push({ id: texture.id, url: texture.url })
          }
        }
      }
    }

    const companionTexture = wokaList.companion.collections[0].textures.find((texture: { id: string, url: string }) => texture.id === request.query.companionTextureId)

    const response = {
      status: 'ok',
      email: payload.email ?? payload.preferred_username ?? '',
      username: payload.name ?? payload.preferred_username ?? payload.email ?? 'Anonymous',
      userUuid: payload.sub,
      tags: roles,
      visitCardUrl: "https://mycompany.com/contact/me",
      isCharacterTexturesValid: (characterTextures.length > 0),
      characterTextures: characterTextures.map(texture => ({ id: texture.id, url: `https://play.ehealth.id/${texture.url}` })),
      isCompanionTextureValid: true,
      companionTexture: companionTexture,
      messages: [
        "string"
      ],
      userRoomToken: "",
      activatedInviteUser: true,
      applications: [],
      canEdit: true,
      world: "string",
      chatID: "string",
      canRecord: true
    }
    return reply.code(200).send(response)
  })

  // GET /api/login-url/:organizationMemberToken - Returns member from token
  fastify.get<{ Params: LoginUrlParams; Querystring: LoginUrlQuerystring }>('/api/login-url/:organizationMemberToken', async () => {
    return {}
  })

  // POST /api/report - Report one user with a comment
  fastify.post<{ Querystring: ReportQuerystring }>('/api/report', async () => {
    return {}
  })

  // GET /api/ban - Check if user is banned or not
  fastify.get<{ Querystring: BanQuerystring }>('/api/ban', async () => {
    return { is_banned: false }
  })

  // GET /api/room/sameWorld - Get all URLs of rooms from the world
  fastify.get<{ Querystring: RoomUrlQuerystring }>('/api/room/sameWorld', async () => {
    return []
  })

  // GET /api/room/tags - Returns list of all tags used in the room
  fastify.get<{ Querystring: RoomUrlQuerystring }>('/api/room/tags', async () => {
    return []
  })

  // POST /api/save-name - Saves the name of the Woka
  fastify.post<{ Body: SaveNameBody }>('/api/save-name', async (_request, reply) => {
    return reply.code(204).send()
  })

  // POST /api/save-textures - Saves the textures of the Woka
  fastify.post<{ Body: SaveTexturesBody }>('/api/save-textures', async (_request, reply) => {
    return reply.code(204).send()
  })

  // POST /api/save-companion-texture - Saves the companion texture
  fastify.post<{ Body: SaveCompanionTextureBody }>('/api/save-companion-texture', async (_request, reply) => {
    return reply.code(204).send()
  })

  // GET /api/chat/members - Get list of members for chat
  fastify.get<{ Querystring: ChatMembersQuerystring }>('/api/chat/members', async () => {
    return { total: 0, members: [] }
  })

  // GET /api/members - Search members from search term
  fastify.get<{ Querystring: MembersSearchQuerystring }>('/api/members', async () => {
    return []
  })

  // GET /members/:memberUUID - Get member by UUID
  fastify.get<{ Params: MemberUuidParams }>('/members/:memberUUID', async () => {
    return {}
  })

  // PUT /api/members/:userIdentifier/chatId - Sets the Chat ID (Matrix ID) of a user
  fastify.put<{ Params: MemberChatIdParams; Body: MemberChatIdBody }>('/api/members/:userIdentifier/chatId', async () => {
    return {}
  })

  // GET /oauth/refreshtoken/:token - Get refreshed token from expired one
  fastify.get<{ Params: OauthRefreshParams; Querystring: OauthRefreshQuerystring }>('/oauth/refreshtoken/:token', async () => {
    return {}
  })

  // GET /api/ice-servers - Returns list of ICE servers for WebRTC
  fastify.get<{ Querystring: IceServersQuerystring }>('/api/ice-servers', async () => {
    return []
  })

  // GET /api/companion/list - Get all the companions
  fastify.get<{ Querystring: RoomUuidQuerystring }>('/api/companion/list', async () => {
    return []
  })

  // GET /api/woka/list - Get all woka from the world
  fastify.get<{ Querystring: RoomUuidQuerystring }>('/api/woka/list', async () => {
    return JSON.parse(readFileSync(join(dataDir, 'list.json'), 'utf-8'))
  })
}
