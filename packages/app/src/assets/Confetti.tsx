import Particles from "react-tsparticles";
import React from "react";

export default function Confetti() {
  const particlesInit = (main: any) => {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  };

  const particlesLoaded = (container: any) => {
    console.log(container);
  };

  return (
     // @ts-ignore
    <Particles
      id="tsparticles"
      // @ts-ignore
      init={particlesInit}
      // @ts-ignore
      loaded={particlesLoaded}
      options={{
        fullScreen: {
          enable: true,
        },
        particles: {
          number: {
            value: 200,
          },
          color: {
            value: ["#41871e", "#d70d57", "#E1FF00", "#00FF9E"],
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
              acceleration: 10,
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
                    quantity: 10,
                  },
                  position: {
                    x: 0,
                    y: 100,
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
                    quantity: 10,
                  },
                  position: {
                    x: 0,
                    y: 100,
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
              quantity: 10,
            },
            position: {
              x: 0,
              y: 100,
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
              quantity: 10,
            },
            position: {
              x: 0,
              y: 100,
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
