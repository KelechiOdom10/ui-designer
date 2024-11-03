import { logger } from "../utils/logger";

export class CreativeUIPromptBuilder {
  private creativeDirections = {
    editorial: {
      description: "Magazine-style layouts with strong typography and dynamic grids",
      examples: "Like Bloomberg, Vogue.com, The Verge",
      patterns: {
        layout: "Dynamic grid with varied column sizes, overlapping elements",
        typography: "Mix of large serifs and clean sans-serif, dramatic size contrasts",
        motion: "Subtle parallax, text reveals, smooth image transitions"
      }
    },
    artistic: {
      description: "Expressive layouts breaking traditional grid systems",
      examples: "Like Awwwards winners, creative portfolios, art galleries",
      patterns: {
        layout: "Asymmetrical balance, creative scroll experiences, unique positioning",
        typography: "Custom typefaces, experimental text treatments, kinetic type",
        motion: "Creative cursor interactions, organic animations, perspective shifts"
      }
    },
    brutalist: {
      description: "Raw, unconventional designs challenging web norms",
      examples: "Like Balenciaga, Genius, experimental artist sites",
      patterns: {
        layout: "Intentionally broken grids, raw typography, stark contrasts",
        typography: "System fonts, mixed sizes, unexpected alignments",
        motion: "Abrupt transitions, glitch effects, unconventional hovers"
      }
    },
    experiential: {
      description: "Immersive, story-driven interfaces",
      examples: "Like award-winning campaign sites, museum exhibitions",
      patterns: {
        layout: "Full-screen experiences, narrative-driven scrolling, environmental design",
        typography: "Context-aware type, dynamic scaling, environmental integration",
        motion: "Environment-reactive animations, scroll-driven experiences, 3D elements"
      }
    },
    retro: {
      description: "Nostalgic designs drawing from different eras",
      examples: "Like Y2K revival, synthwave aesthetics, vintage modernism",
      patterns: {
        layout: "Era-specific grid systems, period-appropriate spacing",
        typography: "Period typefaces, retro-inspired hierarchies",
        motion: "Era-specific animation patterns, nostalgic transitions"
      }
    },
    maximalist: {
      description: "Rich, layered designs with complex visual hierarchies",
      examples: "Like fashion microsites, luxury brand campaigns",
      patterns: {
        layout: "Layered content, rich media integration, complex grid systems",
        typography: "Multiple typeface combinations, dynamic sizing, layered text",
        motion: "Multi-layered animations, rich hover states, complex transitions"
      }
    },
    professional: {
      description: "Clean, structured designs with a focus on usability",
      examples: "Like SaaS landing pages, corporate websites, professional portfolios",
      patterns: {
        layout: "Grid-based content, structured sections, clear hierarchy",
        typography: "Clean, readable typefaces, structured text blocks",
        motion: "Subtle hover effects, smooth transitions, clear feedback"
      }
    }
  };

  private visualTreatments = {
    typography: {
      experimental: "Type as graphic element, broken grid typography, dynamic sizing",
      kinetic: "Animated type, responsive letterforms, interactive text",
      layered: "Overlapping text, depth through typography, text as texture"
    },
    layout: {
      fluid: "Organic shapes, flowing content, natural movement",
      fragmented: "Split content, broken grid, intentional chaos",
      layered: "Depth through overlaps, content stacking, z-space exploration"
    },
    interaction: {
      gestural: "Drag interactions, physics-based movement, natural responses",
      playful: "Unexpected animations, surprising reactions, delightful moments",
      immersive: "Environment-aware behaviors, contextual responses, adaptive design"
    }
  };

  private randomTreatment(category: keyof typeof this.visualTreatments): string {
    const treatments = Object.values(this.visualTreatments[category]);
    return treatments[Math.floor(Math.random() * treatments.length)];
  }

  private generateCreativeSuggestions(userPrompt: string): string[] {
    // Analyze prompt for creative opportunities
    const suggestions: string[] = [];

    if (userPrompt.includes("scroll") || userPrompt.includes("explore")) {
      suggestions.push(`Consider ${this.visualTreatments.interaction.gestural}`);
    }
    if (userPrompt.includes("text") || userPrompt.includes("type")) {
      suggestions.push(`Try ${this.visualTreatments.typography.experimental}`);
    }
    if (userPrompt.includes("layout") || userPrompt.includes("grid")) {
      suggestions.push(`Experiment with ${this.visualTreatments.layout.fluid}`);
    }

    // Always include at least one random suggestion from each category
    if (suggestions.length < 3) {
      suggestions.push(`Typography: ${this.randomTreatment("typography")}`);
      suggestions.push(`Layout: ${this.randomTreatment("layout")}`);
      suggestions.push(`Interaction: ${this.randomTreatment("interaction")}`);
    }

    return suggestions;
  }

