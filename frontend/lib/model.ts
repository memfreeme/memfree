export const GPT_4o_MIMI = 'gpt-4o-mini';
export const GPT_4o = 'gpt-4o';
export const Claude_35_Sonnet = 'claude-3-5-sonnet-20240620';

const validModels = [GPT_4o_MIMI, GPT_4o, Claude_35_Sonnet];

export const validModel = (model: string) => validModels.includes(model);
