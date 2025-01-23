import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from 'tsparticles-engine';

export function SnowfallBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <>
      {/* Original background image */}
      <div 
        className="absolute inset-0 bg-[url('https://jpvvgmvvdfsiruthfkhb.supabase.co/storage/v1/object/public/images/Website%20Design%20Images/LightShowVault%20Darker%20Background.svg?t=2025-01-21T15%3A48%3A42.034Z')] bg-cover bg-center bg-no-repeat"
        style={{ opacity: 0.95 }}
      />
      
      {/* Particles Container */}
      <Particles
        id="snowflakes"
        init={particlesInit}
        className="absolute inset-0 mix-blend-screen"
        options={{
          particles: {
            number: {
              value: 800,
              density: {
                enable: true,
                value_area: 800
              }
            },
            move: {
              enable: true,
              speed: 1.2,
              direction: "bottom",
              random: false,
              straight: false,
              outModes: {
                default: "out"
              }
            },
            shape: {
              type: "images",
              images: [
                {
                  src: "https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/image.svg",
                  width: 32,
                  height: 32
                },
                {
                  src: "https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/image%20(1).svg",
                  width: 32,
                  height: 32
                },
                {
                  src: "https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/image%20(2).svg?t=2025-01-14T18%3A59%3A36.180Z",
                  width: 32,
                  height: 32
                },
                {
                  src: "https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/image%20(3).svg?t=2025-01-14T19%3A37%3A38.647Z",
                  width: 4,
                  height: 4
                },
                {
                  src: "https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/image%20(3).svg?t=2025-01-14T19%3A37%3A38.647Z",
                  width: 4,
                  height: 4
                }
              ]
            },
            size: {
              value: 4,
              random: {
                enable: true,
                minimumValue: 1,
                maximumValue: 4
              }
            },
            opacity: {
              value: 0.6,
              random: {
                enable: true,
                minimumValue: 0.5
              },
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.4,
                sync: false
              }
            },
            rotate: {
              value: 0,
              random: true,
              direction: "clockwise",
              animation: {
                enable: true,
                speed: 10,
                sync: false
              }
            },
            color: {
              value: "#ffffff"
            }
          },
          background: {
            opacity: 0
          },
          detectRetina: true
        }}
      />

      {/* Santa sleigh */}
      <img
        src="https://zfbbsojuwnyjstzqymzl.supabase.co/storage/v1/object/public/backgrounds/NOEL%20(1).svg"
        alt="Santa Sleigh"
        className="hidden md:block z-20"
        style={{ 
          position: 'absolute', 
          top: '80%', 
          left: '-150px', 
          width: '104px', 
          height: '49px', 
          pointerEvents: 'none', 
          animation: 'moveSleigh 30s linear infinite', 
          filter: 'brightness(0) invert(1)', 
          opacity: 0.3
        }} 
      />

      {/* Add CSS for the sleigh animation */}
      <style>
        {`
          @keyframes moveSleigh {
            0% {
              left: -150px;
              top: 80%;
            }
            100% {
              left: calc(100% - 104px);
              top: -0.01%;
            }
          }
        `}
      </style>
    </>
  );
}