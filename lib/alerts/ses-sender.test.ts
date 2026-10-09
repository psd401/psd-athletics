// @vitest-environment node
import { describe, expect, it } from "vitest";

import { sesSender } from "./ses-sender";

describe("sesSender", () => {
  it("sends plain-text email from the alerts address through the configuration set", async () => {
    const sent: { name: string; input: Record<string, unknown> }[] = [];
    const client = {
      async send(command: { constructor: { name: string }; input: Record<string, unknown> }) {
        sent.push({ name: command.constructor.name, input: command.input });
        return { MessageId: "ses-123" };
      },
    };
    const sender = sesSender({ from: "alerts@athletics.psd401.net", configurationSet: "psd-athletics-prod-alerts", client: client as never });
    expect(await sender.send({ to: "fan@example.com", subject: "Final score", body: "Final: Gig Harbor 2, Capital 0." })).toEqual({ providerId: "ses-123" });
    expect(sent).toEqual([
      {
        name: "SendEmailCommand",
        input: {
          FromEmailAddress: "Peninsula Athletics <alerts@athletics.psd401.net>",
          Destination: { ToAddresses: ["fan@example.com"] },
          ConfigurationSetName: "psd-athletics-prod-alerts",
          Content: { Simple: { Subject: { Data: "Final score", Charset: "UTF-8" }, Body: { Text: { Data: "Final: Gig Harbor 2, Capital 0.", Charset: "UTF-8" } } } },
        },
      },
    ]);
  });
});
