import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import {parseArgs} from "node:util";


config({
  path: "./.env",
  quiet: true,
});


const {values} = parseArgs({
  options:{
    prompt:{type:"string", short:"p"},
    model:{type:"string",default:"claude-sonnet-5"}
  }
})


if(!values.prompt){
  console.error("np prompt sir");
  process.exit(1)
}

console.log(
  "OPENROUTER KEY:",
  process.env.OPENROUTER_API_KEY ? "LOADED" : "MISSING"
);

console.log(
  "KEY LENGTH:",
  process.env.OPENROUTER_API_KEY?.length
);


const client = new Anthropic({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api",
});

const stream = client.messages.stream({
  max_tokens: 1024,
  messages: [{content: "Hello, World", role:"user"}],
  model: values.model
});

for await (const event of stream) {
  console.log(event);
}

for await (const event of stream){
  if(event.type==="content_block_delta" && event.delta.type==="text_delta"){
    process.stdout.write(event.delta.text);
  }
}

const final = await stream.finalMessage();
console.log(final);
console.log(final.usage.input_tokens)
console.log(final.usage.output_tokens)
console.log(final.stop_reason)