import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Box } from 'lucide-react';
import { useModelStore, useUserStore } from '@/lib/store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import {
    Claude_35_Sonnet,
    GEMINI_FLASH,
    GEMINI_PRO,
    GPT_4o,
    GPT_4o_MIMI,
    LLAMA_31_70B,
} from '@/lib/model';
import { checkIsPro } from '@/lib/shared-utils';
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
    // [GEMINI_FLASH]: {
    //     name: 'Gemini 1.5 Flash',
    //     value: GEMINI_FLASH,
    // },
    // [LLAMA_31_70B]: {
    //     name: 'LLAMA 3.1 70B',
    //     value: LLAMA_31_70B,
    // },
    [GPT_4o]: {
        name: 'GPT-4o',
        flag: 'Pro',
        value: GPT_4o,
    },
    [GEMINI_PRO]: {
        name: 'Gemini 1.5 Pro',
        flag: 'Pro',
        value: GEMINI_PRO,
    },
    [Claude_35_Sonnet]: {
        name: 'Claude 3.5 Sonnet',
        flag: 'Pro',
        value: Claude_35_Sonnet,
    },
};

const ModelItem: React.FC<{ model: Model }> = ({ model }) => (
    <SelectItem
        key={model.value}
        value={model.value}
        className="w-full p-2 block"
    >
        <div className="flex w-full justify-between">
            <span className="text-md">{model.name}</span>
            <span
                className={`text-xs flex items-center justify-center ${model.flag === 'Pro' ? ' text-primary bg-purple-300 rounded-xl px-2' : ''}`}
            >
                {model.flag}
            </span>
        </div>
    </SelectItem>
);

export function ModelSelection() {
    const { model, setModel, initModel } = useModelStore();
    const selectedModel = modelMap[model] ?? modelMap[GPT_4o_MIMI];

    React.useEffect(() => {
        const initialModel = initModel();
        if (initialModel && initialModel !== model) {
            setModel(initialModel);
        }
    }, [model, initModel, setModel]);

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
                        if (!checkIsPro(user)) {
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
            <SelectTrigger
                aria-label="AI Model"
                className="focus:ring-0 border-none outline-none"
            >
                <SelectValue>
                    <div className="flex items-center space-x-1">
                        <Box></Box>
                        <span className="font-semibold">
                            {' '}
                            {selectedModel.name}
                        </span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full">
                {Object.values(modelMap).map((model) => (
                    <ModelItem key={model.value} model={model} />
                ))}
            </SelectContent>
        </Select>
    );
}
