import Particles from "react-tsparticles";
import React from "react";

export default function Confetti() {
  async function particlesInit(main: any) {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async function particlesLoaded(container: any) {}

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fullScreen: {
          enable: true,
        },
        particles: {
          number: {
            value: 1000,
          },
          color: {
            value: ["#1E00FF", "#FF0061", "#E1FF00", "#00FF9E"],
          },
          shape: {
            type: ["square"],
          },
          opacity: {
            value: {
              max: 1,
              min: 0,
            },
            animation: {
              enable: true,
              speed: 5,
              startValue: "max",
              destroy: "min",
            },
          },
          size: {
            value: { min: 3, max: 7 },
          },
          life: {
            duration: {
              sync: true,
              value: 5,
            },
            count: 1,
          },
          move: {
            enable: true,
            gravity: {
              enable: true,
              acceleration: 30,
            },
            speed: {
              min: 25,
              max: 50,
            },
            drift: {
              min: -2,
              max: 5,
            },
            decay: 0.05,
            direction: "none",
            outModes: {
              default: "destroy",
              top: "bounceHorizontal",
            },
          },
          rotate: {
            value: {
              min: 0,
              max: 360,
            },
            direction: "random",
            animation: {
              enable: true,
              speed: 60,
            },
          },
          tilt: {
            direction: "random",
            enable: true,
            value: {
              min: 0,
              max: 360,
            },
            animation: {
              enable: true,
              speed: 60,
            },
          },
          roll: {
            darken: {
              enable: true,
              value: 25,
            },
            enable: true,
            speed: {
              min: 15,
              max: 25,
            },
          },
          wobble: {
            distance: 30,
            enable: true,
            speed: {
              min: -15,
              max: 15,
            },
          },
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            resize: true,
          },
        },
        detectRetina: true,
        responsive: [
          {
            maxWidth: 700,
            options: {
              particles: {
                move: {
                  speed: 50,
                  decay: 0.1,
                },
              },
              emitters: [
                {
                  direction: "top-right",
                  rate: {
                    delay: 0.1,
                    quantity: 20,
                  },
                  position: {
                    x: 0,
                    y: 50,
                  },
                  size: {
                    width: 0,
                    height: 0,
                  },
                  life: {
                    duration: 0.1,
                    count: 20,
                  },
                },
                {
                  direction: "top-left",
                  rate: {
                    delay: 0.1,
                    quantity: 20,
                  },
                  position: {
                    x: 100,
                    y: 50,
                  },
                  size: {
                    width: 0,
                    height: 0,
                  },
                  life: {
                    duration: 0.1,
                    count: 20,
                  },
                },
              ],
            },
          },
        ],
        emitters: [
          {
            direction: "top-right",
            rate: {
              delay: 0.1,
              quantity: 50,
            },
            position: {
              x: 0,
              y: 50,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.1,
              count: 10,
            },
          },
          {
            direction: "top-left",
            rate: {
              delay: 0.1,
              quantity: 50,
            },
            position: {
              x: 100,
              y: 50,
            },
            size: {
              width: 0,
              height: 0,
            },
            life: {
              duration: 0.1,
              count: 10,
            },
          },
        ],
      }}
    />
  );
}
