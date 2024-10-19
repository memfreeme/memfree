import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ButtonProps } from '@/components/ui/button';

interface IconButtonProps extends ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    tooltipText: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, children, tooltipText, ...props }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button size="icon" variant="outline" className="[&_svg]-h-3.5 size-7 rounded-[6px] [&_svg]:w-3.5" onClick={onClick} {...props}>
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent className="font-bold">{tooltipText}</TooltipContent>
        </Tooltip>
    );
};

export default IconButton;
