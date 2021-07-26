import { verify } from './verify'
import { InteractionType, InteractionResponseType, APIInteractionResponse, RESTPostAPIChannelInviteJSONBody, APIInvite, ApplicationCommandOptionType, ChannelType, MessageFlags, APIApplicationCommandInteraction, InviteTargetType, RouteBases, Routes } from 'discord-api-types/v9'
import { APIPingInteraction } from 'discord-api-types/payloads/v9/_interactions/ping'

export async function handleRequest(request: Request): Promise<Response> {
  if (!request.headers.get('X-Signature-Ed25519') || !request.headers.get('X-Signature-Timestamp')) return Response.redirect('https://advaith.io')
  if (!await verify(request)) return new Response('', { status: 401 })

  const interaction = await request.json() as APIPingInteraction | APIApplicationCommandInteraction

  if (interaction.type === InteractionType.Ping)
    return respond({
      type: InteractionResponseType.Pong
    })

  if (interaction.data.name === 'invite')
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: '[Click to add to your server](https://discord.com/api/oauth2/authorize?client_id=819778342818414632&scope=bot%20applications.commands)'
      }
    })

  if (!interaction.data.resolved?.channels)
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Please update your Discord app to use this command.',
        flags: MessageFlags.Ephemeral
      }
    })

  // set option types for ts
  if (!interaction.data.options ||
      interaction.data.options[0].type !== ApplicationCommandOptionType.Channel ||
      interaction.data.options[1].type !== ApplicationCommandOptionType.String) return new Response()

  if (interaction.data.resolved.channels[interaction.data.options[0].value].type !== ChannelType.GuildVoice)
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'The selected channel must be a voice channel'
      }
    })

  const r = await fetch(`${RouteBases.api}${Routes.channelInvites(interaction.data.options[0].value)}`, {
    method: 'POST',
    headers: { authorization: `Bot ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      max_age: 0,
      target_type: InviteTargetType.EmbeddedApplication,
      target_application_id: interaction.data.options[1].value
    } as RESTPostAPIChannelInviteJSONBody)
  })

  const invite = await r.json() as APIInvite

  if (r.status !== 200) {
    return respond({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `An error occured: ${(invite as any).message}\nMake sure I have the "Create Invite" permission in the voice channel!`,
        allowed_mentions: { parse: [] }
      }
    })
  }

  return respond({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `[Click to open ${invite.target_application!.name} in ${invite.channel!.name}](<https://discord.gg/${invite.code}>)`,
      allowed_mentions: { parse: [] }
    }
  })
}

const respond = (response: APIInteractionResponse) =>
  new Response(JSON.stringify(response), {headers: {'content-type': 'application/json'}})
