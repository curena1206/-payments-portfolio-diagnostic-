// model.js
// V1: Commercial banking payments portfolio diagnostic
// Future-proofing hook: tokenized rails (stablecoins) planned V2 (not in UI/scoring yet).

window.PPD_MODEL = (() => {
  const pillars = [
    {
      id: "revenue_arch",
      name: "Revenue Architecture",
      weight: 0.20,
      subtitle: "How the portfolio makes money and how resilient it is",
      questions: [
        {
          id: "RA1",
          title: "Revenue mix diversification",
          desc: "Revenue is meaningfully diversified across fee, FX, and balance contribution.",
          options: [
            { score: 1, label: "Mostly one lever", sub: "Single dominant source drives earnings" },
            { score: 2, label: "Two levers, one dominates", sub: "Some diversification but still fragile" },
            { score: 4, label: "Diversified across 3 levers", sub: "Balanced fee/FX/balance contribution" },
            { score: 5, label: "Diversified + intentional mix strategy", sub: "Product-led mix optimization" }
          ]
        },
        {
          id: "RA2",
          title: "Pricing segmentation maturity",
          desc: "Pricing is segmented by client value (size, behavior, corridor/rail, complexity).",
          options: [
            { score: 1, label: "Flat / one-size pricing", sub: "Minimal value capture differentiation" },
            { score: 2, label: "Some tiering, inconsistent", sub: "Not consistently enforced" },
            { score: 3, label: "Segmented for top clients only", sub: "Long-tail is unmanaged" },
            { score: 4, label: "Segmented broadly + governance", sub: "Standardized tiers with controls" },
            { score: 5, label: "Value-based + corridor/rail + behavioral", sub: "Strong monetization design" }
          ]
        },
        {
          id: "RA3",
          title: "Rail-level monetization clarity",
          desc: "You can explain unit economics by rail and use it to steer decisions.",
          options: [
            { score: 0, label: "Not measurable / not tracked", sub: "No visibility by rail" },
            { score: 2, label: "Tracked in pieces, no ownership", sub: "Data exists but not operationalized" },
            { score: 3, label: "Tracked for major rails occasionally", sub: "Not consistently used" },
            { score: 4, label: "Tracked + used in pricing/strategy", sub: "Regular steering input" },
            { score: 5, label: "Tracked + tied to roadmap + sales plays", sub: "Economics drives execution" }
          ]
        },
        {
          id: "RA4",
          title: "Revenue concentration risk",
          desc: "Top 10 clients represent:",
          options: [
            { score: 0, label: ">60% of revenue", sub: "High volatility risk" },
            { score: 1, label: "40–60%", sub: "Material concentration risk" },
            { score: 2, label: "25–40%", sub: "Moderate concentration risk" },
            { score: 4, label: "10–25%", sub: "Healthy distribution" },
            { score: 5, label: "<10%", sub: "Low concentration risk" }
          ]
        },
        {
          id: "RA5",
          title: "Monetization capture (revenue vs volume)",
          desc: "Over last 12–24 months, revenue growth vs volume growth:",
          options: [
            { score: 1, label: "Revenue lagging materially", sub: "Under-capturing value" },
            { score: 2, label: "Revenue ~flat while volume up", sub: "Pricing/mix leakage" },
            { score: 4, label: "Revenue slightly outpacing volume", sub: "Healthy monetization capture" },
            { score: 5, label: "Revenue consistently outpacing volume", sub: "Strong pricing power / mix" }
          ]
        },
        {
          id: "RA6",
          title: "FX monetization integration (if applicable)",
          desc: "For FX-enabled flows, FX is:",
          options: [
            { score: 0, label: "Not offered / not monetized", sub: "No FX capture" },
            { score: 2, label: "Offered ad-hoc, minimal capture", sub: "Inconsistent monetization" },
            { score: 3, label: "Offered but weak pricing discipline", sub: "Spread leakage risk" },
            { score: 4, label: "Embedded in flows + pricing framework", sub: "Standardized capture" },
            { score: 5, label: "Embedded + corridor strategy + spread mgmt", sub: "Operator-grade FX model" }
          ]
        },
        {
          id: "RA7",
          title: "Packaging strategy",
          desc: "Monetization model is:",
          options: [
            { score: 1, label: "Purely bundled / all-you-can-eat", sub: "Leakage risk; weak value levers" },
            { score: 2, label: "Mostly bundled with some add-ons", sub: "Partial levers" },
            { score: 4, label: "Mixed model with clear value levers", sub: "Intentional packaging" },
            { score: 5, label: "Packaging tied to behavior + economics", sub: "Best-in-class design" }
          ]
        }
      ]
    },

    {
      id: "growth_engine",
      name: "Growth Engine Quality",
      weight: 0.15,
      subtitle: "Whether growth is structural and monetizable",
      questions: [
        { id: "GE1", title: "Primary growth engine repeatability", desc: "How repeatable is the GTM engine?",
          options: [
            { score: 1, label: "Mostly inbound / legacy", sub: "Weak repeatability" },
            { score: 2, label: "Relationship-led, inconsistent", sub: "Dependent on individuals" },
            { score: 3, label: "Active GTM motions but uneven", sub: "Some playbooks exist" },
            { score: 4, label: "Repeatable engine + playbooks", sub: "Predictable growth motion" },
            { score: 5, label: "Multiple engines (embedded + direct + partners)", sub: "Diversified GTM" }
          ]
        },
        { id: "GE2", title: "Attachment / cross-sell management", desc: "Payments attach rate is:",
          options: [
            { score: 1, label: "Low / not tracked", sub: "No systematic attach" },
            { score: 2, label: "Tracked but not managed", sub: "Visibility without action" },
            { score: 3, label: "Managed for top segments", sub: "Partial discipline" },
            { score: 4, label: "Managed across segments with targets", sub: "Strong management" },
            { score: 5, label: "Optimized via incentives + product design", sub: "Best practice" }
          ]
        },
        { id: "GE3", title: "Workflow embed depth", desc: "Payments embedded in client workflows (ERP/TMS/AP/AR):",
          options: [
            { score: 1, label: "Mostly portal/manual", sub: "Low stickiness" },
            { score: 3, label: "File-based integrations common", sub: "Moderate embed" },
            { score: 4, label: "APIs/connectors + onboarding motion", sub: "High embed potential" },
            { score: 5, label: "Deeply embedded + high switching costs", sub: "Durable distribution" }
          ]
        },
        { id: "GE4", title: "Sales specialization & enablement", desc: "Commercial payments sales motion:",
          options: [
            { score: 1, label: "No specialist sales motion", sub: "Generalist coverage" },
            { score: 2, label: "Some specialists, coverage gaps", sub: "Inconsistent" },
            { score: 3, label: "Dedicated coverage, limited enablement", sub: "Moderate" },
            { score: 4, label: "Specialist + enablement + plays", sub: "Strong" },
            { score: 5, label: "Tied to unit economics & margin", sub: "Operator-grade" }
          ]
        },
        { id: "GE5", title: "Pipeline quality", desc: "Pipeline conversion and quality:",
          options: [
            { score: 1, label: "Dominated by price shopping", sub: "Weak differentiation" },
            { score: 2, label: "Mixed quality, inconsistent conversion", sub: "Unpredictable" },
            { score: 4, label: "Strong conversion in priority segments", sub: "Good focus" },
            { score: 5, label: "Predictable conversion + cohort tracking", sub: "Best practice" }
          ]
        },
        { id: "GE6", title: "Client experience as growth driver", desc: "Onboarding and ongoing CX:",
          options: [
            { score: 1, label: "High friction, frequent escalations", sub: "CX is a constraint" },
            { score: 2, label: "Some improvement initiatives", sub: "In progress" },
            { score: 4, label: "Stable CX + clear onboarding", sub: "Supports growth" },
            { score: 5, label: "Measurable CX advantage tied to win rate", sub: "Differentiated" }
          ]
        },
        { id: "GE7", title: "Differentiation clarity", desc: "Value prop by segment:",
          options: [
            { score: 1, label: "Unclear / 'service' only", sub: "Weak narrative" },
            { score: 2, label: "Some value props, inconsistent", sub: "Not repeatable" },
            { score: 4, label: "Clear offers per segment", sub: "Strong narrative" },
            { score: 5, label: "Quantified outcomes (time, risk, cost)", sub: "Best-in-class" }
          ]
        }
      ]
    },

    {
      id: "margin_cost",
      name: "Margin & Cost Structure",
      weight: 0.20,
      subtitle: "Margin durability and hidden leakage (especially exceptions)",
      questions: [
        { id: "MC1", title: "Gross margin band", desc: "Gross margin:",
          options: [
            { score: 0, label: "<25%", sub: "Structurally challenged" },
            { score: 2, label: "25–40%", sub: "Fragile" },
            { score: 3, label: "40–55%", sub: "Moderate" },
            { score: 4, label: "55–70%", sub: "Strong" },
            { score: 5, label: ">70%", sub: "Best-in-class" }
          ]
        },
        { id: "MC2", title: "Exception / repair rate", desc: "Percent of payments requiring manual repair:",
          options: [
            { score: 0, label: ">5%", sub: "High operational leakage" },
            { score: 1, label: "3–5%", sub: "Material leakage" },
            { score: 3, label: "1.5–3%", sub: "Moderate leakage" },
            { score: 4, label: "0.5–1.5%", sub: "Healthy" },
            { score: 5, label: "<0.5%", sub: "Best-in-class STP" }
          ]
        },
        { id: "MC3", title: "Repair cost visibility", desc: "Repair cost measurement:",
          options: [
            { score: 0, label: "Not measured", sub: "Blind spot" },
            { score: 2, label: "Estimated qualitatively", sub: "Directional only" },
            { score: 3, label: "Measured periodically", sub: "Some discipline" },
            { score: 4, label: "Measured + KPI owned", sub: "Operationalized" },
            { score: 5, label: "Tied to roadmap & incentives", sub: "Best practice" }
          ]
        },
        { id: "MC4", title: "Unit cost discipline", desc: "Unit cost per payment/client tracking:",
          options: [
            { score: 0, label: "No unit cost tracking", sub: "No unit economics lens" },
            { score: 2, label: "Partial tracking", sub: "Incomplete" },
            { score: 3, label: "Tracked and reviewed", sub: "Baseline discipline" },
            { score: 4, label: "Used for pricing decisions", sub: "Good" },
            { score: 5, label: "Used for product design tradeoffs", sub: "Operator-grade" }
          ]
        },
        { id: "MC5", title: "External cost dependency management", desc: "Dependence on correspondents/networks/vendors:",
          options: [
            { score: 1, label: "High, unmanaged", sub: "Margin risk" },
            { score: 2, label: "High, some negotiations", sub: "Reactive" },
            { score: 3, label: "Moderate + managed", sub: "Baseline" },
            { score: 4, label: "Optimized (routing, contracts)", sub: "Strong" },
            { score: 5, label: "Optimized + dynamic strategy", sub: "Best practice" }
          ]
        },
        { id: "MC6", title: "Pricing leakage controls", desc: "Discounting/override controls:",
          options: [
            { score: 1, label: "Overrides rampant/unmanaged", sub: "Leakage likely high" },
            { score: 2, label: "Some controls, inconsistent", sub: "Partial" },
            { score: 3, label: "Strong controls for top clients", sub: "Better" },
            { score: 4, label: "Controls + analytics", sub: "Strong" },
            { score: 5, label: "Elasticity testing + governance discipline", sub: "Best practice" }
          ]
        },
        { id: "MC7", title: "Margin resilience", desc: "Resilience to rate/volume mix changes:",
          options: [
            { score: 1, label: "Highly fragile", sub: "Few levers" },
            { score: 2, label: "Some fragility", sub: "Limited levers" },
            { score: 3, label: "Neutral/manageable", sub: "OK" },
            { score: 4, label: "Resilient", sub: "Multiple levers" },
            { score: 5, label: "Clearly resilient with defined levers", sub: "Operator-grade" }
          ]
        }
      ]
    },

    {
      id: "multi_rail",
      name: "Multi-Rail Strategy & Future Readiness",
      weight: 0.15,
      subtitle: "Real-time readiness, data maturity, and rail optimization",
      questions: [
        { id: "MR1", title: "Real-time payments (send) capability", desc: "RTP/FedNow send capability:",
          options: [
            { score: 1, label: "Receive-only / none", sub: "Behind market" },
            { score: 2, label: "Limited send (pilot)", sub: "Early stage" },
            { score: 3, label: "Send for some segments", sub: "Partial scale" },
            { score: 4, label: "Scaled send + GTM motion", sub: "Strong readiness" },
            { score: 5, label: "Scaled + monetized use-case packaging", sub: "Best practice" }
          ]
        },
        { id: "MR2", title: "ISO 20022 / structured data maturity", desc: "Data/ISO readiness:",
          options: [
            { score: 1, label: "Not started", sub: "Significant gap" },
            { score: 2, label: "In flight", sub: "Transition" },
            { score: 3, label: "Implemented, limited usage", sub: "Baseline" },
            { score: 4, label: "Implemented + leveraged", sub: "Strong" },
            { score: 5, label: "Leveraged for STP/pre-validation/analytics", sub: "Best practice" }
          ]
        },
        { id: "MR3", title: "Rail choice / routing strategy", desc: "Routing optimization:",
          options: [
            { score: 1, label: "No routing strategy", sub: "Static" },
            { score: 2, label: "Basic rules", sub: "Limited" },
            { score: 3, label: "Some optimization", sub: "Moderate" },
            { score: 4, label: "Optimized routing + client rules", sub: "Strong" },
            { score: 5, label: "Economics-driven + configurable", sub: "Best practice" }
          ]
        },
        { id: "MR4", title: "Cross-border corridor strategy (if applicable)", desc: "Corridor strategy:",
          options: [
            { score: 1, label: "None / not applicable", sub: "Select if truly N/A" },
            { score: 2, label: "Ad-hoc/reactive", sub: "Weak" },
            { score: 3, label: "Defined for major corridors", sub: "Moderate" },
            { score: 4, label: "Defined + priced + managed", sub: "Strong" },
            { score: 5, label: "Playbooks + partners + economics", sub: "Best practice" }
          ]
        },
        { id: "MR5", title: "Reference data / data quality maturity", desc: "Data quality baseline:",
          options: [
            { score: 1, label: "Major data gaps", sub: "High repair risk" },
            { score: 2, label: "Improving, still noisy", sub: "Moderate risk" },
            { score: 3, label: "Stable baseline", sub: "OK" },
            { score: 4, label: "High-quality + monitored", sub: "Strong" },
            { score: 5, label: "High-quality + enables automation (STP)", sub: "Best practice" }
          ]
        },
        { id: "MR6", title: "Fraud/risk integration maturity", desc: "Risk controls integrated into flows:",
          options: [
            { score: 1, label: "Reactive", sub: "High friction" },
            { score: 2, label: "Some controls, high friction", sub: "Slows GTM" },
            { score: 3, label: "Balanced controls, measurable", sub: "OK" },
            { score: 4, label: "Strong integration into flows", sub: "Strong" },
            { score: 5, label: "Risk as enablement (less friction)", sub: "Best practice" }
          ]
        },
        { id: "MR7", title: "Product modernization cadence", desc: "Roadmap delivery cadence:",
          options: [
            { score: 1, label: "Stalled", sub: "Execution risk" },
            { score: 2, label: "Occasional releases", sub: "Inconsistent" },
            { score: 3, label: "Quarterly releases", sub: "Baseline" },
            { score: 4, label: "Predictable releases + KPIs", sub: "Strong" },
            { score: 5, label: "Fast cadence + strategic outcomes", sub: "Best practice" }
          ]
        }
      ]
    },

    {
      id: "balance_liquidity",
      name: "Balance Sheet & Liquidity Contribution",
      weight: 0.15,
      subtitle: "Franchise value beyond fees: balances, stickiness, ROE",
      questions: [
        { id: "BL1", title: "Payments-to-balance linkage", desc: "Are balances linked to payments behavior and tracked?",
          options: [
            { score: 1, label: "Not linked/tracked", sub: "Missed franchise value" },
            { score: 2, label: "Tracked loosely", sub: "Limited use" },
            { score: 3, label: "Linked for top clients", sub: "Partial" },
            { score: 4, label: "Linked across segments", sub: "Strong" },
            { score: 5, label: "Used in pricing + GTM decisions", sub: "Best practice" }
          ]
        },
        { id: "BL2", title: "Operating balance penetration", desc: "Operating balance penetration is:",
          options: [
            { score: 1, label: "Low", sub: "Weak stickiness" },
            { score: 2, label: "Moderate but unmanaged", sub: "Opportunity" },
            { score: 3, label: "Managed for priority segments", sub: "Good" },
            { score: 4, label: "High with targets and plays", sub: "Strong" },
            { score: 5, label: "High + optimized overlays", sub: "Best practice" }
          ]
        },
        { id: "BL3", title: "Liquidity overlay (sweeps/MMDA/CDs)", desc: "Liquidity product attach:",
          options: [
            { score: 1, label: "None", sub: "No overlay" },
            { score: 2, label: "Offered, low attach", sub: "Underutilized" },
            { score: 3, label: "Moderate attach", sub: "OK" },
            { score: 4, label: "High attach + packaged with payments", sub: "Strong" },
            { score: 5, label: "Engineered overlay + optimized economics", sub: "Best practice" }
          ]
        },
        { id: "BL4", title: "Pricing recognizes balance value", desc: "Does pricing reflect balance contribution?",
          options: [
            { score: 1, label: "No", sub: "Pricing misses ROE" },
            { score: 2, label: "Sometimes", sub: "Inconsistent" },
            { score: 3, label: "Often for large clients", sub: "Partial" },
            { score: 4, label: "Standard practice", sub: "Strong" },
            { score: 5, label: "Formal balance-adjusted model", sub: "Best practice" }
          ]
        },
        { id: "BL5", title: "Rate-cycle sensitivity awareness", desc: "Rate sensitivity is:",
          options: [
            { score: 1, label: "Not assessed", sub: "Blind spot" },
            { score: 2, label: "Qualitative only", sub: "Directional" },
            { score: 3, label: "Measured broadly", sub: "Baseline" },
            { score: 4, label: "Measured + managed via levers", sub: "Strong" },
            { score: 5, label: "Optimized by segment", sub: "Best practice" }
          ]
        },
        { id: "BL6", title: "Stickiness via operating model", desc: "Switching costs and retention drivers:",
          options: [
            { score: 1, label: "Low switching costs", sub: "Fragile" },
            { score: 2, label: "Some stickiness", sub: "Moderate" },
            { score: 3, label: "Moderate stickiness", sub: "OK" },
            { score: 4, label: "High stickiness (workflow + balances)", sub: "Strong" },
            { score: 5, label: "Very high stickiness + durable ROE", sub: "Best practice" }
          ]
        },
        { id: "BL7", title: "Treasury integration", desc: "Payments integrated into broader treasury strategy:",
          options: [
            { score: 1, label: "Siloed", sub: "Missed franchise synergy" },
            { score: 2, label: "Partial coordination", sub: "Inconsistent" },
            { score: 3, label: "Good coordination", sub: "OK" },
            { score: 4, label: "Integrated planning", sub: "Strong" },
            { score: 5, label: "Fully integrated franchise strategy", sub: "Best practice" }
          ]
        }
      ]
    },

    {
      id: "governance",
      name: "Governance & Operating Model",
      weight: 0.15,
      subtitle: "Can strategy execute? Who owns the levers?",
      questions: [
        { id: "GO1", title: "Clear P&L ownership", desc: "P&L ownership and authority:",
          options: [
            { score: 1, label: "No clear owner", sub: "Execution risk" },
            { score: 2, label: "Shared/unclear accountability", sub: "Slow decisions" },
            { score: 3, label: "Clear owner, limited authority", sub: "Partial" },
            { score: 4, label: "Clear owner + authority", sub: "Strong" },
            { score: 5, label: "Full operating cadence + authority", sub: "Best practice" }
          ]
        },
        { id: "GO2", title: "Pricing governance", desc: "Pricing decision-making model:",
          options: [
            { score: 1, label: "Sales-driven pricing", sub: "High leakage risk" },
            { score: 2, label: "Partial controls", sub: "Inconsistent" },
            { score: 3, label: "Central review for large deals", sub: "Moderate" },
            { score: 4, label: "Central governance + analytics", sub: "Strong" },
            { score: 5, label: "Governance + elasticity discipline", sub: "Best practice" }
          ]
        },
        { id: "GO3", title: "KPI transparency", desc: "KPI system maturity:",
          options: [
            { score: 1, label: "KPIs unclear", sub: "No operating system" },
            { score: 2, label: "Some KPIs", sub: "Fragmented" },
            { score: 3, label: "Reviewed periodically", sub: "Baseline" },
            { score: 4, label: "Monthly exec-level review", sub: "Strong" },
            { score: 5, label: "KPIs drive decisions", sub: "Best practice" }
          ]
        },
        { id: "GO4", title: "Cross-functional operating cadence", desc: "Operating forum effectiveness:",
          options: [
            { score: 1, label: "Ad-hoc", sub: "Low accountability" },
            { score: 2, label: "Occasional forums", sub: "Low impact" },
            { score: 3, label: "Regular forums, mixed impact", sub: "OK" },
            { score: 4, label: "Strong cadence + decisions tracked", sub: "Strong" },
            { score: 5, label: "Measurable outcomes & execution", sub: "Best practice" }
          ]
        },
        { id: "GO5", title: "Product + Ops alignment", desc: "Ops and product collaboration:",
          options: [
            { score: 1, label: "Siloed, escalations common", sub: "High friction" },
            { score: 2, label: "Some collaboration", sub: "Inconsistent" },
            { score: 3, label: "Good collaboration", sub: "OK" },
            { score: 4, label: "Integrated planning", sub: "Strong" },
            { score: 5, label: "Joint ownership of STP/repair KPIs", sub: "Best practice" }
          ]
        },
        { id: "GO6", title: "Tech roadmap ownership & delivery", desc: "Roadmap clarity and delivery discipline:",
          options: [
            { score: 1, label: "No clarity", sub: "Execution risk" },
            { score: 2, label: "Roadmap exists, weak delivery", sub: "Risk" },
            { score: 3, label: "Decent delivery", sub: "Baseline" },
            { score: 4, label: "Strong delivery discipline", sub: "Strong" },
            { score: 5, label: "Outcome-driven roadmap w/ economic KPIs", sub: "Best practice" }
          ]
        },
        { id: "GO7", title: "Risk/Compliance partnership", desc: "Risk engagement model:",
          options: [
            { score: 1, label: "Late-stage blocker", sub: "GTM slowdown" },
            { score: 2, label: "Some engagement", sub: "Inconsistent" },
            { score: 3, label: "Engaged but slow", sub: "OK" },
            { score: 4, label: "Embedded in design", sub: "Strong" },
            { score: 5, label: "Embedded + accelerates GTM", sub: "Best practice" }
          ]
        }
      ]
    }
  ];

  // Recommendation library (used by rules engine)
  const recommendations = {
    R1: { title: "Implement segmented pricing (value tiers + behavior)", owner: "Product + Sales + Finance", metric: "Revenue/volume elasticity, margin by segment", why: "Closes monetization capture gaps without relying on volume growth." },
    R2: { title: "Introduce rail-level price floors + override controls", owner: "Pricing + Sales Leadership", metric: "Override rate, margin leakage, deal governance cycle time", why: "Stops silent margin erosion through inconsistent discounting." },
    R3: { title: "Redesign packaging (bundle + add-on value levers)", owner: "Product", metric: "ARPA, attach rate, margin mix", why: "Creates clear levers to capture value and reduce bundle leakage." },
    R4: { title: "Establish balance-adjusted pricing model", owner: "Product + Treasury + Finance", metric: "ROE contribution, balance-weighted profitability", why: "Aligns pricing with franchise value beyond fees." },
    R5: { title: "Build corridor-based FX strategy (top corridors playbook)", owner: "Product + Trading/FX + Sales", metric: "FX capture rate, spread leakage, corridor profitability", why: "Turns cross-border flows into deliberate monetization." },
    R6: { title: "Stand up Exception Reduction Program (repair KPI + cadence)", owner: "Ops + Product + Tech", metric: "Repair rate, STP %, cost per repair", why: "Repairs are often the biggest hidden driver of margin compression." },
    R7: { title: "Deploy pre-validation for top failure modes", owner: "Product + Tech + Ops", metric: "Top failure reason frequency, repair reduction", why: "Reduces exception volume upstream, improving CX and margin." },
    R8: { title: "Create unit cost model (cost per payment/client) and use it in pricing", owner: "Finance + Product", metric: "Unit cost by rail/segment, price floors, contribution margin", why: "Enables disciplined pricing and roadmap tradeoffs." },
    R9: { title: "Optimize external costs (routing, contracts, tiers)", owner: "Network Mgmt + Product + Finance", metric: "Cost per payment, correspondent/network fees", why: "Improves gross margin through structural cost levers." },
    R10:{ title: "Create STP scorecard by rail/client segment", owner: "Ops + Product", metric: "STP %, repair rates by segment", why: "Targets leakage where it matters most." },
    R11:{ title: "Build 3 segment GTM plays tied to economics", owner: "Product + Sales", metric: "Win rate, margin per win, attach rate", why: "Makes growth repeatable and profitable." },
    R12:{ title: "Strengthen ERP/TMS integration motion (top integrations)", owner: "Product + Tech + Sales", metric: "Integration adoption, time-to-onboard", why: "Increases stickiness and reduces switching risk." },
    R13:{ title: "Align sales incentives with margin + attach (not just volume)", owner: "Sales Leadership + Finance", metric: "Margin per client, attach rate, discounting", why: "Prevents growth that destroys profitability." },
    R14:{ title: "Implement win/loss loop tied to pricing + CX friction", owner: "Product + Sales Ops", metric: "Loss reasons, time-to-yes, onboarding friction", why: "Turns market feedback into execution." },
    R15:{ title: "Scale RTP/FedNow send + package use cases", owner: "Product + Tech + Sales", metric: "RTP send volume, use-case adoption, monetization", why: "Turns readiness into a growth lever." },
    R16:{ title: "ISO/data program focused on STP + repair reduction outcomes", owner: "Tech + Ops + Product", metric: "Data quality KPIs, repair drivers", why: "Structured data is a margin and CX lever." },
    R17:{ title: "Implement economics-aware routing strategy", owner: "Product + Tech", metric: "Routing distribution, cost per payment, SLA performance", why: "Optimizes cost and performance across rails." },
    R18:{ title: "Establish Pricing Council with authority + approval tiers", owner: "Exec Sponsor + Pricing", metric: "Override rate, approval cycle time, margin integrity", why: "Governance is often the first fix for leakage." },
    R19:{ title: "Monthly Portfolio Performance Review (rails, segments, repairs)", owner: "Portfolio Owner", metric: "Pillar KPIs trending, actions closed", why: "Creates an operating system for continuous improvement." },
    R20:{ title: "Tie roadmap to economic KPIs (margin, repairs, attach)", owner: "Product + Tech + Finance", metric: "Roadmap ROI, KPI movement per release", why: "Ensures delivery drives business outcomes." }
  };

  // Light-B: rules engine that produces diagnosis bullets + recommended actions
  const rules = [
    {
      id: "monetization_capture_gap",
      when: (a) => (a.RA5 <= 2 && a.GE5 >= 3),
      diagnosis: "Growth is present, but monetization capture is lagging; pricing and packaging are the constraint.",
      recs: ["R1","R3","R2"]
    },
    {
      id: "concentration_risk",
      when: (a) => (a.RA4 <= 2),
      diagnosis: "Revenue concentration elevates earnings volatility; diversify revenue sources or strengthen defensible pricing.",
      recs: ["R11","R1","R18"]
    },
    {
      id: "exception_margin_leak",
      when: (a) => (a.MC2 <= 1 || (a.MC2 <= 3 && a.MC3 <= 2)),
      diagnosis: "Exception/repair costs are likely a primary hidden margin driver (and a CX drag).",
      recs: ["R6","R7","R10","R16"]
    },
    {
      id: "weak_unit_economics",
      when: (a) => (a.RA3 <= 2 || a.MC4 <= 2),
      diagnosis: "Limited unit economics visibility makes pricing discipline and roadmap tradeoffs difficult.",
      recs: ["R8","R19","R20"]
    },
    {
      id: "pricing_leakage_governance",
      when: (a) => (a.MC6 <= 2 && a.GO2 <= 2),
      diagnosis: "Discounting/overrides are likely eroding margin; governance is the lever.",
      recs: ["R18","R2","R13"]
    },
    {
      id: "rtp_readiness_gap",
      when: (a) => (a.MR1 <= 2 && a.GE3 >= 3),
      diagnosis: "Workflow embedding exists, but limited real-time send capability constrains use-case expansion.",
      recs: ["R15","R17","R11"]
    },
    {
      id: "data_iso_constraint",
      when: (a) => (a.MR2 <= 2 && a.MC2 <= 3),
      diagnosis: "Structured data maturity is likely contributing to STP drag and repair volume.",
      recs: ["R16","R7","R10"]
    },
    {
      id: "fx_without_corridor",
      when: (a) => (a.MR4 <= 2 && a.RA6 >= 3),
      diagnosis: "FX-enabled flows exist, but corridor playbooks and pricing discipline likely leave revenue on the table.",
      recs: ["R5","R1","R19"]
    },
    {
      id: "float_dependency_risk",
      when: (a) => (a.RA1 <= 2 && a.BL5 <= 2),
      diagnosis: "Revenue architecture appears rate-cycle sensitive; diversify fee/FX levers and clarify rate exposure.",
      recs: ["R3","R4","R19"]
    },
    {
      id: "balances_not_monetized",
      when: (a) => (a.BL1 <= 2 && a.BL4 <= 2),
      diagnosis: "Balance contribution is likely under-monetized or missing in pricing decisions.",
      recs: ["R4","R11","R13"]
    },
    {
      id: "operating_system_gap",
      when: (a) => (a.GO4 <= 2 || a.GO3 <= 2),
      diagnosis: "Execution risk: without a strong KPI cadence and decision forum, even good strategy will stall.",
      recs: ["R19","R20","R18"]
    },
    {
      id: "roadmap_not_econ_anchored",
      when: (a) => (a.GO6 <= 2 && a.RA3 <= 3),
      diagnosis: "Roadmap decisions appear decoupled from economics; anchor delivery to business KPIs.",
      recs: ["R20","R8","R19"]
    }
  ];

  // Sub-score mapping (directional)
  const subScoreMap = {
    monetization: ["revenue_arch", "growth_engine"],
    margin: ["margin_cost", "governance"],
    readiness: ["multi_rail", "balance_liquidity"]
  };

  // V2 placeholder (disabled)
  const v2Hooks = {
    tokenizedRails: {
      enabled: false,
      note: "Planned V2: tokenized value rails (stablecoins/tokenized deposits) readiness overlay."
    }
  };

  return { pillars, rules, recommendations, subScoreMap, v2Hooks };
})();
