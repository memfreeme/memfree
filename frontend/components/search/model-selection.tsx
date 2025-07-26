import * as React from 'react';

import { RowSelectItem, Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box } from 'lucide-react';
import { useModelStore, useUserStore } from '@/lib/store/local-store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { GPT_41_NANO, DEEPSEEK_R1, GEMIMI_25, GPT_41, O3, O4_MIMI, Claude_4, Claude_4_Thinking, QWEN3_CODER } from '@/lib/llm/model';
import { isProUser, isPremiumUser } from '@/lib/shared-utils';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';

type Model = {
    name: string;
    value: string;
    flag?: string;
};

export const modelMap: Record<string, Model> = {
    [GPT_41_NANO]: {
        name: 'GPT-4.1 nano',
        value: GPT_41_NANO,
    },
    [Claude_4]: {
        name: 'Claude Sonnet 4',
        flag: 'Pro',
        value: Claude_4,
    },
    [Claude_4_Thinking]: {
        name: 'Claude Sonnet 4 Thinking',
        flag: 'Pro',
        value: Claude_4_Thinking,
    },
    [QWEN3_CODER]: {
        name: 'Qwen3 Coder Plus',
        flag: 'New & Pro',
        value: QWEN3_CODER,
    },
    [DEEPSEEK_R1]: {
        name: 'DeepSeek R1',
        flag: 'Pro',
        value: DEEPSEEK_R1,
    },
    [O4_MIMI]: {
        name: 'O4 Mini',
        flag: 'Pro',
        value: O4_MIMI,
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
    const selectedModel = modelMap[model] ?? modelMap[GPT_41_NANO];

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
