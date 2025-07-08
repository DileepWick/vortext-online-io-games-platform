import React, { useState, useEffect } from "react";

const LogoLoader = ({ isLoading: externalIsLoading = true }) => {
  const [progress, setProgress] = useState(0);
  const [internalIsLoading, setInternalIsLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reset animation when external loading state changes
  useEffect(() => {
    if (externalIsLoading) {
      setProgress(0);
      setInternalIsLoading(true);
      setAnimationComplete(false);
    }
  }, [externalIsLoading]);

  // Handle the animation progress
  useEffect(() => {
    let interval;

    if (internalIsLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setAnimationComplete(true);

            // Check if external loading is still happening
            if (externalIsLoading) {
              // Restart animation
              return 0;
            } else {
              setInternalIsLoading(false);
              clearInterval(interval);
              return 100;
            }
          }
          return prev + 1;
        });
      }, 25);
    }

    return () => clearInterval(interval);
  }, [internalIsLoading, externalIsLoading]);

  // Handle case where external loading finishes before animation
  useEffect(() => {
    if (!externalIsLoading && progress >= 100) {
      setInternalIsLoading(false);
    }
  }, [externalIsLoading, progress]);

  return (
    <div className="flex flex-col items-center justify-center backdrop-blur-md min-h-screen">
      <div className="flex flex-col items-center">
        {/* Logo Container - Smaller size */}
        <div className="relative w-32 h-32 mb-6">
          {/* Background logo (light gray) */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Company logo"
          >
            <g transform="translate(0,400) scale(0.1,-0.1)" fill="#e5e7eb">
              <path
                d="M580 2246 c0 -2 33 -59 73 -127 41 -68 140 -239 222 -379 377 -648
                512 -882 563 -970 60 -105 63 -110 69 -94 2 6 55 99 117 207 l113 195 -47 78
                c-151 254 -582 985 -629 1066 l-16 28 -232 0 c-128 0 -233 -2 -233 -4z m444
                -52 c9 -9 62 -93 117 -187 56 -95 153 -260 217 -367 63 -107 164 -278 224
                -379 l108 -185 -18 -30 c-10 -17 -51 -88 -92 -159 -41 -70 -78 -126 -83 -124
                -8 2 -120 190 -365 612 -41 72 -105 182 -142 245 -37 63 -100 171 -140 240
                -40 69 -99 170 -131 226 -33 55 -59 106 -59 112 0 9 47 12 174 12 146 0 177
                -3 190 -16z"
              />
              <path
                d="M1900 2243 c0 -5 -63 -120 -140 -258 -137 -244 -139 -250 -123 -274
                33 -51 191 -318 212 -359 12 -23 23 -42 26 -42 2 0 19 28 38 63 42 79 452 801
                479 845 l20 32 -256 0 c-141 0 -256 -3 -256 -7z m430 -42 c0 -8 -388 -700
                -431 -769 -19 -31 -36 -28 -55 11 -10 17 -25 43 -34 57 -10 14 -45 73 -80 132
                l-62 108 127 227 c70 126 132 231 139 235 17 11 396 10 396 -1z"
              />
            </g>
          </svg>

          {/* Animated fill with optimized performance */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
            style={{ willChange: "transform" }}
          >
            <defs>
              <mask id="logoMask">
                <rect x="0" y="0" width="400" height="400" fill="black" />
                <g transform="translate(0,400) scale(0.1,-0.1)" fill="white">
                  <path
                    d="M580 2246 c0 -2 33 -59 73 -127 41 -68 140 -239 222 -379 377 -648
                    512 -882 563 -970 60 -105 63 -110 69 -94 2 6 55 99 117 207 l113 195 -47 78
                    c-151 254 -582 985 -629 1066 l-16 28 -232 0 c-128 0 -233 -2 -233 -4z m444
                    -52 c9 -9 62 -93 117 -187 56 -95 153 -260 217 -367 63 -107 164 -278 224
                    -379 l108 -185 -18 -30 c-10 -17 -51 -88 -92 -159 -41 -70 -78 -126 -83 -124
                    -8 2 -120 190 -365 612 -41 72 -105 182 -142 245 -37 63 -100 171 -140 240
                    -40 69 -99 170 -131 226 -33 55 -59 106 -59 112 0 9 47 12 174 12 146 0 177
                    -3 190 -16z"
                  />
                  <path
                    d="M1900 2243 c0 -5 -63 -120 -140 -258 -137 -244 -139 -250 -123 -274
                    33 -51 191 -318 212 -359 12 -23 23 -42 26 -42 2 0 19 28 38 63 42 79 452 801
                    479 845 l20 32 -256 0 c-141 0 -256 -3 -256 -7z m430 -42 c0 -8 -388 -700
                    -431 -769 -19 -31 -36 -28 -55 11 -10 17 -25 43 -34 57 -10 14 -45 73 -80 132
                    l-62 108 127 227 c70 126 132 231 139 235 17 11 396 10 396 -1z"
                  />
                </g>
              </mask>
            </defs>

            {/* Animated fill rectangle */}
            <rect
              x="0"
              y={400 - progress * 3}
              width="400"
              height={progress * 3}
              fill="#1f2937"
              mask="url(#logoMask)"
              style={{
                transition: animationComplete
                  ? "none"
                  : "y 0.08s ease-out, height 0.08s ease-out",
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LogoLoader;
