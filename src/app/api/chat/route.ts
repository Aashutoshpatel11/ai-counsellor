import { createClient } from '@supabase/supabase-js'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { createAgent } from "langchain"
import { HumanMessage } from "@langchain/core/messages"
import { aiTools } from "@/lib/ai-tools"

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { messages, userId } = await req.json();
  const lastMessageContent = messages[messages.length - 1].content;

  const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
  
  let userContext = `USER PROFILE: 
  - GPA: ${profile.academic_data?.gpa || 'N/A'}
  - Budget: $${profile.preferences?.budget || '0'}
  - Target Country: ${profile.preferences?.country || 'Any'}
  - Major: ${profile.academic_data?.major || 'General'}
  - other: ${JSON.stringify(profile)}`;
  

  console.log("USER CONTEXT :: ", userContext);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, 
  });

  const agent = createAgent({
    model: model,
    tools: aiTools,
    systemPrompt: `You are an expert Study Abroad Counsellor. 
    CONTEXT: ${userContext}\n

    RULES:\n
    - **Search Strategy:** Use 'searchUniversities' to find schools based on the user's profile.\n
    - **Categorization:** Categorize results as SAFE, TARGET, or DREAM based on the student's GPA in the CONTEXT.\n
    - **CRITICAL OVERRIDE:** If the user explicitly specifies a budget, country, or major in their message, YOU MUST OVERRIDE the Context and use their specific values for that search.\n
    - **Fallback:** If a search based on the Context returns no results, immediately try searching again with the user's specified budget or country if they provided one.\n
    - **Action Taking:**\n
      - Use 'addToShortlist' if the user expresses interest in a specific university.
      - Use 'lockUniversity' ONLY when the user explicitly confirms a final choice to commit to.\n
    - **Tone:** Be concise, supportive, and action-oriented.\n`
  });

  const result = await agent.invoke({
    messages: [new HumanMessage(lastMessageContent)],
  });

  const lastMsg = result.messages[result.messages.length - 1];

  return Response.json({ 
    role: 'assistant', 
    content: lastMsg.content 
  });
}