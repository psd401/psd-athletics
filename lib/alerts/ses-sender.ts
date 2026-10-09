// Alert email through AWS SES (DECISIONS 105; infra/modules/athletics/email.tf).

import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

import type { AlertSender } from "./sender";

export function sesSender({ from, configurationSet, client = new SESv2Client({}) }: { from: string; configurationSet?: string; client?: Pick<SESv2Client, "send"> }): AlertSender {
  return {
    async send(message) {
      const out = await client.send(
        new SendEmailCommand({
          FromEmailAddress: `Peninsula Athletics <${from}>`,
          Destination: { ToAddresses: [message.to] },
          ConfigurationSetName: configurationSet,
          Content: {
            Simple: {
              Subject: { Data: message.subject, Charset: "UTF-8" },
              Body: { Text: { Data: message.body, Charset: "UTF-8" } },
            },
          },
        }),
      );
      return { providerId: out.MessageId ?? "ses" };
    },
  };
}
