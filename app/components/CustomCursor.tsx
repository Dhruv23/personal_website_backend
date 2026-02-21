'use client';
import { useEffect, useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';

export const CustomCursor = () => {
    const { config } = useConfig();
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [clicking, setClicking] = useState(false);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button'))) {
                setHovering(true);
            } else {
                setHovering(false);
            }
        };
        const mouseDown = () => setClicking(true);
        const mouseUp = () => setClicking(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', mouseDown);
        window.addEventListener('mouseup', mouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', mouseDown);
            window.removeEventListener('mouseup', mouseUp);
        };
    }, []);

    if (!config.theme.customCursorUrl) return null;

    return (
        <>
            <style jsx global>{`
                body, a, button, input, [role="button"] { cursor: none !important; }
            `}</style>
            <div
                className="fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out flex items-center justify-center"
                style={{
                    left: position.x,
                    top: position.y,
                    transform: `translate(-50%, -50%) scale(${clicking ? 0.8 : 1})`,
                }}
            >
                <img
                    src={config.theme.customCursorUrl}
                    className={`w-8 h-8 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)] transition-all duration-300 ${hovering ? 'scale-150 rotate-12' : ''}`}
                    alt="cursor"
                />
            </div>
        </>
    );
}
