// import { createClient } from '@supabase/supabase-js'
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
// import { createAgent } from "langchain"
// import { HumanMessage } from "@langchain/core/messages"
// import { aiTools } from "@/lib/ai-tools"

// export const maxDuration = 60;

// export async function POST(req: Request) {
//   const supabase = await createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
  
//   const { messages, userId } = await req.json();
//   const lastMessageContent = messages[messages.length - 1].content;

//   const { data: profile } = await supabase
//   .from('profiles')
//   .select('*')
//   .eq('id', userId)
//   .single();
  
//   let userContext = `USER PROFILE: 
//   - GPA: ${profile.academic_data?.gpa || 'N/A'}
//   - Budget: $${profile.preferences?.budget || '0'}
//   - Target Country: ${profile.preferences?.country || 'Any'}
//   - Major: ${profile.academic_data?.major || 'General'}
//   - other: ${JSON.stringify(profile)}`;
  

//   console.log("USER CONTEXT :: ", userContext);

//   const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     apiKey: process.env.GOOGLE_API_KEY,
//     temperature: 0, 
//   });

//   const agent = createAgent({
//     model: model,
//     tools: aiTools,
//     systemPrompt: `You are an expert Study Abroad Counsellor. 
//     CONTEXT: ${userContext}\n

//     RULES:\n
//     - **Search Strategy:** Use 'searchUniversities' to find schools based on the user's profile.\n
//     - **Categorization:** Categorize results as SAFE, TARGET, or DREAM based on the student's GPA in the CONTEXT.\n
//     - **CRITICAL OVERRIDE:** If the user explicitly specifies a budget, country, or major in their message, YOU MUST OVERRIDE the Context and use their specific values for that search.\n
//     - **Fallback:** If a search based on the Context returns no results, immediately try searching again with the user's specified budget or country if they provided one.\n
//     - **Action Taking:**\n
//       - Use 'addToShortlist' if the user expresses interest in a specific university.
//       - Use 'lockUniversity' ONLY when the user explicitly confirms a final choice to commit to.\n
//     - **Tone:** Be concise, supportive, and action-oriented.\n`
//   });

//   const result = await agent.invoke({
//     messages: [new HumanMessage(lastMessageContent)],
//   });

//   const lastMsg = result.messages[result.messages.length - 1];

//   return Response.json({ 
//     role: 'assistant', 
//     content: lastMsg.content 
//   });
// }

import { createClient } from '@supabase/supabase-js'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { createAgent } from "langchain"
import { HumanMessage } from "@langchain/core/messages"
import { aiTools } from "@/lib/ai-tools"

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createClient(
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
  
  const academic = profile?.academic_data || {}
  const history = academic.history || {}
  const preferences = profile?.preferences || {}
  const readiness = profile?.readiness_data || {}

  const educationDetails = `
  ACADEMIC HISTORY:
  - Target Major: ${academic.major || 'Undecided'}
  - Overall Score (Summary): ${academic.gpa || 'N/A'}
  - Class 10th: ${history.tenth ? `${history.tenth.percentage}% (${history.tenth.board}, ${history.tenth.year})` : 'Not provided'}
  - Class 12th: ${history.twelfth ? `${history.twelfth.percentage}% (${history.twelfth.board}, ${history.twelfth.year})` : 'Not provided'}
  ${history.bachelors ? `- Bachelors: ${history.bachelors.course} (${history.bachelors.year}) - Score: ${history.bachelors.score}` : '- Bachelors: None (Undergraduate Applicant)'}

  PREFERENCES:
  - Budget: $${preferences.budget || '0'}
  - Target Country: ${preferences.country || 'Any'}
  - Target Intake: ${preferences.intake || 'Any'}

  READINESS:
  - English Test: ${readiness.englishTest || 'N/A'} (Score: ${readiness.englishScore || 'N/A'})
  - SOP Status: ${readiness.sopStatus || 'N/A'}
  `

  console.log("USER CONTEXT :: ", educationDetails);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, 
  });

  const agent = createAgent({
    model: model,
    tools: aiTools,
    systemPrompt: `You are an expert Study Abroad Counsellor. 
    
    USER PROFILE CONTEXT: 
    ${educationDetails}

    RULES:
    1. **Eligibility Check:** Always check if the user's specific academic scores (e.g., 12th grade Math or English scores, or Bachelors CGPA) meet the university's requirements.
    2. **Course Level:** - If the user has a Bachelors, recommend **Master's/Post-Graduate** programs.
       - If the user only has 12th details, recommend **Undergraduate/Bachelor's** programs.
    3. **Gap Analysis:** If there is a significant gap between their last passing year and the target intake (${preferences.intake}), ask about their work experience or activities during that gap.
    4. **Search Strategy:** Use 'searchUniversities' to find schools. Categorize results as SAFE, TARGET, or DREAM based on the user's profile strength.
    5. **CRITICAL OVERRIDE:** If the user explicitly specifies a budget, country, or major in their message, YOU MUST OVERRIDE the Context and use their specific values for that search.
    6. **Action Taking:**
       - Use 'addToShortlist' if the user expresses interest.
       - Use 'lockUniversity' ONLY when the user explicitly confirms a final choice.
    
    Tone: Be concise, supportive, and action-oriented.
    `
  });

  // 7. Invoke Agent
  const result = await agent.invoke({
    messages: [new HumanMessage(lastMessageContent)],
  });

  const lastMsg = result.messages[result.messages.length - 1];

  return Response.json({ 
    role: 'assistant', 
    content: lastMsg.content 
  });
}