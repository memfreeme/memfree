// lib/llm/llm-service.ts
import 'server-only';

import { getLLM, getMaxOutputToken } from '@/lib/llm/llm';
import { logError } from '@/lib/log';
import { GPT_5, GPT_5_MIMI, GPT_5_NANO, O4_MIMI } from '@/lib/llm/model';
import { extractErrorMessage, saveMessages } from '@/lib/server-utils';
import { Message as StoreMessage, SearchCategory, ImageSource, TextSource, VideoSource } from '@/lib/types';
import { AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { generateTitle } from '@/lib/tools/generate-title';
import { indexMessage } from '@/lib/index/index-message';
import { streamResponse } from '@/lib/llm/utils';
import { smoothStream, streamText } from 'ai';

export interface LLMConfig {
    modelName: string;
    isPro: boolean;
    systemPrompt: string;
    userMessages: any[];
    tools?: any;
    enableThinking?: boolean;
    maxSteps?: number;
}

export interface StreamHandler {
    onText?: (text: string) => void;
    onToolCall?: (toolName: string, args: any) => void;
    onToolResult?: (toolName: string, result: any) => void;
    onStatus?: (status: string) => void;
    onError?: (error: string) => void;
    onReasoning?: (text: string) => void;
}

export interface LLMResult {
    fullAnswer: string;
    texts?: TextSource[];
    images?: ImageSource[];
    videos?: VideoSource[];
    related?: string;
    hasError: boolean;
}

export class LLMService {
    static buildStreamConfig(config: LLMConfig) {
        const baseConfig = {
            model: getLLM(config.modelName),
            maxRetries: 0,
            experimental_transform: smoothStream({
                delayInMs: 30, // optional: defaults to 10ms
                chunking: 'line', // optional: defaults to 'word'
            }),
            messages: [
                {
                    role: 'system' as const,
                    content: config.systemPrompt,
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                },
                ...config.userMessages,
            ],
            temperature: this.getTemperature(config.modelName),
            ...(config.maxSteps && { maxSteps: config.maxSteps }),
            ...(config.tools && { tools: config.tools }),
            ...(this.shouldEnableThinking(config.modelName, config.enableThinking) && {
                providerOptions: {
                    anthropic: {
                        thinking: { type: 'enabled', budgetTokens: 4096 },
                    } satisfies AnthropicProviderOptions,
                },
            }),
            ...this.getMaxTokensConfig(config.modelName, config.isPro),
        };

        return baseConfig;
    }

    static shouldEnableThinking(modelName: string, enableThinking?: boolean): boolean {
        return enableThinking || modelName.endsWith('-thinking') || modelName === 'deepseek-reasoner';
    }

    static getMaxTokensConfig(modelName: string, isPro: boolean | undefined) {
        const excludedModels = [O4_MIMI, GPT_5_NANO, GPT_5_MIMI, GPT_5];

        if (!excludedModels.includes(modelName)) {
            return {
                maxTokens: getMaxOutputToken(isPro, modelName),
            };
        }

        return {};
    }

    static getTemperature(modelName: string): number {
        switch (modelName) {
            case O4_MIMI:
            case GPT_5:
            case GPT_5_NANO:
            case GPT_5_MIMI:
                return 1;
            default:
                return 0.1;
        }
    }

    static async handleStreamResponse(result: any, handler: StreamHandler): Promise<LLMResult> {
        let fullAnswer = '';
        let isFirstReasoning = true;
        let reasoningEnded = false;
        let hasError = false;
        let texts: TextSource[] = [];
        let images: ImageSource[] = [];
        let videos: VideoSource[] = [];

        for await (const delta of result.fullStream) {
            switch (delta.type) {
                case 'reasoning': {
                    const { text, isFirst } = this.handleReasoningPart(delta, isFirstReasoning);
                    fullAnswer += text;
                    handler.onReasoning?.(text);

                    if (isFirst) {
                        isFirstReasoning = false;
                        reasoningEnded = false;
                    }
                    break;
                }
                case 'text-delta': {
                    const { text, needsSeparator } = this.handleTextDelta(delta, isFirstReasoning, reasoningEnded);
                    fullAnswer += text;
                    handler.onText?.(text);

                    if (needsSeparator) {
                        reasoningEnded = true;
                    }
                    break;
                }
                case 'tool-call': {
                    handler.onToolCall?.(delta.toolName, delta.args);
                    break;
                }
                case 'tool-result': {
                    handler.onToolResult?.(delta.toolName, delta.result);
                    if (delta.result.texts) {
                        texts = texts.concat(delta.result.texts);
                    }
                    if (delta.result.images) {
                        images = images.concat(delta.result.images);
                    }
                    if (delta.result.videos) {
                        videos = videos.concat(delta.result.videos);
                    }
                    break;
                }
                case 'error': {
                    hasError = true;
                    console.error(`LLM error: ${delta.error}`);
                    handler.onError?.(String(delta.error));
                    break;
                }
            }
        }

        return {
            fullAnswer,
            texts,
            images,
            videos,
            hasError,
        };
    }

    private static handleReasoningPart(part: any, isFirstReasoning: boolean) {
        const isFirst = isFirstReasoning;
        let text = '';

        if (isFirst) {
            text += '> ';
        }

        text += part.textDelta.replace(/\n/g, '\n> ');

        return { text, isFirst };
    }

    private static handleTextDelta(part: any, isFirstReasoning: boolean, reasoningEnded: boolean) {
        let text = '';
        let needsSeparator = false;

        if (!isFirstReasoning && !reasoningEnded) {
            text += '\n\n';
            needsSeparator = true;
        }

        text += part.textDelta;

        return { text, needsSeparator };
    }

    static async postProcess(
        messages: StoreMessage[],
        query: string,
        result: LLMResult,
        userId: string,
        onStream?: (...args: any[]) => void,
        source = SearchCategory.ALL,
    ): Promise<void> {
        if (!messages[0].title) {
            const title = await generateTitle(query);
            messages[0].title = title;
            await streamResponse({ title: title }, onStream);
        }

        await saveMessages(userId, messages, result.fullAnswer, result.texts || [], result.images || [], result.videos || [], result.related || '', source);

        indexMessage(userId, messages[0].title, messages[0].id, query + '\n\n' + result.fullAnswer).catch((error) => {
            console.error(`Failed to index message for user ${userId}:`, error);
        });
    }

    static async execute(config: LLMConfig, handler: StreamHandler, messages: StoreMessage[], userId: string, source = SearchCategory.ALL): Promise<void> {
        try {
            const streamConfig = this.buildStreamConfig(config);
            const result = await streamText(streamConfig);
            const query = messages[messages.length - 1].content;
            const llmResult = await this.handleStreamResponse(result, handler);

            if (!llmResult.hasError) {
                await this.postProcess(messages, query, llmResult, userId, handler.onStatus, source);
            }
        } catch (error) {
            console.error('LLM execution error:', error);
            const errorMessage = extractErrorMessage(error);
            logError(new Error(errorMessage), `llm-${config.modelName}`);
            handler.onError?.(errorMessage);
        }
    }
}
