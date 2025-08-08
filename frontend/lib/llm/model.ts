export const GPT_5_MIMI = 'gpt-5-mini';
export const GPT_41_NANO = 'gpt-4.1-nano';
export const GPT_5_NANO = 'gpt-5-nano';
export const GPT_4o = 'gpt-4o';
export const GPT_5 = 'gpt-5';
export const O3_MIMI = 'o3-mini';
export const O4_MIMI = 'o4-mini';
export const O1 = 'o1';
export const O3 = 'o3';
export const Claude_35_Haiku = 'claude-3-5-haiku-20241022';
export const Claude_37_Sonnet = 'claude-3-7-sonnet-20250219';
export const Claude_4 = 'claude-4-sonnet-20250514';
export const Claude_4_Thinking = 'claude-4-sonnet-20250514-thinking';
export const DEEPSEEK = 'deepseek-chat';
export const DEEPSEEK_R1 = 'deepseek-reasoner';
export const GEMIMI_2 = 'gemini-2.0-flash-exp';
export const GEMIMI_25 = 'gemini-2.5-pro-exp-03-25';
export const QWEN3_CODER = 'qwen3-coder-plus';

export enum ModelType {
    FREE = 'FREE',
    PRO = 'PRO',
    PREMIUM = 'PREMIUM',
}

export const MODEL_CONFIG = {
    [GPT_5_MIMI]: { type: ModelType.FREE, hasImageInput: true },
    [GPT_41_NANO]: { type: ModelType.FREE, hasImageInput: true },
    [GPT_5_NANO]: { type: ModelType.FREE, hasImageInput: true },
    [GPT_5]: { type: ModelType.PRO, hasImageInput: true },
    [O4_MIMI]: { type: ModelType.PRO, hasImageInput: true },
    [O1]: { type: ModelType.PREMIUM, hasImageInput: false },
    [O3]: { type: ModelType.PREMIUM, hasImageInput: true },
    [Claude_4]: { type: ModelType.PRO, hasImageInput: true },
    [Claude_4_Thinking]: { type: ModelType.PRO, hasImageInput: true },
    [Claude_35_Haiku]: { type: ModelType.PRO, hasImageInput: false },
    [DEEPSEEK_R1]: { type: ModelType.PRO, hasImageInput: false },
    [GEMIMI_2]: { type: ModelType.PRO, hasImageInput: true },
    [GEMIMI_25]: { type: ModelType.PRO, hasImageInput: true },
    [QWEN3_CODER]: { type: ModelType.PRO, hasImageInput: false },
} as const;

export function getModelAccess(model: string) {
    const config = MODEL_CONFIG[model];
    if (!config) return null;
    return config;
}

export const validModel = (model: string): boolean => !!getModelAccess(model);

export const isProModel = (model: string): boolean => {
    const access = getModelAccess(model);
    return access?.type === ModelType.PRO;
};

export const isPremiumModel = (model: string): boolean => {
    const access = getModelAccess(model);
    return access?.type === ModelType.PREMIUM;
};

export const isImageInputModel = (model: string): boolean => {
    const access = getModelAccess(model);
    return !!access?.hasImageInput;
};
