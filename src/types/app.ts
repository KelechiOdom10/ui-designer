export type DesignTool = {
  prompt: string;
  style: DesignStyle;
  type: ComponentType;
};

export type DesignStyle = "modern" | "minimal" | "playful";
export type ComponentType = "component" | "section";
