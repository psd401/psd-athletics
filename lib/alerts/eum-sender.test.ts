// @vitest-environment node
import { describe, expect, it } from "vitest";

import { eumSender, OptedOutError } from "./eum-sender";

const fake = (fail?: Error) => {
  const sent: { name: string; input: Record<string, unknown> }[] = [];
  return {
    sent,
    async send(command: { constructor: { name: string }; input: Record<string, unknown> }) {
      sent.push({ name: command.constructor.name, input: command.input });
      if (fail) throw fail;
      return { MessageId: "eum-1" };
    },
  };
};

describe("eumSender", () => {
  it("sends a transactional text from the athletics pool through its configuration set", async () => {
    const client = fake();
    const sender = eumSender({ poolArn: "arn:aws:sms-voice:us-west-2:1:pool/pool-1", configurationSet: "alerts", client: client as never });
    expect(await sender.send({ to: "+12535550123", subject: "Final score", body: "Final: Gig Harbor 2, Capital 0." })).toEqual({ providerId: "eum-1" });
    expect(client.sent).toEqual([
      {
        name: "SendTextMessageCommand",
        input: {
          DestinationPhoneNumber: "+12535550123",
          OriginationIdentity: "arn:aws:sms-voice:us-west-2:1:pool/pool-1",
          MessageBody: "Final: Gig Harbor 2, Capital 0.",
          MessageType: "TRANSACTIONAL",
          ConfigurationSetName: "alerts",
        },
      },
    ]);
  });

  it("reports a number that texted STOP as opted out", async () => {
    const error = Object.assign(new Error("opted out"), { name: "ConflictException", Reason: "DESTINATION_PHONE_NUMBER_OPTED_OUT" });
    const sender = eumSender({ poolArn: "p", configurationSet: "c", client: fake(error) as never });
    await expect(sender.send({ to: "+12535550123", subject: "x", body: "y" })).rejects.toBeInstanceOf(OptedOutError);
  });
});
