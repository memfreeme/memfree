'use client';

import React, { useRef, useEffect, useState } from 'react';

let transformer: any = null;
let Markmap: any = null;

export default function MindMap({ value }) {
    const refSvg = useRef<SVGSVGElement>();
    const refMm = useRef<any>();
    const [isMarkmapLoading, setMarkmapIsLoading] = useState(false);

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

    return (
        <div className="w-full h-80 rounded-xl border border-purple-500">
            <svg width={640} height={320} ref={refSvg} className="size-full" />
        </div>
    );
}
