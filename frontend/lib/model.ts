export const GPT_4o_MIMI = 'gpt-4o-mini';
export const GPT_4o = 'gpt-4o';
export const O1_MIMI = 'o1-mini';
export const O1_PREVIEW = 'o1-preview';
export const Claude_35_Haiku = 'claude-3-5-haiku-20241022';
export const Claude_35_Sonnet = 'claude-3-5-sonnet-20241022';
export const DEEPSEEK = 'deepseek-chat';

const validModels = [GPT_4o_MIMI, GPT_4o, O1_MIMI, O1_PREVIEW, Claude_35_Sonnet, Claude_35_Haiku, DEEPSEEK];

const proModels = [GPT_4o, Claude_35_Sonnet, Claude_35_Haiku, O1_MIMI, O1_PREVIEW];

export const ImageInputModels = [GPT_4o, GPT_4o_MIMI, Claude_35_Sonnet];

export const validModel = (model: string) => validModels.includes(model);
export const isProModel = (model: string) => proModels.includes(model);
export const isImageInputModel = (model: string) => ImageInputModels.includes(model);
