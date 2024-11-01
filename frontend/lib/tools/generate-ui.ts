import { convertToCoreMessages, getLLM } from '@/lib/llm/llm';
import { log, logError } from '@/lib/log';
import { streamText } from 'ai';
import { SearchCategory, Message as StoreMessage } from '@/lib/types';
import { Claude_35_Sonnet } from '@/lib/model';
import { incSearchCount } from '@/lib/db';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { getSearchEngine, TEXT_LIMIT } from '@/lib/search/search';
import util from 'util';

const UI_PROMPT = `
You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
%s
- No matter what the user asks, you answer the user in the form of a react component
- Make sure the React app is interactive and functional by creating state when needed and having no required props
- If you use any imports from React like useState or useEffect, make sure to import them directly
- Use TypeScript as the language for the React component
- Use lucide-react for icons
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
- Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
- Use Tailwind to support responsive layout and perform well on both mobile, tablet and desktop
- Use Tailwind dark mode to make components look great in both light and dark modes
- Please ONLY return the full React code starting with the imports, nothing else. It's very important that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\` or "I understand ..." or "I apologize ...".
- Even if a user asks you to update the code, you can just go back to full React code starting with the imports, nothing else
- Important, for any string literals, use template strings.
- Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
- Make sure to always get the layout right (if things are arranged in a row in the screenshot or description, they should be in a row in the app as well)
- ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
- If you need user random avatars, please use randomuser.me's random avatar, for example: 'https://randomuser.me/api/portraits/men/1.jpg'.
- If you need random images, please use unsplash.com images. For example: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8'.
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.

For image-based requests:
- Make sure the app looks exactly like the screenshot.
- Do not leave out smaller UI elements. Make sure to include every single thing in the screenshot.
- Use the exact text from the screenshot.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.

Please ONLY return code, NO backticks or language names.
%s
`;

const SHADCN_UI_PROMPT = `- Important, please use shadcn UI components as much as possible`;

const SEARCH_CONTEXT = `Below are some related search words and images that you can use in your generated UI if you think they are necessary.
texts:
\`\`\`
%s
\`\`\`

images:
\`\`\`
%s
\`\`\`

Today's date is ${new Date().toISOString()}.
`;

export async function generateUI(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    isShadcnUI: boolean,
    isSearch: boolean,
    onStream?: (...args: any[]) => void,
) {
    try {
        const newMessages = messages.slice(-2);
        const historyMessages = convertToCoreMessages(newMessages);
        // console.log('historyMessages', JSON.stringify(historyMessages, null, 2));

        let shadcnInstructions = '';
        if (isShadcnUI) {
            shadcnInstructions = SHADCN_UI_PROMPT;
        }

        let searchContext = '';
        if (isSearch) {
            const searchResult = await getSearchEngine({
                categories: [SearchCategory.ALL],
            }).search(messages[messages.length - 1].content);
            const texts = searchResult.texts.slice(0, TEXT_LIMIT);
            const images = searchResult.images.slice(0, TEXT_LIMIT);
            const textContexts = texts.map((item) => `${item.title} ${item.content}`).join('\n\n');
            const imageContexts = images.map((item) => `${item.title} ${item.image}`).join('\n\n');
            searchContext = util.format(SEARCH_CONTEXT, textContexts, imageContexts);
        }
        const prompt = util.format(UI_PROMPT, shadcnInstructions, searchContext);

        // console.log('newPrompt', prompt);

        const result = await streamText({
            model: getLLM(Claude_35_Sonnet),
            system: prompt,
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
        const errorMessage = extractErrorMessage(error);
        logError(new Error(errorMessage), `llm-generate-ui`);
        onStream?.(JSON.stringify({ error: errorMessage }));
    } finally {
        onStream?.(null, true);
        log({
            service: 'generate-ui',
            userId: userId,
            message: messages,
        });
    }
}
