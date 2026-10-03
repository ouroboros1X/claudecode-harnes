import Anthropic from "@anthropic-ai/sdk";
import {provider} from "../types.ts";
import { createAnthropic } from "./anthropic.ts";

const provider:Records<string, ()=>Provider>={
  anthropic:createAnthropic,
  anthropic-openai:()=>createOpenAIComat("anthropic-openai", process.env.ANTHROPIC_API_KEY!,"claude-sonnet-5")
  "groq":()=>createOpenAICompat("groq", "url", process.env.GROQ_API_KEY!,"qwen/qwen3.8-27b")
}

export function