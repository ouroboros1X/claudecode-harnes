import { isAssistantMessage } from "openai/lib/chatCompletionUtils.mjs";
import { Assistants } from "openai/resources/beta.js";

export type Usage = {input:number, output:number}
export type StopReason ="stop"|"lengt"|"toolUse";

export type UserMessage = {role:"user"; content:string}

export type AssistantMessage = {role:"assistant"; content:string;
  usage:Usage,
  stopReason:StopReason
}

export type Message = UserMessage|AssistantMessage

export type StreamEvent = {type:"text_delta";delta:string} | {type: "done"; message:AssistantMessage};

export type StreamOptions = {messages:Message[], model:string, system?:string}

export interface Provider {
  name:string
  defaultModel:string;
  stream(opts:StreamOptions):  AsyncIterable<StreamEvent>;
}