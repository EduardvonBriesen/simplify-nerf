import React from "react";
import {
  ShaderGradientCanvas,
  ShaderGradient,
  useThree,
  useFrame,
} from "shadergradient";
import convert from "color-convert";

function Gradient({ theme }: { theme?: "light" | "dark" }) {
  const darkMode =
    "https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1&cAzimuthAngle=180&cDistance=2.4&cPolarAngle=95&cameraZoom=1&color1=%23a44fff&color2=%23000000&color3=%23000000&destination=onCanvas&embedMode=off&envPreset=dawn&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1.1&positionX=0&positionY=-2.1&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=225&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=2.9&uFrequency=5.5&uSpeed=0.1&uStrength=1.8&uTime=0.2&wireframe=false&zoomOut=false";

  const lightMode =
    "https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.3&cAzimuthAngle=180&cDistance=2.4&cPolarAngle=95&cameraZoom=1&color1=%23a44fff&color2=%23ffffff&color3=%23ffffff&destination=onCanvas&embedMode=off&envPreset=dawn&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1.1&positionX=0&positionY=-2.1&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=225&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=2.9&uFrequency=5.5&uSpeed=0.1&uStrength=1.8&uTime=0.2&wireframe=false&zoomOut=false";

  return (
    <ShaderGradientCanvas
      style={{ position: "fixed", top: "0", pointerEvents: "none" }}
    >
      <ShaderGradient
        control="query"
        urlString={theme === "dark" ? darkMode : lightMode}
      />
    </ShaderGradientCanvas>
  );
}

export default Gradient;
