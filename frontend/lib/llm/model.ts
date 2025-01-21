export const GPT_4o_MIMI = 'gpt-4o-mini';
export const GPT_4o = 'gpt-4o';
export const O1_MIMI = 'o1-mini';
export const O1_PREVIEW = 'o1-preview';
export const Claude_35_Haiku = 'claude-3-5-haiku-20241022';
export const Claude_35_Sonnet = 'claude-3-5-sonnet-20241022';
export const DEEPSEEK = 'deepseek-chat';
export const DEEPSEEK_R1 = 'deepseek-reasoner';
export const GEMIMI_2 = 'gemini-2.0-flash-exp';

export enum ModelType {
    FREE = 'FREE',
    PRO = 'PRO',
    PREMIUM = 'PREMIUM',
}

export const MODEL_CONFIG = {
    [GPT_4o_MIMI]: { type: ModelType.FREE, hasImageInput: true },
    [DEEPSEEK]: { type: ModelType.FREE, hasImageInput: false },
    [GPT_4o]: { type: ModelType.PRO, hasImageInput: true },
    [O1_MIMI]: { type: ModelType.PRO, hasImageInput: false },
    [O1_PREVIEW]: { type: ModelType.PREMIUM, hasImageInput: false },
    [Claude_35_Sonnet]: { type: ModelType.PRO, hasImageInput: true },
    [Claude_35_Haiku]: { type: ModelType.PRO, hasImageInput: false },
    [DEEPSEEK_R1]: { type: ModelType.PRO, hasImageInput: false },
    [GEMIMI_2]: { type: ModelType.PRO, hasImageInput: true },
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
