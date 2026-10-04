import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { parseArgs } from "node:util";
import { getProvider } from "./provider/index.ts";
import type { AssistantMessage, Message } from "./types.ts";
import { readTool } from "./tools/read.ts";
import { runAgent } from "./agent/loops.ts";
import { tools } from "./tools/index.ts";

config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});

const { values } = parseArgs({
  options: {
    prompt: { type: "string", short: "p" },
    provider: { type: "string", default: "anthropic" },
    model: { type: "string" },
  },
});

if (!values.prompt) {
  console.error(
    `no prompt sirr, mypi -p "prompt" --provider anthropic OR groq `,
  );
  process.exit(1);
}

const provider = getProvider(values.provider);
const model = values.model ?? provider.defaultModel;
const messages: Message[] = [{ role: "user", content: values.prompt }];

await runAgent({
  provider,
  model,
  tools,
  messages,
  onEvent(event) {
    if (event.type === "text") process.stdout.write(event.delta);
    else if (event.type == "tool_start") console.log(`\n ${event.call.name}`);
    else if (event.type == "tool_end") {
      const lines = event.result.split("\n").length;
      console.log(`\n ${event.isError ? event.result : lines}`);
    } else if (event.type === "turn_end") {
      const { usage, stopReason } = event.message;
      console.log(
        `\n\n  ${provider.name} ... ${model} ... ${usage.input} ... ${usage.output} ... ${stopReason}`,
      );
    }
  },
});

async function callModel1(): Promise<AssistantMessage> {
  for await (const event of provider.stream({ messages, model, tools })) {
    if (event.type === "text_delta") process.stdout.write(event.delta);
    else {
      const { usage, stopReason } = event.message;
      console.log(
        `\n\n  ${provider.name} ... ${model} ... ${usage.input} ... ${usage.output} ... ${stopReason}`,
      );

      return event.message;
    }
  }
  throw new Error("stream ended without a done event");
}
