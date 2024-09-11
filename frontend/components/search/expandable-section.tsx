'use client';

import { Minus, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ExpandableSection = ({ title, icon: Icon, children, open = true }) => {
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        if (!open) {
            return;
        }
        const checkScreenSize = () => setIsOpen(window.innerWidth >= 768);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [open]);

    return (
        <div className="w-full">
            <details open={isOpen} className="w-full">
                <summary
                    className="flex w-full cursor-pointer items-center justify-between mb-2"
                    onClick={(e) => {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }}
                >
                    <div className="flex items-center space-x-2">
                        <Icon className="text-primary size-22" />
                        <h3 className="py-2 text-lg font-bold text-primary">{title}</h3>
                    </div>
                    <div className="ml-auto">{isOpen ? <Minus className="text-primary size-22" /> : <Plus className="text-primary size-22" />}</div>
                </summary>
                {isOpen && children}
            </details>
        </div>
    );
};

export default ExpandableSection;
