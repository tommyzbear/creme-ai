import type OpenAI from 'openai'
// import {
//   generateImage,
//   generateImageToolDefinition,
// } from './tools/generateImage'
// import { reddit, redditToolDefinition } from './tools/reddit'
// import { dadJoke, dadJokeToolDefinition } from './tools/dadJoke'
import { dexscreener, dexscreenerToolDefinition } from './dexscreener'
import { dexscreenerTool } from "./dexscreener"

const tools = {
  getTokenPrice: dexscreenerTool
}

export type ToolName = keyof typeof tools

export async function runTool(name: ToolName, args: any) {
  const tool = tools[name]
  if (!tool) {
    throw new Error(`Tool ${name} not found`)
  }
  return await tool.execute(args)
}

export const formattedTools = Object.values(tools).map(tool => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }
}))

// export const runTool = async (
//   toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
//   userMessage: string
// ) => {
//   const input = {
//     userMessage,
//     toolArgs: JSON.parse(toolCall.function.arguments || '{}'),
//   }

//   switch (toolCall.function.name) {
//     case dexscreenerToolDefinition.name:
//       return dexscreener(input)
//     // case redditToolDefinition.name:
//     //   return reddit(input)

//     // case dadJokeToolDefinition.name:
//     //   return dadJoke(input)

//     default:
//       return `Never run this tool: ${toolCall.function.name} again, or else!`
//   }
// }
