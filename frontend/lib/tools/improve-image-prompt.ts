import { getLLM } from '@/lib/llm/llm';
import { GPT_4o_MIMI } from '@/lib/model';
import { format } from '@/lib/server-utils';
import { generateText } from 'ai';

const PROMPT = `Please refer to the text-to-image prompt below to generate a prompt for the AI ​​model to generate a image.
            The image theme: %s
            The image use case: %s
            Reference prompt example:
        \`\`\`
A festive and playful 3D clay-style business gathering background, featuring adorable clay figures representing global entrepreneurs sitting around a stylized "SEO" centerpiece. The scene includes handcrafted clay elements like ships sailing across oceans, worldwide landmarks, and floating digital devices. The backdrop glows with soft blues and teals, creating a modern and international atmosphere.

Key elements:
- Clay art style with soft shadows and depth
- Professional yet playful 3D figures
- Maritime and global business symbols
- Subtle tech elements and digital icons
- Warm lighting and soft gradients
- Modern business casual atmosphere

Style details:
- Clean and professional layout
- Soft matte textures
- Subtle depth and dimensionality
- Warm and welcoming color palette
- Contemporary business elements
- Handcrafted clay aesthetic
\`\`\`

You must follow the following rules when generating the prompt:
%s
Rule 2: The output length of the prompt text should be less than 200.
`;

const ShowTextPROMPT = `Rule 1: The generated images should contain keywords of the topic`;
const NoTextPROMPT = `Rule 1: The generated images should not contain any text`;

export async function generatePrompt(query: string, showText: boolean, useCase: string): Promise<string> {
    let newPrompt = '';
    let showTextInstructions = NoTextPROMPT;
    if (showText) {
        showTextInstructions = ShowTextPROMPT;
    }
    try {
        const prompt = format(PROMPT, query, useCase, showTextInstructions);
        // console.log("generatePrompt", prompt);
        const { text } = await generateText({
            model: getLLM(GPT_4o_MIMI),
            prompt: prompt,
        });
        newPrompt = text;
    } catch (error) {
        console.error('Error generating title:', error);
        newPrompt = query;
    }
    return newPrompt;
}
