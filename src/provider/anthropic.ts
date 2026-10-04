import Anthropic from "@anthropic-ai/sdk";

import type {
  Provider,
  StopReason,
  StreamEvent,
  UserMessage,
  AssistantMessage,
} from "../types.ts";


export function createAnthropic(): Provider {

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is missing"
    );
  }


  const client = new Anthropic({
    apiKey,
    baseURL: "https://openrouter.ai/api",
  });

  return {
    name: "anthropic",

    defaultModel: "claude-sonnet-5",

    async *stream(
      { messages, model, system }
    ): AsyncIterable<StreamEvent> {

      const anthropicMessages = messages
        .filter(
          (
            message
          ): message is UserMessage | AssistantMessage =>
            message.role === "user" ||
            message.role === "assistant"
        )
        .map((message) => ({
          role: message.role,

          content:
            typeof message.content === "string"
              ? message.content
              : message.content
                  .filter(
                    (block) =>
                      block.type === "text"
                  )
                  .map(
                    (block) => block.text
                  )
                  .join(""),
        }));

      const stream =
        client.messages.stream({
          model,

          max_tokens: 3000,

          system,

          messages: anthropicMessages,
        });

      let text = "";

      for await (const event of stream) {

        if (
          event.type ===
            "content_block_delta" &&
          event.delta.type ===
            "text_delta"
        ) {

          text += event.delta.text;


          yield {
            type: "text_delta",

            delta: event.delta.text,
          };
        }
      }


      const final =
        await stream.finalMessage();

      const stopReason: StopReason =
        final.stop_reason === "max_tokens"
          ? "length"
          : "stop";


      yield {
        type: "done",

        message: {
          role: "assistant",

          content: [
            {
              type: "text",
              text,
            },
          ],

          usage: {
            input:
              final.usage.input_tokens,

            output:
              final.usage.output_tokens,
          },

          stopReason,
        },
      };
    },
  };
}