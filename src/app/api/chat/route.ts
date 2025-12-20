import { createGroq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        console.log("----------------------------------------");
        console.log("API CALLED WITH MODEL: llama-3.3-70b-versatile");
        console.log("----------------------------------------");
        const systemPrompt = `You are a helpful assistant for the University Lost & Found Portal.
    
    IMPORTANT: You are communicating with a simplified text-only client.
    
    1. **Transparency**: 
       - When you search, YOU MUST SAY "Searching for [item]..." first.
       - **CRITICAL**: If the tool returns "Found 0 items", you MUST explicitly say: "I checked the database, but I couldn't find any [item] reported as lost/found." Do NOT make up items.
    
    2. **Navigation**: If the user wants to go to a page, you MUST output a special tag in your response: "__REDIRECT:/path__".
       - Example: "Sure! I'll take you there. __REDIRECT:/report/lost__"
       - **Valid Paths (ONLY USE THESE)**:
         - "/" (Home)
         - "/report/lost" (Report Lost Item) -- DO NOT USE /report-lost
         - "/report/found" (Report Found Item) -- DO NOT USE /report-found
         - "/items" (Browse Items)
         - "/dashboard" (My Claims/Dashboard)
       
    3. **Always Output Text**: NEVER return an empty response. Describe what you are doing.
    
    Always be polite and concise.
    `;

        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: systemPrompt,
            messages,
            // @ts-ignore
            maxSteps: 5,
            tools: {
                searchItems: tool({
                    description: 'Search for lost or found items in the database',
                    parameters: z.object({
                        query: z.string().describe('The search query (e.g., "keys", "blue wallet")'),
                        type: z.enum(['LOST', 'FOUND']).optional(),
                    }),
                    // @ts-ignore
                    execute: async ({ query, type }) => {
                        console.log(`[Tool] Searching for: "${query}" (Type: ${type || 'ALL'})`);

                        // Initialize Supabase only when needed
                        const supabase = await supabaseServer();

                        // Select specific fields to keep context size manageable
                        let dbQuery = supabase.from('items')
                            .select('id, title, description, type, category, status, location, date_incident, created_at');

                        // Attempt to filter out deleted items if column exists (it should after migration)
                        // If migration isn't run, this might error, but that's expected flow.
                        // We wrap in a check or just assume schema is up to date.
                        // For robustness, we can try to filter, if it fails, we catch? 
                        // Supabase build-in filters don't throw immediately until await.
                        dbQuery = dbQuery.eq('is_deleted', false);

                        if (type) {
                            dbQuery = dbQuery.eq('type', type);
                        }

                        if (query) {
                            dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
                        }

                        const { data, error } = await dbQuery.limit(5).order('created_at', { ascending: false });

                        if (error) {
                            console.error('Search error:', error);
                            // Fallback: if error is about is_deleted column missing, try again without it?
                            // This is a nice-to-have but might be complex. Let's return error to model.
                            return `Error: Failed to search. ${error.message}`;
                        }

                        if (!data || data.length === 0) {
                            return `Search completed. Found 0 items matching "${query}".`;
                        }

                        return `Found ${data.length} items: ${JSON.stringify(data)}`;
                    },
                }),
                navigate: tool({
                    description: 'Navigate the user to a specific page path',
                    parameters: z.object({
                        path: z.string().describe('The relative URL path to navigate to (e.g., /report-item)'),
                    }),
                    // @ts-ignore
                    execute: async ({ path }: { path: string }) => {
                        // The model should output the tag, but this reinforces it in the tool result too
                        return `Action: Navigating to ${path}. __REDIRECT:${path}__`;
                    },
                }),
            },
        });

        // @ts-ignore
        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("API ROUTE ERROR:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
