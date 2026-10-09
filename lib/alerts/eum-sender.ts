// Text alerts through AWS End User Messaging, as psd-eoc sends them
// (DECISIONS 113): one wire attempt per message (SendTextMessage has no
// idempotency token, so the outbox owns retries), transactional, from the
// athletics pool. AWS answers STOP and HELP and keeps the opt-out list.

import { PinpointSMSVoiceV2Client, SendTextMessageCommand } from "@aws-sdk/client-pinpoint-sms-voice-v2";

import type { AlertSender } from "./sender";

/** The number texted STOP; AWS won't deliver to it. */
export class OptedOutError extends Error {
  constructor() {
    super("The number opted out of texts");
    this.name = "OptedOutError";
  }
}

export function eumSender({
  poolArn,
  configurationSet,
  client = new PinpointSMSVoiceV2Client({ maxAttempts: 1 }),
}: {
  poolArn: string;
  configurationSet?: string;
  client?: Pick<PinpointSMSVoiceV2Client, "send">;
}): AlertSender {
  return {
    async send(message) {
      try {
        const out = await client.send(
          new SendTextMessageCommand({
            DestinationPhoneNumber: message.to,
            OriginationIdentity: poolArn,
            MessageBody: message.body,
            MessageType: "TRANSACTIONAL",
            ConfigurationSetName: configurationSet,
          }),
        );
        return { providerId: out.MessageId ?? "eum" };
      } catch (error) {
        const e = error as { name?: string; Reason?: string };
        if (e.name === "ConflictException" && e.Reason === "DESTINATION_PHONE_NUMBER_OPTED_OUT") throw new OptedOutError();
        throw error;
      }
    },
  };
}
