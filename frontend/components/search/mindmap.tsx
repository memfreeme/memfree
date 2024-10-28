'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Camera } from 'lucide-react';
import { useScreenshotCapture } from '@/hooks/use-screenshot-capture';

let transformer: any = null;
let Markmap: any = null;

export default function MindMap({ value }) {
    const refSvg = useRef<SVGSVGElement>();
    const refMm = useRef<any>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMarkmapLoading, setMarkmapIsLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const updateMarkmap = async () => {
            if (!refMm.current) {
                try {
                    if (!Markmap) {
                        const markmapModule = await import('markmap-view');
                        Markmap = markmapModule.Markmap;
                    }
                    const mm = Markmap.create(refSvg.current);
                    refMm.current = mm;
                    setMarkmapIsLoading(true);
                } catch (error) {
                    console.error('Error creating Markmap:', error);
                }
            }
        };
        updateMarkmap();
    }, []);

    useEffect(() => {
        const mm = refMm.current;
        if (!mm || !value) return;

        const updateMarkmap = async () => {
            try {
                if (!transformer) {
                    const markmapModule = await import('@/lib/markmap');
                    transformer = markmapModule.transformer;
                }
                const { root } = transformer.transform(value);
                mm.setData(root);
                mm.fit();
            } catch (error) {
                console.error('Error updating Markmap data:', error);
            }
        };
        updateMarkmap();
    }, [value, isMarkmapLoading]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (refMm.current && refSvg.current) {
                refSvg.current.setAttribute('width', '100%');
                refSvg.current.setAttribute('height', '100%');
                refMm.current.fit();
            }
        }, 100);
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const { isGeneratingScreenshot, captureScreenshot } = useScreenshotCapture({
        containerRef,
        filename: 'memfree-mindmap.png',
        scale: 2,
        removeButtons: true,
        additionalPadding: '2rem',
    });

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-80 rounded-xl border border-purple-500 ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen bg-white' : ''}`}
        >
            <svg width="100%" height="100%" ref={refSvg} className="size-full" />
            <button
                onClick={captureScreenshot}
                disabled={isGeneratingScreenshot}
                aria-label="Capture screenshot"
                className="absolute bottom-2 right-10 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
                <Camera size={12} />
            </button>
            <button
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="absolute bottom-2 right-2 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
        </div>
    );
}
