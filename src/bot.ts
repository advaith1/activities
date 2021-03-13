import { verifyKey } from 'discord-interactions'
import { InteractionType, APIInteractionResponseType, APIInteractionResponse, APIInteraction, Snowflake, RESTPostAPIChannelInviteJSONBody, APIInvite } from 'discord-api-types/v8'

export async function handleRequest(request: Request): Promise<Response> {
  if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://advaith.io')
  const valid = verifyKey(await request.clone().arrayBuffer(), request.headers.get('X-Signature-Ed25519')!, request.headers.get('X-Signature-Timestamp')!, publicKey)
  if (!valid) return new Response('', { status: 401 })

  const interaction = await request.json() as APIInteraction

  if (interaction.type === InteractionType.Ping)
    return respond({
      type: APIInteractionResponseType.Pong
    })

  if (!interaction.data!.resolved)
    return respond({
      type: APIInteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Please update your Discord app to use this command.',
        flags: 1 << 6
      }
    })

  // @ts-expect-error / ts doesn't like this for some reason
  if (interaction.data.resolved.channels[interaction.data.options[0].value as Snowflake].type !== 2)
    return respond({
      type: APIInteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'The selected channel must be a voice channel'
      }
    })
    
  const r = await fetch(`https://discord.com/api/v8/channels/${interaction.data!.options![0].value}/invites`, {
    method: 'POST',
    headers: { authorization: `Bot ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      max_age: 0,
      target_type: 2,
      target_application_id: interaction.data!.options![1].value
    } as RESTPostAPIChannelInviteJSONBody)
  })

  const invite = await r.json() as APIInvite

  if (r.status !== 200) {
    return respond({
      type: APIInteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `An error occured: ${(invite as any).message}\nMake sure I have the "Create Invite" permission in the voice channel!`,
        allowed_mentions: { parse: [] }
      }
    })
  }

  return respond({
    type: APIInteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `[Click to open ${invite.target_application.name} in ${invite.channel!.name}](<https://discord.gg/${invite.code}>)`,
      allowed_mentions: { parse: [] }
    }
  })
}

const respond = (response: APIInteractionResponse) =>
  new Response(JSON.stringify(response))
