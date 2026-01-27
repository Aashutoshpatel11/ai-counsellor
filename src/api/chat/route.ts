import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tools } from "@/lib/ai-tools";

export const maxDuration = 60; // Agents can take time

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // 1. Setup Model
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, 
  });

  // 2. Create Agent Prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert Study Abroad Counsellor. Your goal is to guide the student through 4 stages: PROFILE, DISCOVERY, SHORTLIST, APPLICATION. ALWAYS use tools to search or save data. Be concise."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // 3. Create Agent & Executor
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  // 4. Run Agent (Blocking)
  const result = await agentExecutor.invoke({
    input: lastMessage,
    chat_history: [], // For a hackathon, we can skip passing full history to save context, or map 'messages' here if needed
  });

  // 5. Return Simple JSON
  return Response.json({ 
    role: 'assistant', 
    content: result.output 
  });
}