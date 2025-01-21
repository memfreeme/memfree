import * as React from 'react';

import { RowSelectItem, Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box } from 'lucide-react';
import { useModelStore, useUserStore } from '@/lib/store/local-store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { Claude_35_Haiku, Claude_35_Sonnet, DEEPSEEK, DEEPSEEK_R1, GEMIMI_2, GPT_4o, GPT_4o_MIMI, O1_MIMI, O1_PREVIEW } from '@/lib/llm/model';
import { isProUser, isPremiumUser } from '@/lib/shared-utils';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';

type Model = {
    name: string;
    value: string;
    flag?: string;
};

export const modelMap: Record<string, Model> = {
    [GPT_4o_MIMI]: {
        name: 'GPT-4o mini',
        value: GPT_4o_MIMI,
    },
    [DEEPSEEK]: {
        name: 'DeepSeek V3',
        flag: 'New',
        value: DEEPSEEK,
    },
    [GPT_4o]: {
        name: 'GPT-4o',
        flag: 'Pro',
        value: GPT_4o,
    },
    [Claude_35_Haiku]: {
        name: 'Claude 3.5 Haiku',
        flag: 'Pro',
        value: Claude_35_Haiku,
    },
    [Claude_35_Sonnet]: {
        name: 'Claude 3.5 Sonnet',
        flag: 'Pro',
        value: Claude_35_Sonnet,
    },
    [GEMIMI_2]: {
        name: 'Gemini 2.0',
        flag: 'Pro',
        value: GEMIMI_2,
    },
    [DEEPSEEK_R1]: {
        name: 'DeepSeek R1',
        flag: 'New & Pro',
        value: DEEPSEEK_R1,
    },
    [O1_MIMI]: {
        name: 'O1-Mini',
        flag: 'Pro',
        value: O1_MIMI,
    },
    [O1_PREVIEW]: {
        name: 'O1-Preview',
        flag: 'Premium',
        value: O1_PREVIEW,
    },
};

const getFlagClassName = (flag: string) => {
    if (!flag) {
        return '';
    }
    if (flag?.toLowerCase().includes('new')) {
        return 'text-green-600 bg-green-200 rounded-xl px-2';
    }
    if (flag === 'Pro' || flag === 'Premium') {
        return 'text-primary bg-purple-300 rounded-xl px-2';
    }
};

const ModelItem: React.FC<{ model: Model }> = ({ model }) => (
    <RowSelectItem key={model.value} value={model.value} className="w-full p-2 block">
        <div className="flex w-full justify-between">
            <span className="text-md mr-2">{model.name}</span>
            <span className={`text-xs flex items-center justify-center ${getFlagClassName(model.flag)}`}>{model.flag}</span>
        </div>
    </RowSelectItem>
);

export function ModelSelection() {
    const { model, setModel } = useModelStore();
    const selectedModel = modelMap[model] ?? modelMap[GPT_4o_MIMI];

    const signInModal = useSigninModal();
    const upgradeModal = useUpgradeModal();
    const user = useUserStore((state) => state.user);

    return (
        <Select
            defaultValue={model}
            value={model}
            onValueChange={(value) => {
                if (value) {
                    if (!user) {
                        signInModal.onOpen();
                    } else if (modelMap[value].flag === 'Pro') {
                        if (!isProUser(user)) {
                            upgradeModal.onOpen();
                        } else if (value !== model) {
                            setModel(value);
                        }
                    } else if (modelMap[value].flag === 'Premium') {
                        if (!isPremiumUser(user)) {
                            upgradeModal.onOpen();
                        } else if (value !== model) {
                            setModel(value);
                        }
                    } else if (value !== model) {
                        setModel(value);
                    }
                }
            }}
        >
            <SelectTrigger aria-label="AI Model" className="focus:ring-0 border-none outline-none">
                <SelectValue>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                        <Box></Box>
                        <span className="font-semibold"> {selectedModel.name}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {Object.values(modelMap).map((model) => (
                    <ModelItem key={model.value} model={model} />
                ))}
            </SelectContent>
        </Select>
    );
}
