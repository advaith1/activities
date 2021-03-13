import type { Permissions, Snowflake, APIGuildMember, APIPartialChannel, APIRole, APIUser, APIApplication } from 'discord-api-types/v8';

// secrets: wrangler secret put <name>
declare global {
    const publicKey: string
    const token: string
}

declare module 'discord-api-types/v8' {
    // https://github.com/discordjs/discord-api-types/pull/86
    export interface APIApplicationCommandInteractionData {
        resolved?: {
            users?: Record<Snowflake, APIUser>;
            roles?: Record<Snowflake, APIRole>;
            members?: Record<Snowflake, Omit<APIGuildMember, 'user' | 'deaf' | 'mute'>>;
            channels?: Record<Snowflake, Required<APIPartialChannel> & { permissions: Permissions }>;
        };
    }

    // https://github.com/discord/discord-api-docs/pull/2690
    export interface APIInvite {
        target_type: 1 | 2
        target_application: APIApplication
    }
    export interface RESTPostAPIChannelInviteJSONBody {
        target_type: 1 | 2
        target_application_id: Snowflake
    }
}