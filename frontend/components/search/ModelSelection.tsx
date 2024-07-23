import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Box } from 'lucide-react';
import { useModelStore } from '@/lib/store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUser } from '@/hooks/use-user';
import { Claude_35_Sonnet, GPT_4o, GPT_4o_MIMI } from '@/lib/model';

type Model = {
    name: string;
    description: string;
    value: string;
};

export const modelMap: Record<string, Model> = {
    [GPT_4o_MIMI]: {
        name: 'GPT-4o-mini',
        description: 'Default',
        value: GPT_4o_MIMI,
    },
    [GPT_4o]: {
        name: 'GPT-4o',
        description: 'Powerful',
        value: GPT_4o,
    },
    [Claude_35_Sonnet]: {
        name: 'Claude-3.5-Sonnet',
        description: 'Expert in Coding',
        value: Claude_35_Sonnet,
    },
};

const ModelItem: React.FC<{ model: Model }> = ({ model }) => (
    <SelectItem
        key={model.value}
        value={model.value}
        className="w-full p-2 block"
    >
        <div className="flex w-full space-x-5 justify-between">
            <span
                className="font-bold text-primary"
                style={{ whiteSpace: 'nowrap' }}
            >
                {model.description}
            </span>
            <span className="text-muted-foreground">{model.name}</span>
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
    }, [model]);

    const signInModal = useSigninModal();
    const user = useUser();

    return (
        <Select
            defaultValue={model}
            value={model}
            onValueChange={(value) => {
                if (value) {
                    if (!user) {
                        signInModal.onOpen();
                    } else if (value !== model) {
                        setModel(value);
                    }
                }
            }}
        >
            <SelectTrigger className="focus:ring-0 border-none outline-none">
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
