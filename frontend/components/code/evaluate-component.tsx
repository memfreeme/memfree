import React from 'react';
import { ComponentType } from 'react';

import * as LucideIcons from 'lucide-react';
import * as ShadcnUI from '@/components/ui';

const createRequire = () => {
    return (moduleName: string) => {
        if (moduleName === 'react') return React;
        if (moduleName === 'lucide-react') return LucideIcons;

        if (moduleName.startsWith('@/components/ui/')) {
            return ShadcnUI;
        }

        throw new Error(`Module ${moduleName} not found`);
    };
};

export interface ExecuteCodeResult {
  default: ComponentType<any>;
}

export const evaluateComponentCode = (code: string): ExecuteCodeResult => {
    const exports: { default?: React.ComponentType<any> } = {};
    const require = createRequire();

    try {
        new Function('exports', 'require', 'React', code)(exports, require, React);
    } catch (error) {
        throw new Error(`Error evaluating component code: ${error instanceof Error ? error.message : String(error)}`);
    }

    return exports as ExecuteCodeResult;
};
