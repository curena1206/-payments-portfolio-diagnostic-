// model.js
// V2: Commercial banking payments portfolio diagnostic
// Calibration pass: question language, option labels, and sub-labels updated
// to structural economic maturity framing. Scoring mechanics unchanged.

window.PPD_MODEL = (() => {

  const pillars = [

    // ── 01 Revenue Architecture ──────────────────────────────────────────
    {
      id: "revenue_arch",
      name: "Revenue Architecture",
      weight: 0.20,
      subtitle: "How the portfolio monetizes payment activity and how consistently that behavior is understood",
      questions: [
        {
          id: "RA1",
          title: "Revenue mix across fee, FX, and balance contribution",
          desc: "How diversified and structurally balanced is the portfolio's revenue across transaction fees, FX-related activity, and balance-driven contribution?",
          options: [
            { score: 1, label: "Revenue concentrated in a single primary source", sub: "The portfolio appears materially dependent on one dominant economic driver" },
            { score: 2, label: "Multiple revenue sources exist but concentration remains meaningful", sub: "Some diversification is present, though economic dependence remains uneven" },
            { score: 4, label: "Revenue diversified across multiple economic drivers", sub: "Fee, FX-related, and balance contribution are visible and incorporated into portfolio evaluation" },
            { score: 5, label: "Revenue composition actively evaluated across major economic drivers", sub: "The franchise demonstrates disciplined visibility into how multiple revenue components contribute across the portfolio" }
          ]
        },
        {
          id: "RA2",
          title: "Pricing segmentation maturity",
          desc: "How consistently is pricing differentiated across client types, payment flows, and economic value drivers?",
          options: [
            { score: 1, label: "Limited segmentation — pricing applied broadly across the portfolio", sub: "Pricing discipline appears minimally differentiated across client and flow characteristics" },
            { score: 2, label: "Basic segmentation exists but application is inconsistent", sub: "Pricing structures exist, though governance and application vary across the portfolio" },
            { score: 3, label: "Segmentation established for major client groups", sub: "Core segments are differentiated, though consistency across the broader portfolio may vary" },
            { score: 4, label: "Segmented pricing supported by governance controls", sub: "Pricing discipline is operationalized across major client and payment segments" },
            { score: 5, label: "Pricing segmentation integrated into broader portfolio economics", sub: "Client behavior, flow characteristics, and economic value are consistently incorporated into pricing decisions" }
          ]
        },
        {
          id: "RA3",
          title: "Rail-level economic visibility",
          desc: "How consistently are payment economics evaluated across major rails and flow structures?",
          options: [
            { score: 0, label: "Limited visibility into economics by rail or flow type", sub: "Economic evaluation across payment structures appears fragmented or inconsistent" },
            { score: 2, label: "Data exists but is inconsistently operationalized", sub: "Some visibility is available, though usage in management decision-making appears limited" },
            { score: 3, label: "Economics tracked across major rails and reviewed periodically", sub: "Baseline visibility exists, though integration into operating decisions may vary" },
            { score: 4, label: "Rail-level economics incorporated into pricing and strategic evaluation", sub: "Economic visibility informs major pricing, investment, and operating decisions" },
            { score: 5, label: "Rail economics consistently integrated into portfolio management discipline", sub: "Payment economics are operationalized across major flows, investment priorities, and strategic evaluation processes" }
          ]
        },
        {
          id: "RA4",
          title: "Revenue concentration — top 10 clients",
          desc: "What share of payments-related revenue is concentrated among the top 10 client relationships?",
          options: [
            { score: 0, label: "More than 60%", sub: "Revenue concentration appears structurally elevated relative to portfolio diversification" },
            { score: 1, label: "40–60%", sub: "Concentration remains meaningful and may increase portfolio sensitivity to relationship changes" },
            { score: 2, label: "25–40%", sub: "Moderate concentration with manageable diversification characteristics" },
            { score: 3, label: "10–25%", sub: "Revenue distribution appears relatively balanced across the client base" },
            { score: 4, label: "Less than 10%", sub: "The portfolio demonstrates broad diversification across revenue-generating relationships" }
          ]
        },
        {
          id: "RA5",
          title: "Revenue versus payment activity growth",
          desc: "Over the last 12–24 months, how has revenue growth behaved relative to payment activity and transaction growth?",
          options: [
            { score: 1, label: "Revenue growth materially trailing activity growth", sub: "Monetization performance may not be scaling consistently with portfolio activity" },
            { score: 2, label: "Revenue growth generally flat relative to activity growth", sub: "Economic performance may be expanding more slowly than operational scale" },
            { score: 4, label: "Revenue growth modestly ahead of activity growth", sub: "Monetization discipline appears reasonably aligned with portfolio expansion" },
            { score: 5, label: "Revenue growth consistently outpacing activity growth", sub: "The franchise demonstrates strong alignment between portfolio growth and monetization performance" }
          ]
        },
        {
          id: "RA6",
          title: "FX-related monetization discipline",
          desc: "Where FX-related payment activity exists, how consistently are pricing, spread management, and economic performance evaluated?",
          options: [
            { score: 0, label: "FX-related activity minimally monetized or not strategically evaluated", sub: "FX contribution appears operational rather than economically managed" },
            { score: 2, label: "FX pricing exists but governance appears inconsistent", sub: "Spread management and monetization visibility may vary across segments and flows" },
            { score: 3, label: "FX economics managed across major payment segments", sub: "Core pricing discipline exists, though consistency across the broader portfolio may vary" },
            { score: 4, label: "FX-related economics incorporated into portfolio management", sub: "Pricing, spread management, and economic performance are evaluated systematically across major flows" },
            { score: 5, label: "FX monetization strategically integrated into payment economics", sub: "FX-related contribution is consistently evaluated alongside broader portfolio economics and client strategy" }
          ]
        },
        {
          id: "RA7",
          title: "Packaging and monetization structure",
          desc: "How intentionally is the payments offering structured to support monetization visibility and economic flexibility?",
          options: [
            { score: 1, label: "Primarily bundled with limited economic differentiation", sub: "Packaging structure may reduce visibility into underlying monetization behavior" },
            { score: 2, label: "Some differentiated pricing or add-on structures exist", sub: "Basic monetization levers are present, though operational consistency may vary" },
            { score: 4, label: "Packaging structure aligned with defined monetization objectives", sub: "Bundled and variable pricing structures are evaluated with measurable economic intent" },
            { score: 5, label: "Packaging strategy integrated into broader portfolio economics", sub: "Client behavior, pricing flexibility, and monetization objectives are consistently aligned across the offering structure" }
          ]
        }
      ]
    },

    // ── 02 Growth Engine Quality ─────────────────────────────────────────
    {
      id: "growth_engine",
      name: "Growth Engine Quality",
      weight: 0.10,
      subtitle: "How durable, repeatable, and economically aligned the franchise's growth model appears",
      questions: [
        {
          id: "GE1",
          title: "Commercial acquisition consistency",
          desc: "How repeatable and scalable is the franchise's ability to acquire and expand payments relationships?",
          options: [
            { score: 1, label: "Growth largely relationship- or individual-driven", sub: "Commercial expansion may depend heavily on specific people, legacy relationships, or opportunistic wins" },
            { score: 2, label: "Some repeatability exists across selected segments", sub: "Defined acquisition approaches exist, though scalability and consistency may vary" },
            { score: 3, label: "Structured acquisition model for major client groups", sub: "Core growth motions are established, though differentiation and expansion quality may vary across the portfolio" },
            { score: 4, label: "Growth engine supported by defined commercial processes", sub: "Acquisition, onboarding, and relationship expansion are operationalized across major segments" },
            { score: 5, label: "Growth model integrated into broader portfolio strategy", sub: "Commercial expansion is consistently aligned with client value, operating economics, and strategic portfolio priorities" }
          ]
        },
        {
          id: "GE2",
          title: "Product attach and cross-sell depth",
          desc: "How consistently does the franchise deepen relationships through additional payment, treasury, or related services?",
          options: [
            { score: 1, label: "Payments typically sold as standalone services", sub: "Relationship depth and economic expansion opportunities may be limited" },
            { score: 2, label: "Some cross-sell exists but lacks structure", sub: "Attach opportunities are pursued inconsistently across segments or relationship teams" },
            { score: 3, label: "Core attach strategy established for major client groups", sub: "Cross-sell discipline exists, though portfolio-wide penetration may vary" },
            { score: 4, label: "Attach strategy integrated into commercial management", sub: "Relationship expansion is incorporated into portfolio growth and client management routines" },
            { score: 5, label: "Multi-product expansion embedded into franchise strategy", sub: "The franchise demonstrates disciplined relationship deepening across payments, treasury, and operating services" }
          ]
        },
        {
          id: "GE3",
          title: "Client workflow embed depth",
          desc: "How deeply are payment capabilities integrated into client operating workflows and day-to-day activity?",
          options: [
            { score: 1, label: "Minimal workflow integration", sub: "Client relationships may remain transactional and vulnerable to pricing or service competition" },
            { score: 2, label: "Limited integration for selected clients or products", sub: "Some embed depth exists, though adoption and operational reliance remain uneven" },
            { score: 3, label: "Workflow integration established across core segments", sub: "Payments are operationally embedded for major client groups, though depth may vary" },
            { score: 4, label: "Embedded workflows support retention and expansion", sub: "Client integration contributes to relationship durability and commercial expansion opportunities" },
            { score: 5, label: "Workflow integration strategically incorporated into portfolio management", sub: "Embedded payment capabilities are consistently aligned with client operating models and long-term relationship strategy" }
          ]
        },
        {
          id: "GE4",
          title: "Onboarding efficiency and activation quality",
          desc: "How consistently can the franchise onboard and activate new payment relationships without creating material operational friction?",
          options: [
            { score: 1, label: "Onboarding frequently delayed or operationally fragmented", sub: "Client activation may create material friction, operational burden, or revenue realization delays" },
            { score: 2, label: "Basic onboarding structure exists with inconsistent execution", sub: "Processes are defined, though execution quality and timing may vary" },
            { score: 3, label: "Reasonably consistent onboarding for major segments", sub: "Core activation discipline exists, though scalability or automation may be limited" },
            { score: 4, label: "Onboarding integrated into commercial and operational routines", sub: "Activation quality, timing, and operational coordination are measured and managed" },
            { score: 5, label: "Onboarding discipline supports scalable portfolio growth", sub: "Client activation is operationalized as a strategic growth and relationship-management capability" }
          ]
        },
        {
          id: "GE5",
          title: "Sales specialization and payments expertise",
          desc: "How effectively does the commercial organization understand and position payments capabilities economically and operationally?",
          options: [
            { score: 1, label: "Payments sold opportunistically with limited specialization", sub: "Commercial teams may lack consistent depth in payments positioning and economic understanding" },
            { score: 2, label: "Specialists exist for selected areas or segments", sub: "Expertise is available in pockets, though broader enablement may be inconsistent" },
            { score: 3, label: "Defined payments expertise across major client groups", sub: "Commercial capability exists, though integration into portfolio strategy may vary" },
            { score: 4, label: "Sales and product coordination operationalized", sub: "Payments expertise supports pricing, solutioning, and relationship expansion consistently" },
            { score: 5, label: "Commercial capability integrated into strategic franchise positioning", sub: "The organization demonstrates scalable payments expertise tied to client economics, portfolio strategy, and operating differentiation" }
          ]
        },
        {
          id: "GE6",
          title: "Client retention and relationship durability",
          desc: "How durable do client relationships appear across pricing pressure, operational change, and competitive dynamics?",
          options: [
            { score: 1, label: "Relationships appear highly price- or service-sensitive", sub: "Retention risk may increase under competitive or operational pressure" },
            { score: 2, label: "Retention generally stable but vulnerable in selected areas", sub: "Client stickiness exists, though durability may vary across products or segments" },
            { score: 3, label: "Core relationships demonstrate reasonable durability", sub: "The franchise appears capable of maintaining major relationships through normal market conditions" },
            { score: 4, label: "Retention supported by workflow embed and relationship depth", sub: "Client relationships benefit from operational integration and multi-product engagement" },
            { score: 5, label: "Relationship durability strategically embedded into the franchise", sub: "Retention strength is supported by client integration, operating reliance, and economic alignment across the portfolio" }
          ]
        },
        {
          id: "GE7",
          title: "Growth quality versus operational strain",
          desc: "How well does the franchise balance commercial expansion with operational scalability and economic discipline?",
          options: [
            { score: 1, label: "Growth appears to create material operational or economic strain", sub: "Commercial expansion may be outpacing onboarding, servicing, or economic management capabilities" },
            { score: 2, label: "Growth manageable but operational pressure visible", sub: "The organization can support expansion, though execution consistency may be uneven" },
            { score: 3, label: "Growth generally aligned with operating capacity", sub: "Expansion appears supportable under current management and infrastructure conditions" },
            { score: 4, label: "Growth supported through defined operational coordination", sub: "Commercial expansion, servicing, and economic management appear reasonably integrated" },
            { score: 5, label: "Growth strategy integrated with portfolio economics and operating scalability", sub: "The franchise demonstrates disciplined alignment between commercial expansion, operational capacity, and economic management" }
          ]
        }
      ]
    },

    // ── 03 Margin & Cost Structure ───────────────────────────────────────
    {
      id: "margin_cost",
      name: "Margin & Cost Structure",
      weight: 0.20,
      subtitle: "How visible and disciplined the portfolio's operating economics are",
      questions: [
        {
          id: "MC1",
          title: "Gross economic margin — current band",
          desc: "What is the approximate gross margin of the payments portfolio after direct costs, where this data is available?",
          options: [
            { score: 0, label: "Below 25%", sub: "The portfolio may be operating with structurally limited economic flexibility" },
            { score: 2, label: "25–40%", sub: "Economic margin appears relatively thin and may be sensitive to mix, pricing, or cost changes" },
            { score: 3, label: "40–55%", sub: "Economics appear workable, though meaningful improvement levers may exist" },
            { score: 4, label: "55–70%", sub: "The portfolio appears to have strong economic capacity with room to invest while maintaining discipline" },
            { score: 5, label: "Above 70%", sub: "The franchise appears to have strong structural economics relative to direct cost burden" }
          ]
        },
        {
          id: "MC2",
          title: "Exception and repair rate — manual intervention burden",
          desc: "What percentage of payments require manual repair, exception handling, or operational intervention before completion?",
          options: [
            { score: 0, label: "Above 5%", sub: "Manual intervention appears elevated enough to create material operational and economic pressure" },
            { score: 1, label: "3–5%", sub: "Exception volume may represent a meaningful operating burden and should be reviewed" },
            { score: 3, label: "1.5–3%", sub: "Exception levels appear manageable but may still warrant targeted improvement" },
            { score: 4, label: "0.5–1.5%", sub: "Exception levels appear controlled and likely manageable within normal operating discipline" },
            { score: 5, label: "Below 0.5%", sub: "The franchise demonstrates strong STP discipline and low manual intervention burden" }
          ]
        },
        {
          id: "MC3",
          title: "Repair cost visibility — economic impact of exceptions",
          desc: "How consistently is the cost and business impact of exception handling measured, owned, and reviewed?",
          options: [
            { score: 0, label: "Not measured", sub: "The economic impact of repairs is not visible in management routines" },
            { score: 2, label: "Directional estimate only", sub: "Awareness exists, but the data is not yet reliable enough to drive consistent decisions" },
            { score: 3, label: "Measured periodically but not embedded in operating rhythm", sub: "Some discipline exists, though review and ownership may be inconsistent" },
            { score: 4, label: "Measured and reviewed as a standing KPI", sub: "Repair cost is visible, owned, and incorporated into operating review" },
            { score: 5, label: "Linked to roadmap priorities and accountability", sub: "Exception reduction is operationalized through product, technology, and performance routines" }
          ]
        },
        {
          id: "MC4",
          title: "Unit cost discipline — cost per payment tracked and used",
          desc: "How consistently is cost per payment tracked and incorporated into pricing, investment, and operating decisions?",
          options: [
            { score: 0, label: "No unit cost tracking", sub: "Pricing and investment decisions lack a consistent economic cost anchor" },
            { score: 2, label: "Partial tracking — data exists but is not operationalized", sub: "Some cost visibility exists, though usage in management decisions appears limited" },
            { score: 3, label: "Tracked and reviewed periodically", sub: "Baseline cost discipline exists, though operating integration may vary" },
            { score: 4, label: "Used consistently in pricing decisions and deal governance", sub: "Unit economics are incorporated into approval, pricing, and management review processes" },
            { score: 5, label: "Embedded in product design, roadmap, and pricing strategy", sub: "Unit economics are consistently incorporated into major portfolio and investment decisions" }
          ]
        },
        {
          id: "MC5",
          title: "External cost management — correspondents, networks, and vendors",
          desc: "How actively are third-party costs managed as part of the portfolio's operating economics?",
          options: [
            { score: 1, label: "High dependency with limited visibility or management", sub: "External cost exposure may be creating structural economic pressure" },
            { score: 2, label: "Costs managed reactively or deal-by-deal", sub: "Cost discipline exists in specific situations but is not yet systematic" },
            { score: 3, label: "Contracts reviewed and routing considered periodically", sub: "Some economic management is present, though optimization may be inconsistent" },
            { score: 4, label: "Managed through routing strategy and contract structure", sub: "External cost discipline is visible and incorporated into operating decisions" },
            { score: 5, label: "Continuously evaluated across providers, rails, and economics", sub: "External cost management is treated as a strategic portfolio lever" }
          ]
        },
        {
          id: "MC6",
          title: "Pricing override discipline — discounting and exception control",
          desc: "How controlled is deal-level discounting, and is override frequency measured, governed, and reviewed?",
          options: [
            { score: 1, label: "Overrides are frequent and not consistently tracked", sub: "Pricing discipline appears fragmented and the economic impact may be difficult to assess" },
            { score: 2, label: "Some controls exist but are inconsistently applied", sub: "Governance exists, though override behavior may not be fully visible or enforced" },
            { score: 3, label: "Controls in place for large deals; broader portfolio varies", sub: "Top-of-book discipline exists, though consistency across the portfolio may be uneven" },
            { score: 4, label: "Override controls active with analytics and approval tiers", sub: "Discounting is measured, governed, and reviewed through a defined process" },
            { score: 5, label: "Pricing discipline governed with documented authority and analytics", sub: "Override behavior is measurable, controlled, and incorporated into economic management routines" }
          ]
        },
        {
          id: "MC7",
          title: "Economic resilience — sensitivity to rate and volume mix shifts",
          desc: "How well does the portfolio understand and manage sensitivity to rate changes, volume mix shifts, or client behavior changes?",
          options: [
            { score: 1, label: "Highly sensitive with limited response levers", sub: "Small changes may create material economic pressure without clear mitigation options" },
            { score: 2, label: "Some sensitivity understood directionally", sub: "Exposure is recognized, though response options may be limited or informal" },
            { score: 3, label: "Manageable exposure with some available levers", sub: "Economic resilience appears reasonable, though response playbooks may not be formalized" },
            { score: 4, label: "Resilient with multiple levers understood", sub: "Pricing, mix, cost, and portfolio actions can be coordinated when conditions change" },
            { score: 5, label: "Resilience actively managed through documented playbooks", sub: "Sensitivity is monitored and response actions are owned, tested, and incorporated into management discipline" }
          ]
        }
      ]
    },

    // ── 04 Multi-Rail Strategy ───────────────────────────────────────────
    {
      id: "multi_rail",
      name: "Multi-Rail Strategy & Future Readiness",
      weight: 0.15,
      subtitle: "How prepared the franchise is to adapt economically as payment infrastructure evolves",
      questions: [
        {
          id: "MR1",
          title: "Real-time payments capability — RTP / FedNow",
          desc: "How aligned is real-time payment capability with the institution's strategic client, product, and monetization priorities?",
          options: [
            { score: 1, label: "Limited or receive-only capability", sub: "Real-time payment readiness may be misaligned with emerging client and product expectations" },
            { score: 2, label: "Capability in pilot or early implementation", sub: "Real-time functionality exists, though commercial use and operating integration remain limited" },
            { score: 3, label: "Available for selected segments or use cases", sub: "Capability is present in defined areas, though broader monetization and adoption may vary" },
            { score: 4, label: "Scaled capability aligned to defined commercial use cases", sub: "Real-time payments are incorporated into product strategy and client-facing propositions" },
            { score: 5, label: "Real-time capabilities integrated into portfolio strategy", sub: "Real-time payment functionality is aligned with client needs, product design, risk controls, and monetization strategy" }
          ]
        },
        {
          id: "MR2",
          title: "ISO 20022 implementation and operational leverage",
          desc: "How effectively is structured payment data being used to improve operational quality, analytics, and client value?",
          options: [
            { score: 1, label: "Not started or limited readiness", sub: "Structured data capability may not yet support operational or analytical improvement" },
            { score: 2, label: "Migration underway; benefits not yet operationalized", sub: "Infrastructure work is progressing, though economic and operational value remains limited" },
            { score: 3, label: "Implemented but not consistently leveraged", sub: "Compliance or technical readiness exists, though structured data is not yet fully embedded into operations" },
            { score: 4, label: "Implemented and used to improve STP and data quality", sub: "Structured data is contributing to operational improvement and better management visibility" },
            { score: 5, label: "Structured data leveraged for automation, analytics, and client value", sub: "ISO data is operationalized across STP improvement, analytics, pre-validation, and client-level insight" }
          ]
        },
        {
          id: "MR3",
          title: "Rail selection and routing discipline",
          desc: "How consistently is payment routing evaluated as an economic, service, risk, and client-experience decision?",
          options: [
            { score: 1, label: "Static defaults with limited routing discipline", sub: "Routing decisions appear largely historical or operational rather than economically evaluated" },
            { score: 2, label: "Basic routing rules exist", sub: "Some routing structure is present, though economic management is limited" },
            { score: 3, label: "Routing reviewed for major flows or client needs", sub: "Optimization exists in selected areas, though broader application may be inconsistent" },
            { score: 4, label: "Routing incorporated into economic and service evaluation", sub: "Routing decisions are managed across cost, speed, risk, and client-service considerations" },
            { score: 5, label: "Routing strategy integrated into portfolio economics", sub: "Rail selection is consistently evaluated as part of strategic portfolio, pricing, and operating discipline" }
          ]
        },
        {
          id: "MR4",
          title: "Cross-border and correspondent flow management",
          desc: "Where cross-border or correspondent flows are in scope, how consistently are major flows managed across pricing, partner strategy, service model, and economic visibility? Select 'Not applicable' if these flows are not in scope.",
          options: [
            { score: null, label: "Not applicable", sub: "Cross-border or correspondent flows are not part of this portfolio" },
            { score: 2, label: "Managed reactively or case-by-case", sub: "Flow management appears event-driven, with limited strategic or economic structure" },
            { score: 3, label: "Defined approach for major flows", sub: "Core flow structures are documented, though broader management consistency may vary" },
            { score: 4, label: "Major flows actively managed with economic visibility", sub: "Pricing, partner strategy, service expectations, and economics are reviewed across priority flows" },
            { score: 5, label: "Cross-border and correspondent flows integrated into portfolio strategy", sub: "Major flows are managed through structured economic, partner, client, and operating discipline" }
          ]
        },
        {
          id: "MR5",
          title: "Reference data and payment data quality",
          desc: "How mature is data quality discipline, and how effectively is it used to improve STP, reduce exceptions, and support better client outcomes?",
          options: [
            { score: 1, label: "Significant data quality gaps", sub: "Data quality may be contributing to elevated repairs, rejections, or operational friction" },
            { score: 2, label: "Improving but still inconsistent", sub: "Progress is underway, though operational drag from data quality remains visible" },
            { score: 3, label: "Stable baseline with acceptable data quality", sub: "Data quality appears manageable, though not yet a strategic operating lever" },
            { score: 4, label: "High quality monitored through defined KPIs", sub: "Data quality is owned, tracked, and incorporated into operational improvement routines" },
            { score: 5, label: "Data quality enables automation and proactive validation", sub: "Reference and payment data discipline supports STP improvement, exception reduction, and client-level analytics" }
          ]
        },
        {
          id: "MR6",
          title: "Fraud and risk control integration into payment flows",
          desc: "How effectively are fraud, risk, and control requirements integrated into payment flow design and client experience?",
          options: [
            { score: 1, label: "Controls reactive or late-stage", sub: "Risk involvement may create friction because it is not sufficiently integrated into flow design" },
            { score: 2, label: "Controls in place but friction remains meaningful", sub: "Risk discipline exists, though operating experience and speed may be affected" },
            { score: 3, label: "Balanced controls with tradeoffs understood", sub: "Risk and speed tradeoffs are recognized and periodically reviewed" },
            { score: 4, label: "Controls integrated into payment flow design", sub: "Risk requirements are incorporated early enough to support predictable execution and client experience" },
            { score: 5, label: "Risk posture supports product and client strategy", sub: "Control design is integrated, scalable, and positioned as part of the franchise's institutional value proposition" }
          ]
        },
        {
          id: "MR7",
          title: "Product and platform modernization cadence",
          desc: "How predictable and outcome-oriented is the technology delivery cadence for the payments platform?",
          options: [
            { score: 1, label: "Delivery stalled or highly unpredictable", sub: "Platform gaps may be widening relative to client, product, or operational requirements" },
            { score: 2, label: "Occasional releases with limited predictability", sub: "Delivery occurs, though execution consistency and business linkage may be limited" },
            { score: 3, label: "Regular release cadence established", sub: "Baseline predictability exists, though business impact may not be consistently measured" },
            { score: 4, label: "Predictable releases tied to business outcome KPIs", sub: "Technology delivery is connected to measurable product, operational, or economic objectives" },
            { score: 5, label: "Modernization cadence integrated into strategic portfolio priorities", sub: "Platform delivery is governed as a portfolio investment discipline with clear economic and operational outcomes" }
          ]
        }
      ]
    },

    // ── 05 Balance Sheet & Liquidity ─────────────────────────────────────
    {
      id: "balance_liquidity",
      name: "Balance Sheet & Liquidity Contribution",
      weight: 0.20,
      subtitle: "How intentionally payment activity contributes to broader treasury, liquidity, and relationship economics",
      questions: [
        {
          id: "BL1",
          title: "Operating balance linkage to payment relationships",
          desc: "How consistently are payment relationships connected to operating balances or broader treasury value?",
          options: [
            { score: 1, label: "Limited linkage between payments and balances", sub: "Payment activity appears largely transactional with minimal treasury integration" },
            { score: 2, label: "Some balance linkage exists for selected relationships", sub: "Treasury value is recognized in parts of the portfolio, though consistency may vary" },
            { score: 3, label: "Core payment relationships generally support balances", sub: "Operating balances contribute to relationship economics across major client segments" },
            { score: 4, label: "Balance linkage incorporated into relationship management", sub: "Payments and treasury economics are evaluated together across major commercial relationships" },
            { score: 5, label: "Operating balances strategically integrated into franchise economics", sub: "Payment activity, treasury value, and relationship economics are consistently managed together across the portfolio" }
          ]
        },
        {
          id: "BL2",
          title: "Visibility into balance-adjusted relationship economics",
          desc: "How consistently are balances, liquidity contribution, or treasury value incorporated into relationship evaluation and pricing decisions?",
          options: [
            { score: 1, label: "Relationship economics evaluated primarily on fee activity", sub: "Broader treasury or liquidity contribution may not be consistently incorporated into economic evaluation" },
            { score: 2, label: "Balance contribution considered selectively", sub: "Some treasury value awareness exists, though application may vary across teams or segments" },
            { score: 3, label: "Balance-adjusted economics incorporated for major relationships", sub: "Relationship evaluation includes broader economic contribution in key areas of the portfolio" },
            { score: 4, label: "Treasury contribution integrated into pricing and relationship review", sub: "Liquidity and balance value are incorporated into management and commercial decision-making" },
            { score: 5, label: "Balance-adjusted economics operationalized across the franchise", sub: "Relationship economics consistently incorporate fee, liquidity, and treasury contribution across portfolio management routines" }
          ]
        },
        {
          id: "BL3",
          title: "Treasury and payments coordination",
          desc: "How effectively are treasury, liquidity, and payments teams aligned operationally and strategically?",
          options: [
            { score: 1, label: "Payments and treasury operate largely independently", sub: "Economic coordination across treasury and payment activity appears limited" },
            { score: 2, label: "Coordination occurs selectively or relationship-by-relationship", sub: "Some alignment exists, though integration may depend on specific clients or initiatives" },
            { score: 3, label: "Core treasury and payments coordination established", sub: "Major relationships and strategic decisions include cross-functional alignment" },
            { score: 4, label: "Treasury coordination integrated into operating routines", sub: "Liquidity, payments, and relationship economics are regularly reviewed together" },
            { score: 5, label: "Treasury and payments strategy integrated across the franchise", sub: "The organization demonstrates coordinated management of payments, liquidity, and broader relationship economics" }
          ]
        },
        {
          id: "BL4",
          title: "Stability and durability of operating balances",
          desc: "How stable and relationship-linked are balances associated with payment activity?",
          options: [
            { score: 1, label: "Balances highly volatile or operationally transient", sub: "Liquidity contribution may be difficult to rely on consistently across the portfolio" },
            { score: 2, label: "Some stable balances exist but durability varies", sub: "Relationship stickiness appears uneven across segments or client types" },
            { score: 3, label: "Core balances generally stable across major relationships", sub: "Payment-linked balances contribute to reasonable relationship durability" },
            { score: 4, label: "Balances demonstrate meaningful operating stickiness", sub: "Liquidity value appears connected to broader client operating workflows and treasury behavior" },
            { score: 5, label: "Operating balances strategically embedded into relationship economics", sub: "Payment activity contributes to durable treasury relationships and long-term liquidity value" }
          ]
        },
        {
          id: "BL5",
          title: "Liquidity economics awareness in portfolio decisions",
          desc: "How consistently are funding, liquidity, or balance sheet considerations incorporated into strategic portfolio decisions?",
          options: [
            { score: 1, label: "Liquidity economics rarely incorporated into payment decisions", sub: "Portfolio decisions may focus primarily on transaction activity or fee generation" },
            { score: 2, label: "Some awareness exists but application is inconsistent", sub: "Liquidity considerations are recognized, though operational integration may be limited" },
            { score: 3, label: "Liquidity considerations incorporated for major decisions", sub: "Treasury and funding impact are evaluated in key pricing or relationship discussions" },
            { score: 4, label: "Liquidity economics integrated into portfolio evaluation", sub: "Balance sheet considerations are incorporated into strategic and operating decisions" },
            { score: 5, label: "Liquidity contribution operationalized across franchise management", sub: "Funding value, treasury impact, and relationship economics are consistently integrated into portfolio steering routines" }
          ]
        },
        {
          id: "BL6",
          title: "Client treasury relationship depth",
          desc: "How deeply embedded is the franchise within the client's broader treasury and operating environment?",
          options: [
            { score: 1, label: "Relationships largely transactional", sub: "The franchise may have limited visibility into broader client treasury workflows or operating dependence" },
            { score: 2, label: "Some treasury engagement exists for selected clients", sub: "Relationship depth varies materially across the portfolio" },
            { score: 3, label: "Core clients demonstrate reasonable treasury integration", sub: "Payments relationships contribute to broader treasury engagement across major segments" },
            { score: 4, label: "Treasury integration supports relationship durability", sub: "The franchise participates meaningfully in client operating and treasury workflows" },
            { score: 5, label: "Treasury relationship depth strategically incorporated into franchise management", sub: "The organization demonstrates durable operating integration across payments, treasury, and client liquidity management" }
          ]
        },
        {
          id: "BL7",
          title: "Strategic use of payments to strengthen franchise value",
          desc: "How intentionally does the organization use payment activity to deepen broader banking, treasury, or client relationships?",
          options: [
            { score: 1, label: "Payments managed primarily as standalone transaction services", sub: "Broader franchise value creation may be limited or inconsistently pursued" },
            { score: 2, label: "Some strategic relationship expansion exists", sub: "Payments contribute to broader relationships selectively, though integration may vary" },
            { score: 3, label: "Payments support broader relationship development in key segments", sub: "The franchise demonstrates reasonable alignment between payments and broader banking relationships" },
            { score: 4, label: "Payments incorporated into relationship expansion strategy", sub: "Client economics, treasury engagement, and operating activity are considered together" },
            { score: 5, label: "Payments strategically integrated into franchise relationship economics", sub: "The organization consistently uses payment activity to strengthen treasury engagement, client operating dependence, and broader relationship value" }
          ]
        }
      ]
    },

    // ── 06 Governance & Operating Model ─────────────────────────────────
    {
      id: "governance",
      name: "Governance & Operating Model",
      weight: 0.15,
      subtitle: "How consistently the franchise governs, prioritizes, and steers portfolio economics",
      questions: [
        {
          id: "GO1",
          title: "Executive ownership of payments economics",
          desc: "How clearly are portfolio economics owned and governed at the executive level?",
          options: [
            { score: 1, label: "Ownership fragmented across multiple groups", sub: "Economic accountability appears distributed without a consistent operating structure" },
            { score: 2, label: "Ownership exists but coordination is inconsistent", sub: "Management responsibility is partially defined, though integration across functions may vary" },
            { score: 3, label: "Clear ownership for major product and economic areas", sub: "Core governance exists, though enterprise coordination may not yet be fully integrated" },
            { score: 4, label: "Cross-functional governance with defined accountability", sub: "Payments economics are governed through structured management routines and ownership models" },
            { score: 5, label: "Executive steering integrated across portfolio economics", sub: "Economic prioritization, governance, and portfolio management are consistently coordinated across leadership functions" }
          ]
        },
        {
          id: "GO2",
          title: "Economic KPI integration into management routines",
          desc: "How consistently are economic metrics incorporated into operating reviews and strategic decision-making?",
          options: [
            { score: 1, label: "Metrics tracked inconsistently or operationally only", sub: "Economic visibility may exist in pockets but is not consistently incorporated into management cadence" },
            { score: 2, label: "Some KPIs reviewed periodically", sub: "Basic economic reporting exists, though integration into decision-making may be uneven" },
            { score: 3, label: "Core KPIs reviewed across major portfolio areas", sub: "Management routines include economic review, though consistency may vary across functions" },
            { score: 4, label: "Economic KPIs integrated into governance and prioritization", sub: "Metrics are consistently used in pricing, investment, and operating review discussions" },
            { score: 5, label: "Portfolio economics embedded into executive steering", sub: "Economic performance, prioritization, and portfolio tradeoffs are operationalized across management routines" }
          ]
        },
        {
          id: "GO3",
          title: "Cross-functional integration — product, finance, operations, treasury",
          desc: "How effectively are economic decisions coordinated across major functional stakeholders?",
          options: [
            { score: 1, label: "Functions operate largely independently", sub: "Economic management appears siloed across operational and commercial groups" },
            { score: 2, label: "Coordination occurs selectively or reactively", sub: "Cross-functional engagement exists but may depend on specific initiatives or escalations" },
            { score: 3, label: "Core coordination exists for major decisions", sub: "Key stakeholders participate in economic management, though integration depth may vary" },
            { score: 4, label: "Cross-functional operating cadence established", sub: "Economic decisions are routinely coordinated across product, finance, operations, and treasury" },
            { score: 5, label: "Integrated operating model with shared economic priorities", sub: "Portfolio economics are consistently managed through coordinated enterprise decision-making" }
          ]
        },
        {
          id: "GO4",
          title: "Pricing governance and approval discipline",
          desc: "How structured and enforceable is pricing governance across the payments portfolio?",
          options: [
            { score: 1, label: "Pricing decisions largely decentralized", sub: "Governance consistency may be limited across products, segments, or relationship teams" },
            { score: 2, label: "Basic approval processes exist", sub: "Pricing controls are present, though enforcement and visibility may vary" },
            { score: 3, label: "Governance established for major pricing decisions", sub: "Pricing oversight exists, though application across the broader portfolio may not be fully standardized" },
            { score: 4, label: "Pricing governance operationalized with escalation controls", sub: "Approval structures, override review, and accountability are consistently incorporated" },
            { score: 5, label: "Pricing discipline integrated into portfolio management", sub: "Pricing governance operates as a strategic management process tied to broader portfolio economics" }
          ]
        },
        {
          id: "GO5",
          title: "Portfolio prioritization discipline",
          desc: "How consistently does management prioritize investments, remediation, and strategic focus areas using economic and operational criteria?",
          options: [
            { score: 1, label: "Prioritization largely reactive or relationship-driven", sub: "Resource allocation may lack consistent economic or strategic evaluation" },
            { score: 2, label: "Some prioritization frameworks exist", sub: "Decision criteria are partially defined, though application may vary across teams" },
            { score: 3, label: "Major initiatives evaluated against defined criteria", sub: "Core governance exists, though portfolio-wide prioritization may not yet be fully integrated" },
            { score: 4, label: "Economic and operational prioritization operationalized", sub: "Management decisions consistently incorporate economic impact and strategic alignment" },
            { score: 5, label: "Enterprise prioritization tied to portfolio economics and strategy", sub: "The franchise demonstrates disciplined allocation of investment, remediation, and strategic focus across the portfolio" }
          ]
        },
        {
          id: "GO6",
          title: "Management visibility into portfolio economics",
          desc: "How consistently can leadership evaluate economic performance across rails, segments, products, and operating structures?",
          options: [
            { score: 1, label: "Visibility fragmented across systems or teams", sub: "Management may lack a consistent enterprise view of portfolio economics" },
            { score: 2, label: "Some reporting exists but integration is limited", sub: "Economic visibility is available in specific areas, though enterprise coordination may be incomplete" },
            { score: 3, label: "Core portfolio visibility established", sub: "Leadership can evaluate major areas of the portfolio, though consistency may vary" },
            { score: 4, label: "Integrated reporting supports strategic review", sub: "Economic visibility is incorporated into governance and operating discussions" },
            { score: 5, label: "Portfolio economics consistently operationalized at management level", sub: "Leadership can evaluate and steer economic behavior across the franchise through integrated visibility and governance routines" }
          ]
        },
        {
          id: "GO7",
          title: "Governance adaptability as payment complexity evolves",
          desc: "How effectively can the governance model adapt as payment rails, products, and operating complexity evolve?",
          options: [
            { score: 1, label: "Governance structure struggles to adapt to change", sub: "New products, rails, or operating demands may create coordination and prioritization pressure" },
            { score: 2, label: "Adaptation occurs but tends to be reactive", sub: "Governance can respond to change, though integration and execution may lag evolving complexity" },
            { score: 3, label: "Governance evolves periodically with business needs", sub: "The operating model demonstrates baseline adaptability across major initiatives" },
            { score: 4, label: "Governance model designed to support evolving portfolio complexity", sub: "Management structures are capable of integrating new rails, products, and economic considerations" },
            { score: 5, label: "Adaptive governance integrated into strategic portfolio management", sub: "The franchise demonstrates scalable governance discipline as payment infrastructure and operating complexity evolve" }
          ]
        }
      ]
    }
  ];

  // ── Recommendations library ──────────────────────────────────────────────
  const recommendations = {
    R1:  { title: "Design and implement segmented pricing by client value and corridor", owner: "Product + Sales + Finance", metric: "Revenue per client, margin by segment, elasticity tracking", why: "Closes monetization capture gaps without depending on volume growth." },
    R2:  { title: "Establish rail-level price floors and enforce override controls", owner: "Pricing + Sales Leadership", metric: "Override rate, margin leakage by deal, governance cycle time", why: "Stops silent margin erosion from inconsistent deal-by-deal discounting." },
    R3:  { title: "Redesign packaging model — structured bundle and add-on value tiers", owner: "Product", metric: "ARPA, attach rate, margin contribution per tier", why: "Creates clear levers to capture value and reduces structural bundle leakage." },
    R4:  { title: "Build and implement balance-adjusted pricing model", owner: "Product + Treasury + Finance", metric: "ROE contribution, balance-weighted profitability by client", why: "Aligns payments pricing with total franchise value — not just fee revenue." },
    R5:  { title: "Develop corridor-based FX strategy with spread management discipline", owner: "Product + Trading/FX + Sales", metric: "FX capture rate, spread leakage by corridor, corridor-level P&L", why: "Converts cross-border flows into a deliberately managed revenue lever." },
    R6:  { title: "Launch Exception Reduction Program with repair KPI ownership and cadence", owner: "Ops + Product + Tech", metric: "Repair rate, STP %, cost per repair, trend vs. target", why: "Repairs are often the largest untracked driver of margin compression in commercial payments." },
    R7:  { title: "Deploy pre-validation targeting top payment failure modes by rail", owner: "Product + Tech + Ops", metric: "Failure reason frequency, repair reduction rate", why: "Reduces exception volume at the source — improving both margin and client experience." },
    R8:  { title: "Build unit cost model by rail and segment — and use it in pricing governance", owner: "Finance + Product", metric: "Unit cost by rail, segment price floors, contribution margin", why: "Provides the cost anchor needed for disciplined pricing and roadmap tradeoff decisions." },
    R9:  { title: "Optimize correspondent and network costs through routing strategy and contract structure", owner: "Network Management + Product + Finance", metric: "Cost per payment by rail, correspondent and network fee trends", why: "Improves gross margin through structural external cost levers that are often overlooked." },
    R10: { title: "Create STP scorecard by rail and client segment with standing ownership", owner: "Ops + Product", metric: "STP % by rail and segment, repair rates, trend vs. target", why: "Directs leakage reduction effort where the margin impact is highest." },
    R11: { title: "Build segment-level GTM plays anchored in client economics", owner: "Product + Sales", metric: "Win rate, margin per win, attach rate by segment", why: "Makes growth repeatable and ensures new clients contribute positively to the P&L." },
    R12: { title: "Strengthen ERP, TMS, and AP/AR integration motion for top client segments", owner: "Product + Tech + Sales", metric: "Integration adoption rate, time-to-onboard, NPS post-integration", why: "Increases structural stickiness and reduces the risk of relationship-dependent attrition." },
    R13: { title: "Realign sales incentives toward margin quality, attach rate, and balance contribution", owner: "Sales Leadership + Finance", metric: "Margin per client, attach rate, discounting frequency by rep", why: "Prevents volume-driven growth that systematically destroys profitability." },
    R14: { title: "Build a win/loss feedback loop tied to pricing, onboarding friction, and CX", owner: "Product + Sales Ops", metric: "Loss reason distribution, time-to-yes, onboarding friction scores", why: "Converts market signals into execution priorities — not just anecdotes." },
    R15: { title: "Scale RTP/FedNow send and develop packaged commercial use cases", owner: "Product + Tech + Sales", metric: "RTP send volume, use-case adoption rate, revenue contribution", why: "Converts infrastructure readiness into a commercial growth lever." },
    R16: { title: "ISO 20022 data program focused on STP improvement and repair reduction", owner: "Tech + Ops + Product", metric: "Data quality KPIs, repair driver analysis, STP rate trend", why: "Structured payment data is an underutilized margin and CX improvement lever." },
    R17: { title: "Implement economics-aware routing strategy across rails and corridors", owner: "Product + Tech", metric: "Routing distribution by rail, cost per payment, SLA performance", why: "Optimizes cost and performance across rails — a lever most franchises underuse." },
    R18: { title: "Establish Pricing Council with documented authority tiers and regular cadence", owner: "Exec Sponsor + Pricing Lead", metric: "Override rate, approval cycle time, margin integrity trend", why: "Governance is often the fastest first fix for systematic pricing leakage." },
    R19: { title: "Implement monthly Portfolio Performance Review across rails, segments, and repairs", owner: "Portfolio Owner", metric: "Pillar KPIs trending, actions opened and closed per cycle", why: "Creates the operating rhythm needed to continuously improve franchise performance." },
    R20: { title: "Tie technology roadmap sequencing to economic KPIs — margin, STP, and attach", owner: "Product + Tech + Finance", metric: "Roadmap ROI by release, KPI movement attributable to delivery", why: "Ensures technology delivery is managed as a business investment, not just an engineering activity." }
  };

  // ── Rules engine ─────────────────────────────────────────────────────────
  const rules = [

    // Tier 1 — Structural Concern
    {
      id: "exception_margin_crisis",
      tier: 1,
      when: (a) => (a.MC2 <= 1 && a.MC3 <= 1),
      diagnosis: "Exception and repair volume appears elevated enough to create meaningful operational and economic pressure. The pattern suggests a dedicated program with named ownership and defined repair rate targets may be warranted.",
      recs: ["R6", "R10", "R19", "R8"]
    },
    {
      id: "operating_system_absent",
      tier: 1,
      when: (a) => (a.GO3 <= 1 || a.GO4 <= 1),
      diagnosis: "The portfolio appears to lack a consistently functioning management system. Where KPIs are undefined or cross-functional governance is absent, sustained execution and economic prioritization become structurally difficult.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "pricing_governance_breakdown",
      tier: 1,
      when: (a) => (a.GO2 <= 1 && (a.MC6 <= 2 || a.RA3 <= 2 || a.MC4 <= 2)),
      diagnosis: "Pricing governance appears fragmented, with limited visibility into deal-level economics and override discipline. This pattern may be associated with gradual monetization inconsistency across the portfolio.",
      recs: ["R18", "R2", "R13"]
    },

    // Tier 2 — Monetization & Margin Attention Areas
    {
      id: "monetization_capture_gap",
      tier: 2,
      when: (a) => (a.RA5 <= 2 && a.GE5 >= 3),
      diagnosis: "Commercial activity appears active, but revenue growth may not be scaling consistently with portfolio expansion. This pattern may suggest a pricing design or packaging structure worth reviewing.",
      recs: ["R1", "R3", "R2"]
    },
    {
      id: "pricing_leakage_controls_weak",
      tier: 2,
      when: (a) => (a.MC6 <= 2 || a.GO2 <= 2),
      diagnosis: "Override and discounting controls appear inconsistent. Where governance is applied unevenly across the portfolio, cumulative pricing divergence may be difficult to evaluate at the aggregate level.",
      recs: ["R2", "R18", "R13"]
    },
    {
      id: "exceptions_material_not_crisis",
      tier: 2,
      when: (a) => (a.MC2 <= 3 && a.MC2 >= 2),
      diagnosis: "Exception and repair volume appears at a level that may warrant targeted review. The operating burden from manual intervention may also be creating client experience friction worth evaluating.",
      recs: ["R6", "R10", "R7"]
    },
    {
      id: "unit_cost_immature",
      tier: 2,
      when: (a) => (a.MC4 <= 2 || a.RA3 <= 2),
      diagnosis: "Unit cost and rail-level economics appear to have limited visibility or operational integration. Without consistent cost anchoring, pricing discipline and investment prioritization may rely on incomplete information.",
      recs: ["R8", "R20", "R19"]
    },
    {
      id: "cadence_weak_not_absent",
      tier: 2,
      when: (a) => (a.GO3 === 2 || a.GO4 === 2),
      diagnosis: "An operating cadence appears to exist but may lack the consistency and follow-through needed to drive sustained execution. Where actions do not reliably close, structural improvement can be slow.",
      recs: ["R19", "R20", "R18"]
    },
    {
      id: "balances_not_monetized",
      tier: 2,
      when: (a) => (a.BL1 <= 2 && a.BL4 <= 2),
      diagnosis: "Balance contribution from payment relationships appears to have limited visibility or integration into pricing and relationship decisions. This pattern may suggest broader treasury value is not consistently reflected in economic evaluation.",
      recs: ["R4", "R13", "R19"]
    },
    {
      id: "fx_without_corridor",
      tier: 2,
      when: (a) => (a.MR4 !== null && a.MR4 <= 2 && a.RA6 >= 3),
      diagnosis: "FX-related payment activity appears present but cross-border flow management and spread discipline may not be fully operationalized. This pattern may be associated with inconsistent FX monetization across the portfolio.",
      recs: ["R5", "R1", "R19"]
    },
    {
      id: "fx_spread_leakage",
      tier: 2,
      when: (a) => (a.RA6 >= 2 && a.RA6 <= 3 && a.MR4 !== null && a.MR4 <= 3),
      diagnosis: "Cross-border FX activity is present but spread management and corridor economics may not be consistently applied. This pattern tends to become more visible as cross-border volume grows.",
      recs: ["R5", "R17", "R8"]
    },
    {
      id: "rtp_readiness_gap",
      tier: 2,
      when: (a) => (a.MR1 <= 2 && a.GE3 >= 3),
      diagnosis: "Client workflow integration appears active, but real-time payment capability may be limiting the range of commercially available use cases. This may become a more visible constraint as client expectations evolve.",
      recs: ["R15", "R17", "R11"]
    },

    // Tier 3 — Portfolio Patterns Worth Monitoring
    {
      id: "concentration_risk_extreme",
      tier: 3,
      when: (a) => (a.RA4 <= 1),
      diagnosis: "Revenue concentration appears elevated relative to the broader client base. High concentration may increase sensitivity to individual relationship changes and warrants ongoing portfolio monitoring.",
      recs: ["R11", "R1", "R18"]
    },
    {
      id: "float_dependency_risk",
      tier: 3,
      when: (a) => (a.RA1 <= 1 && a.BL5 <= 2),
      diagnosis: "Revenue mix appears weighted toward balance-driven sources, and rate-cycle sensitivity may not be consistently measured or managed. This pattern may warrant closer evaluation as rate conditions evolve.",
      recs: ["R3", "R4", "R19"]
    },
    {
      id: "rate_cycle_exposure_mature",
      tier: 3,
      when: (a) => (a.BL5 <= 2 && a.BL1 >= 3),
      diagnosis: "Balance contribution appears tracked and meaningful, but rate-cycle sensitivity may not be fully evaluated at the segment or relationship level. This pattern is worth monitoring as the rate environment changes.",
      recs: ["R4", "R3", "R19"]
    },
    {
      id: "rtp_commercial_gap_mature",
      tier: 3,
      when: (a) => (a.MR1 <= 2 && a.GO1 >= 3),
      diagnosis: "The operating model appears reasonably structured, but real-time send capability may not yet be at commercial scale. As client expectations evolve, this gap may become a more visible strategic consideration.",
      recs: ["R15", "R17", "R12"]
    },
    {
      id: "revenue_mix_concentration_mature",
      tier: 3,
      when: (a) => (a.RA1 <= 2 && a.RA5 >= 3),
      diagnosis: "Revenue is growing but mix concentration may remain. As the portfolio matures, intentional diversification across economic drivers may become a more important strategic priority.",
      recs: ["R1", "R3", "R5"]
    }
  ];

  // ── Sub-score mapping ────────────────────────────────────────────────────
  const subScoreMap = {
    monetization: ["revenue_arch", "growth_engine"],
    margin:       ["margin_cost", "governance"],
    readiness:    ["multi_rail", "balance_liquidity"]
  };

  // ── Pillar floor guard ───────────────────────────────────────────────────
  const pillarFloorGuard = {
    threshold: 1.5,
    penalty:   8
  };

  return { pillars, rules, recommendations, subScoreMap, pillarFloorGuard };
})();
