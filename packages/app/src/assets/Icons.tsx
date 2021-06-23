import React from "react";
import { createIcon } from "@chakra-ui/icons";

// pass path as an array of elements, if you have multiple paths, lines, shapes, etc.
// Use https://jakearchibald.github.io/svgomg/ to reduce the size and minify the markup.

export const CoinbaseIcon = createIcon({
  displayName: "CoinbaseIcon",
  viewBox: "0 0 30 30",
  path: [
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15z"
      fill="url(#paint0_linear)"
    />,
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.162 15a8.838 8.838 0 1117.676 0 8.838 8.838 0 01-17.676 0zm6.58 2.848a.59.59 0 01-.59-.59v-4.516a.59.59 0 01.59-.59h4.517a.59.59 0 01.589.59v4.517a.59.59 0 01-.59.589h-4.516z"
      fill="#fff"
    />,
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="15"
        y1="30"
        x2="15"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#2E66F8" />
        <stop offset="1" stop-color="#124ADB" />
      </linearGradient>
    </defs>,
  ],
});

export const MetaMaskIcon = createIcon({
  displayName: "MetaMaskIcon",
  viewBox: "0 0 30 30",
  path: [
    <path
      d="M28.423 1.18L16.789 9.82l2.151-5.098 9.483-3.542z"
      fill="#E2761B"
      stroke="#E2761B"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M1.565 1.18l11.54 8.722-2.045-5.18L1.565 1.18zM24.237 21.209l-3.098 4.747 6.63 1.824 1.905-6.466-5.437-.105zM.338 21.314l1.894 6.466 6.63-1.824-3.1-4.747-5.424.105z"
      fill="#E4761B"
      stroke="#E4761B"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M8.487 13.188L6.64 15.982l6.583.293-.234-7.074-4.502 3.987zM21.5 13.188l-4.56-4.07-.151 7.156 6.571-.292-1.86-2.794zM8.861 25.956l3.952-1.93L9.4 21.362l-.538 4.595zM17.175 24.027l3.963 1.929-.549-4.595-3.414 2.666z"
      fill="#E4761B"
      stroke="#E4761B"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M21.139 25.956l-3.964-1.93.316 2.585-.036 1.087 3.684-1.742zM8.861 25.956l3.684 1.742-.024-1.087.292-2.584-3.952 1.929z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M12.603 19.654l-3.297-.97 2.327-1.065.97 2.035zM17.385 19.654l.97-2.035 2.34 1.064-3.31.97z"
      fill="#233447"
      stroke="#233447"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M8.861 25.956l.562-4.747-3.66.105 3.098 4.642zM20.577 21.209l.561 4.747 3.099-4.642-3.66-.105zM23.36 15.982l-6.571.293.608 3.379.97-2.035 2.339 1.064 2.654-2.7zM9.305 18.683l2.338-1.064.96 2.035.619-3.38-6.583-.292 2.666 2.701z"
      fill="#CD6116"
      stroke="#CD6116"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M6.64 15.982l2.76 5.379-.094-2.678-2.666-2.7zM20.706 18.683l-.117 2.678 2.771-5.379-2.654 2.701zM13.223 16.274l-.62 3.38.772 3.987.175-5.25-.327-2.116zM16.789 16.274l-.316 2.105.14 5.262.784-3.987-.608-3.38z"
      fill="#E4751F"
      stroke="#E4751F"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M17.397 19.654l-.784 3.987.562.386 3.414-2.666.117-2.678-3.31.97zM9.306 18.683l.093 2.678 3.415 2.666.56-.386-.771-3.987-3.297-.97z"
      fill="#F6851B"
      stroke="#F6851B"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M17.455 27.698l.036-1.087-.293-.258H12.79l-.269.258.024 1.087-3.684-1.742 1.287 1.052 2.607 1.813h4.478l2.62-1.813 1.285-1.052-3.683 1.742z"
      fill="#C0AD9E"
      stroke="#C0AD9E"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M17.175 24.027l-.562-.386h-3.238l-.562.386-.292 2.584.269-.258h4.408l.292.258-.315-2.584z"
      fill="#161616"
      stroke="#161616"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M28.914 10.382l.994-4.771-1.485-4.431-11.248 8.348 4.326 3.66 6.115 1.789 1.357-1.579-.585-.42.935-.854-.725-.562.936-.713-.62-.467zM.092 5.611l.994 4.77-.631.468.935.713-.713.562.935.853-.585.421 1.345 1.579 6.115-1.79 4.326-3.66L1.566 1.18.092 5.61z"
      fill="#763D16"
      stroke="#763D16"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
    <path
      d="M27.616 14.977l-6.115-1.79 1.86 2.795-2.772 5.379 3.648-.047h5.437l-2.058-6.337zM8.487 13.188l-6.115 1.789-2.034 6.337h5.425l3.636.047-2.76-5.379 1.848-2.794zM16.789 16.274l.386-6.746 1.777-4.806H11.06l1.753 4.806.41 6.746.14 2.128.012 5.239h3.238l.024-5.238.152-2.128z"
      fill="#F6851B"
      stroke="#F6851B"
      stroke-width=".117"
      stroke-linecap="round"
      stroke-linejoin="round"
    />,
  ],
});

export const LedgerIcon = createIcon({
  displayName: "LedgerIcon",
  viewBox: "0 0 30 30",
  path: [
    <path
      d="M25.086.202H11.474V18.47h18.269V4.955c.007-2.567-2.09-4.753-4.657-4.753zm-17.792 0H5.01C2.444.202.25 2.292.25 4.962v2.284h7.044V.202zM.25 11.522h7.044v7.045H.25v-7.044zm22.456 18.269h2.284c2.566 0 4.76-2.09 4.76-4.76v-2.277h-7.044v7.037zm-11.232-7.037h7.044v7.044h-7.044v-7.044zm-11.224 0v2.284c0 2.566 2.09 4.76 4.76 4.76h2.284v-7.044H.25z"
      fill="#000"
    />,
  ],
});

export const WalletConnectIcon = createIcon({
  displayName: "WalletConnectIcon",
  viewBox: "0 0 300 185",
  path: [
    <path
      d="M61.439 36.256c48.91-47.888 128.212-47.888 177.123 0l5.886 5.764a6.041 6.041 0 010 8.67l-20.136 19.716a3.179 3.179 0 01-4.428 0l-8.101-7.931c-34.122-33.408-89.444-33.408-123.566 0l-8.675 8.494a3.179 3.179 0 01-4.428 0L54.978 51.253a6.041 6.041 0 010-8.67l6.46-6.327zM280.206 77.03l17.922 17.547a6.041 6.041 0 010 8.67l-80.81 79.122c-2.446 2.394-6.41 2.394-8.856 0l-57.354-56.155a1.59 1.59 0 00-2.214 0L91.54 182.37c-2.446 2.394-6.411 2.394-8.857 0L1.872 103.247a6.041 6.041 0 010-8.671l17.922-17.547c2.445-2.394 6.41-2.394 8.856 0l57.355 56.155a1.59 1.59 0 002.214 0L145.57 77.03c2.446-2.394 6.41-2.395 8.856 0l57.355 56.155a1.59 1.59 0 002.214 0L271.35 77.03c2.446-2.394 6.41-2.394 8.856 0z"
      fill="#3B99FC"
      fill-rule="nonzero"
    />,
  ],
});
