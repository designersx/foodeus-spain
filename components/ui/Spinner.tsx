"use client";

import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 16, color = "#fff" }) => {
  return (
    <>
      <span
        style={{
          width: size,
          height: size,
          border: `2px solid ${color}`,
          borderTop: `2px solid transparent`,
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
          display: "inline-block",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};
