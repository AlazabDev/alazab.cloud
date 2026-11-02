export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  context: string;
  strategy: string;
  execution: string[];
  impact: string;
  metrics: {
    value: string;
    label: string;
    variant?: "positive" | "negative" | "neutral";
  }[];
}

export const projects: Project[] = [
  {
    slug: "seo-engine",
    title: "SEO Engine",
    category: "Organic Growth",
    description:
      "Built an intent-driven content system that turned organic search into a scalable acquisition channel for a B2B SaaS platform.",
    context:
      "A B2B SaaS company in the project management space was heavily dependent on paid acquisition. Their organic traffic was stagnant, and content efforts were disconnected from business goals. They needed a systematic approach to turn content into a growth engine.",
    strategy:
      "Developed an intent-mapping framework that aligned content topics with buyer journey stages. Created topic clusters around core product capabilities, with pillar pages targeting high-value commercial keywords and supporting content targeting informational queries.",
    execution: [
      "Conducted comprehensive keyword research and intent mapping across 500+ keywords",
      "Designed content architecture with 5 pillar pages and 40+ cluster articles",
      "Implemented internal linking strategy to maximize topical authority",
      "Created content briefs with SEO requirements and conversion elements",
      "Established content refresh cadence for evergreen pieces",
    ],
    impact:
      "Within 8 months, organic traffic increased by 120%, with a 35% lift in qualified leads from organic sources. The content system now generates predictable pipeline contribution month over month.",
    metrics: [
      { value: "+120%", label: "Organic Traffic", variant: "positive" },
      { value: "+35%", label: "Qualified Leads", variant: "positive" },
      { value: "8mo", label: "Time to Results", variant: "neutral" },
    ],
  },
  {
    slug: "product-launch",
    title: "Product Launch Content",
    category: "Launch Strategy",
    description:
      "Orchestrated a multi-channel content strategy that drove awareness and conversions for a new product feature launch.",
    context:
      "A growing SaaS company was launching a major new feature that represented a strategic expansion into a new market segment. They needed content that could educate the market, generate demand, and support sales enablement simultaneously.",
    strategy:
      "Created a narrative-first approach that positioned the new feature as a category-defining solution. Developed a content pyramid starting with thought leadership, flowing down to tactical content, and supporting sales conversations at every stage.",
    execution: [
      "Developed core messaging framework and positioning narrative",
      "Created high-converting landing page with product storytelling",
      "Produced launch blog series: vision, use cases, and implementation guides",
      "Designed email nurture sequence for existing and new audiences",
      "Built sales enablement materials: battlecards, one-pagers, and case study templates",
    ],
    impact:
      "The launch exceeded targets with 40% higher conversion rates than previous launches. Content-driven awareness metrics showed 2.5x improvement in brand mentions and earned media coverage.",
    metrics: [
      { value: "+40%", label: "Conversion Rate", variant: "positive" },
      { value: "2.5x", label: "Brand Mentions", variant: "positive" },
      { value: "+85%", label: "Email Engagement", variant: "positive" },
    ],
  },
  {
    slug: "retention-education",
    title: "Retention & Education",
    category: "Customer Success",
    description:
      "Designed an educational content system that reduced churn and increased product adoption through strategic onboarding content.",
    context:
      "A B2B SaaS platform was experiencing elevated churn rates, particularly in the first 90 days. Users weren't discovering key features, and support tickets indicated knowledge gaps that better content could address.",
    strategy:
      "Built an education-first retention system that met users where they were in their product journey. Mapped content to activation milestones and created proactive touchpoints that anticipated user needs before they became frustrations.",
    execution: [
      "Analyzed churn patterns and support tickets to identify content gaps",
      "Created milestone-based email onboarding sequence (Days 1, 3, 7, 14, 30)",
      "Developed interactive product documentation with embedded video guides",
      "Built in-app help content triggered by user behavior patterns",
      "Established customer education blog with advanced use cases and workflows",
    ],
    impact:
      "90-day churn decreased by 28%, while product activation rates improved by 45%. Support ticket volume dropped by 32%, indicating users were finding answers through self-service content.",
    metrics: [
      { value: "−28%", label: "Churn Rate", variant: "positive" },
      { value: "+45%", label: "Activation Rate", variant: "positive" },
      { value: "−32%", label: "Support Tickets", variant: "positive" },
    ],
  },
];