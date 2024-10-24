import React from 'react';
import { ComponentType } from 'react';

import * as LucideIcons from 'lucide-react';
import * as ShadcnUI from '@/components/ui';
import * as Recharts from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import {
    motion,
    AnimatePresence,
    useAnimation,
    useMotionValue,
    useTransform,
    useCycle,
    useInView,
    useScroll,
    useSpring,
    animate,
    MotionConfig,
    useDragControls,
    useMotionTemplate,
    LayoutGroup,
    Reorder,
} from 'framer-motion';

const moduleMap = {
    'react': React,
    'lucide-react': LucideIcons,
    'recharts': Recharts,
    'next/link': Link,
    '@/lib/utils': { cn },
    'date-fns': { format },
    'framer-motion': {
        motion,
        AnimatePresence,
        useAnimation,
        useMotionValue,
        useTransform,
        useCycle,
        useInView,
        useScroll,
        useSpring,
        animate,
        MotionConfig,
        useDragControls,
        useMotionTemplate,
        LayoutGroup,
        Reorder,
    },
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

type ImportCheckResult = { isValid: boolean; message: string };

const IMPORT_CONFIGS = [
    { regex: /import\s*{([^}]+)}\s*from\s*['"]recharts['"]/, lib: Recharts, name: 'Recharts' },
    { regex: /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/, lib: LucideIcons, name: 'lucide-react', filter: (item: string) => !item.includes('Props') },
    {
        regex: /import\s*{([^}]+)}\s*from\s*['"]@\/components\/ui(?:\/[^'"]+)?['"]/g,
        lib: ShadcnUI,
        name: 'ShadcnUI',
        filter: (item: string) => item !== '',
        multipleMatches: true,
    },
];

export function checkImports(codeString: string): ImportCheckResult {
    for (const config of IMPORT_CONFIGS) {
        const { regex, lib, name, filter, multipleMatches } = config;
        const matches = multipleMatches ? Array.from(codeString.matchAll(regex)) : [codeString.match(regex)];

        const allImports = new Set<string>();
        matches.forEach((match) => {
            if (match) {
                match[1]
                    .split(',')
                    .map((item) => item.trim())
                    .filter((item) => !filter || filter(item))
                    .forEach((item) => allImports.add(item));
            }
        });

        if (allImports.size > 0) {
            const invalidImports = Array.from(allImports).filter((item) => !(item in lib || item.length === 0));
            if (invalidImports.length > 0) {
                return {
                    isValid: false,
                    message: `The following ${name} components or icons are not valid: ${invalidImports.join(', ')}`,
                };
            }
        }
    }
    return { isValid: true, message: '' };
}
