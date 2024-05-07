import React from "react";
import {
  ShaderGradientCanvas,
  ShaderGradient,
  useThree,
  useFrame,
} from "shadergradient";
import convert from "color-convert";

function Gradient({
  theme,
  animate,
}: {
  theme?: "light" | "dark";
  animate?: boolean;
}) {
  return (
    <ShaderGradientCanvas
      style={{ position: "fixed", top: "0", pointerEvents: "none" }}
    >
      <ShaderGradient
        control="props"
        animate={animate ? "on" : "off"}
        brightness={theme === "dark" ? 1 : 1.3}
        cAzimuthAngle={180}
        cDistance={2.4}
        cPolarAngle={95}
        cameraZoom={1}
        color1={theme === "dark" ? "#a44fff" : "#a44fff"}
        color2={theme === "dark" ? "#000000" : "#ffffff"}
        color3={theme === "dark" ? "#000000" : "#ffffff"}
        dampingFactor={0.1}
        envPreset="dawn"
        frameRate={10}
        grain="off"
        lightType="3d"
        positionX={0}
        positionY={-2.1}
        positionZ={0}
        rotationX={0}
        rotationY={0}
        rotationZ={225}
        type="waterPlane"
        uDensity={2.9}
        uFrequency={5.5}
        uSpeed={0.1}
        uStrength={1.8}
        uTime={0.2}
      />
    </ShaderGradientCanvas>
  );
}

export default Gradient;
