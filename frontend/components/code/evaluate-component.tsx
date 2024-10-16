import React from 'react';
import { ComponentType } from 'react';

import * as LucideIcons from 'lucide-react';
import * as ShadcnUI from '@/components/ui';
import * as Recharts from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

const moduleMap = {
    'react': React,
    'lucide-react': LucideIcons,
    'recharts': Recharts,
    'next/link': Link,
    '@/lib/utils': { cn },
    'date-fns': { format },
};
const createRequire = () => {
    return (moduleName: string) => {
        if (moduleName in moduleMap) {
            return moduleMap[moduleName as keyof typeof moduleMap];
        }

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
    const exports = {} as ExecuteCodeResult;
    const require = createRequire();

    try {
        new Function('exports', 'require', 'React', code)(exports, require, React);
    } catch (error) {
        throw new Error(`Error evaluating component code: ${error instanceof Error ? error.message : String(error)}`);
    }

    return exports as ExecuteCodeResult;
};

export function checkLucideImports(codeString) {
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/;
    const match = codeString.match(importRegex);

    if (!match) {
        return { isValid: true, message: '' };
    }

    const allImports = match[1].split(',').map((icon) => icon.trim());
    const importedIcons = allImports.filter((item) => !item.includes('Props'));

    const invalidIcons = importedIcons.filter((icon) => !(icon in LucideIcons));

    const isValid = invalidIcons.length === 0;
    const message = isValid ? ' ' : `The following lucide-react icons are not valid: ${invalidIcons.join(', ')}`;
    return { isValid, message };
}