  buildPrompt(userPrompt: string, direction: keyof typeof this.creativeDirections): string {
    logger.debug("Building prompt", { userPrompt, direction });

    const style = this.creativeDirections[direction];
    const creativeSuggestions = this.generateCreativeSuggestions(userPrompt);

    logger.debug("Generated creative suggestions", { suggestions: creativeSuggestions });

    return `
Create an innovative, boundary-pushing web interface that challenges traditional design patterns while maintaining intuitive user experience with these strict requirements:

USER REQUEST: ${userPrompt}

CREATIVE DIRECTION:
${style.description}
Similar Energy To: ${style.examples}

CORE PATTERNS:
Layout Approach: ${style.patterns.layout}
Typography Direction: ${style.patterns.typography}
Motion Language: ${style.patterns.motion}

SUGGESTED CREATIVE TREATMENTS:
${creativeSuggestions.map((suggestion) => `• ${suggestion}`).join("\n")}

EXPERIMENTAL APPROACHES TO CONSIDER:

1. Typography Play
- Try ${this.visualTreatments.typography.experimental}
- Explore ${this.visualTreatments.typography.kinetic}
- Consider ${this.visualTreatments.typography.layered}

2. Layout Innovation
- Experiment with ${this.visualTreatments.layout.fluid}
- Play with ${this.visualTreatments.layout.fragmented}
- Build depth through ${this.visualTreatments.layout.layered}

3. Interactive Elements
- Design ${this.visualTreatments.interaction.gestural}
- Create ${this.visualTreatments.interaction.playful}
- Develop ${this.visualTreatments.interaction.immersive}

DESIGN CONSIDERATIONS:
1. Visual Innovation
   - Push beyond standard layouts and grids
   - Use typography as a core design element
   - Create unexpected visual hierarchies
   - Layer elements for depth and intrigue

2. Interactive Moments
   - Design unique state transitions
   - Create memorable micro-interactions
   - Consider unconventional navigation
   - Build delightful surprise moments

3. Content Choreography
   - Break traditional content flow
   - Mix media types creatively
   - Use white space as a design element
   - Create dynamic reading rhythms

4. Motion & Behavior
   - Design purposeful transitions
   - Create contextual animations
   - Use motion to guide and delight
   - Build responsive interactions

FORMAT REQUIREMENTS:
1. Response must be wrapped in <OUTPUT> tags
2. Must contain <!-- HTML --> and <!-- CSS --> sections
3. HTML must:
   - Use semantic HTML5 elements
   - Include proper lang attribute
   - Have descriptive alt texts
   - Use BEM or similar naming convention
4. CSS must:
   - Include a reset section
   - Use logical property names
   - Include responsive breakpoints
   - Define hover/focus states
   - Follow mobile-first approach

Push creative boundaries while keeping the interface intuitive. Focus on creating memorable, unique experiences that serve the content and user needs. 
Remember: Return ONLY the coded implementation within <OUTPUT> tags. Do not include explanations or additional text.`.trim();
  }

  buildSystemPrompt(): string {
    logger.info("Building system prompt");
    return `
You are an innovative UI designer who pushes creative boundaries.
Think beyond conventional patterns and create unique, memorable experiences.
Use experimental approaches to typography, layout, and interaction.
Balance artistic expression with intuitive user experience.
You must ALWAYS return responses in this exact format:

<OUTPUT>
<!-- HTML -->
<!DOCTYPE html>
<html lang="en">
  <!-- Your semantic HTML here -->
</html>

<!-- CSS -->
/* CSS Reset */
/* Your base styles */
/* Your component styles */
/* Your responsive styles */
</OUTPUT>

CRITICAL REQUIREMENTS:
1. Always wrap the entire response in <OUTPUT> tags
2. Always include HTML and CSS sections with exactly these comment markers
3. Always use semantic HTML5 elements
4. Always include a CSS reset
5. Always include responsive styles with media queries
6. Never include explanations or additional text
7. Never include JavaScript
8. Never include external resources or CDN links

Violation of these requirements is not acceptable.
`.trim();
  }
}
