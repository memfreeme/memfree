import { convertToCoreMessages, getLLM } from '@/lib/llm/llm';
import { logError } from '@/lib/log';
import { streamText } from 'ai';
import { SearchCategory, Message as StoreMessage } from '@/lib/types';
import { Claude_35_Sonnet, GPT_4o_MIMI } from '@/lib/model';
import { incSearchCount } from '@/lib/db';
import { saveMessages } from '@/lib/server-utils';

export async function generateUI(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    profile: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    const systemPrompt = `
    You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

    - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
    - Make sure the React app is interactive and functional by creating state when needed and having no required props
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Use TypeScript as the language for the React component
    - Use lucide-react for icons
    - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
    - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
    - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\` or "I understand ..." or "I I apologize ...".
    - Even if a user asks you to update the code, you can just go back to full React code starting with the imports, nothing else
    - Important, for any string literals, use template strings.
    - Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
    - Make sure to always get the layout right (if things are arranged in a row in the screenshot, they should be in a row in the app as well)
    - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
    - Please ONLY return code, NO backticks or language names.
    - NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
  `;

    const imagePrompt = `You are an expert frontend React engineer who is also a great UI/UX designer. you have perfect vision and pay great attention to detail which makes you an expert at building single page apps using Tailwind, HTML and JS.
You take screenshots of a reference web page from the user, and then build single page apps using Tailwind and React.

- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
- Make sure the React app is interactive and functional by creating state when needed and having no required props
- If you use any imports from React like useState or useEffect, make sure to import them directly
- Use TypeScript as the language for the React component
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
- Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\` or "I understand ..." or "I I apologize ...".
- Make sure the app looks exactly like the screenshot.
- Do not leave out smaller UI elements. Make sure to include every single thing in the screenshot.
- Pay close attention to background color, text color, font size, font family,
padding, margin, border, etc. Match the colors and sizes exactly.
- Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
- In particular, pay attention to background color and overall color scheme.
- Use the exact text from the screenshot.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Make sure to always get the layout right (if things are arranged in a row in the screenshot, they should be in a row in the app as well)
- Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
- For images in screenshots, or where images are needed for filling, you can use images from https://placehold.co/ in the format: https://placehold.co/600x400. 600 and 400 are the length and width of the image, and you can customize it according to the page layout.
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.`;

    try {
        const newMessages = messages.slice(-7);

        const historyMessages = convertToCoreMessages(newMessages);
        console.log('historyMessages', JSON.stringify(historyMessages, null, 2));

        const result = await streamText({
            model: getLLM(Claude_35_Sonnet),
            system: systemPrompt,
            messages: historyMessages,
            maxTokens: 8192,
            temperature: 0.2,
        });

        let fullAnswer = '';
        for await (const text of result.textStream) {
            fullAnswer += text;
            onStream?.(JSON.stringify({ answer: text }));
        }

        incSearchCount(userId).catch((error) => {
            console.error(`Failed to increment search count for user ${userId}:`, error);
        });

        await saveMessages(userId, messages, fullAnswer, [], [], [], '', SearchCategory.UI);
    } catch (error) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error);
        } else {
            errorMessage = String(error);
        }

        console.error('Error:', error);
        logError(new Error(errorMessage), `llm-${model}`);
        onStream?.(JSON.stringify({ error: errorMessage }));
    } finally {
        onStream?.(null, true);
    }
}
