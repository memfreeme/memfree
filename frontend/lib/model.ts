export const GPT_4o_MIMI = 'gpt-4o-mini';
export const GPT_4o = 'gpt-4o';
export const Claude_35_Sonnet = 'claude-3-5-sonnet-20240620';
export const LLAMA_31_70B = 'llama-3.1-70b-versatile';
export const GEMINI_FLASH = 'models/gemini-1.5-flash-latest';
export const GEMINI_PRO = 'models/gemini-1.5-pro-latest';

const validModels = [
    GPT_4o_MIMI,
    GPT_4o,
    Claude_35_Sonnet,
    LLAMA_31_70B,
    GEMINI_FLASH,
    GEMINI_PRO,
];

const proModels = [GPT_4o, Claude_35_Sonnet, GEMINI_PRO];

export const validModel = (model: string) => validModels.includes(model);
export const isProModel = (model: string) => proModels.includes(model);
