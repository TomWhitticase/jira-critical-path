import React, { useEffect } from "react";
import mermaid from "mermaid";

// Initialize mermaid with the desired configuration
mermaid.initialize({
  startOnLoad: true,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "Fira Code",
  flowchart: {
    nodeSpacing: 200,
    rankSpacing: 200,
  },
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = (props: MermaidProps) => {
  const { chart } = props;

  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{chart}</div>;
};
export default Mermaid;
