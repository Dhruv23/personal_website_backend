'use client';

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { useConfig } from "../contexts/ConfigContext";

export const ParticlesBackground = () => {
    const { config } = useConfig();
    const { weather } = config.theme.effects;

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    if (!weather || weather === 'none') return null;

    const getOptions = (mode: string): any => {
        switch (mode) {
            case 'snow':
                return {
                    particles: {
                        color: { value: "#ffffff" },
                        move: {
                            direction: "bottom",
                            enable: true,
                            outModes: { default: "out" },
                            speed: 2,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 100,
                        },
                        opacity: { value: 0.5 },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 3 } },
                    },
                };
            case 'cherry':
                return {
                    particles: {
                        color: { value: "#ffb7b2" },
                        move: {
                            direction: "bottom-right",
                            enable: true,
                            outModes: { default: "out" },
                            speed: 2,
                            random: true,
                            straight: false,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 50,
                        },
                        opacity: { value: 0.8 },
                        shape: { type: "circle" }, // Should be image or petal shape ideally, but circle works
                        size: { value: { min: 3, max: 6 } },
                        wobble: { enable: true, distance: 10, speed: 10 },
                    },
                };
            case 'matrix':
                return {
                    particles: {
                        color: { value: "#00ff00" },
                        move: {
                            direction: "bottom",
                            enable: true,
                            outModes: { default: "out" },
                            speed: 15,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 150,
                        },
                        opacity: { value: 0.8 },
                        shape: { type: "square" }, // Using square for 'digital' look
                        size: { value: 3 },
                    },
                };
            default:
                return {};
        }
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={getOptions(weather)}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    );
};
