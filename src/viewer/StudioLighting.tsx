import React from 'react';

/**
 * Soft Studio Lighting according to spec Section 9:
 * "Ánh sáng studio mềm: key, fill và ambient vừa phải;
 * ánh sáng phải giúp đọc hình khối, không làm cháy màu."
 */
export const StudioLighting: React.FC = () => {
  return (
    <>
      {/* Soft ambient fill to avoid pitch-black shadows */}
      <ambientLight intensity={0.7} color="#FFFFFF" />

      {/* Primary Key Light (warm studio tone) */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.2}
        color="#FFFBF7"
        castShadow={false}
      />

      {/* Secondary Fill Light (cool lilac rim tone) */}
      <directionalLight
        position={[-3.5, -2, -2.5]}
        intensity={0.4}
        color="#E0D7F5"
        castShadow={false}
      />

      {/* Top soft bounce light */}
      <directionalLight
        position={[0, 4, -3]}
        intensity={0.3}
        color="#FFFFFF"
        castShadow={false}
      />
    </>
  );
};

export default StudioLighting;
