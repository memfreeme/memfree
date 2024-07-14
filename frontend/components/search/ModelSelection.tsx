import * as React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Box } from 'lucide-react';
import { useConfigStore } from '@/lib/store';
import { useSigninModal } from '@/hooks/use-signin-modal';
import { useUser } from '@/hooks/use-user';

type Model = {
    name: string;
    description: string;
    value: string;
};

export const modelMap: Record<string, Model> = {
    'gpt-3.5': {
        name: 'GPT-3.5',
        description: 'Default',
        value: 'gpt3',
    },
    'gpt4': {
        name: 'GPT-4o',
        description: 'Powerful',
        value: 'gpt4',
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
    const { model, setModel, initModel } = useConfigStore();
    const selectedModel = modelMap[model] ?? modelMap['gpt-3.5'];

    React.useEffect(() => {
        const initialModel = initModel();
        if (initialModel && initialModel !== model) {
            setModel(initialModel);
        }
    }, []);

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
                    } else {
                        setModel(value);
                    }
                }
            }}
        >
            <SelectTrigger className="focus:ring-0 border-none outline-none">
                <SelectValue>
                    <div className="flex items-center space-x-2">
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
