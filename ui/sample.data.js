const data = [
  {
    role: "USER",
    data: "hello",
    createdAt: 1766680835684,
    id: "108e6cb0-4289-4b51-8ec7-2e25856266b1",
    qId: "d45dd7fd-011f-49e8-985d-241a62f9a212_q",
  },
  {
    qId: "d45dd7fd-011f-49e8-985d-241a62f9a212_q",
    role: "ASSISTANT",
    type: "CHAT",
    data: "Hello! How can I assist you today?",
    createdAt: 1766680837502,
    id: "1bbb9102-449e-4d8f-81b2-88a1fb06e3e3",
  },
  {
    qId: "eaeb836f-ddb0-4488-9da0-5ae981192a60_q",
    role: "ASSISTANT",
    type: "CONSENSUS",
    data: {
      title: "Implementing ai in medical field",
      "Executive Summary":
        "Implementing AI in the medical field presents a mix of compelling benefits and significant challenges. On one hand, it offers substantial improvements in healthcare delivery, cost savings, sustainable environmental practices, and community empowerment. On the other hand, there are concerns about data privacy breaches, security vulnerabilities, historical failures, high costs, ethical implications for autonomous systems, and negative environmental impacts associated with energy-intensive data centers.",
      "Direct Trade-offs & Clashes": [
        {
          "Point of Conflict": "Costs vs. Benefits",
          "Explain both sides":
            "* Pros: AI implementation can lead to significant cost savings through improved diagnostics and treatments.\n* Cons: High initial costs for training, maintenance, and ethical considerations.",
        },
        {
          "Point of Conflict": "Environmental Impact vs. Potential Benefits",
          "Explain both sides":
            "* Pros: Promotes sustainable environmental practices with energy-efficient data centers.\n* Cons: Substantial carbon footprint due to large data center operations.",
        },
      ],
      "Decision Framework": {
        "Proceed if": [
          "AI implementation aligns with the core values and risk management strategies of the organization.",
          "Strategic partnerships are established to leverage existing resources, expertise, and ethical frameworks.",
          "Ethical guidelines and oversight mechanisms are in place for autonomous systems.",
        ],
        "Wait/Avoid if": [
          "Data security breaches or privacy violations occur.\n",
          "Unforeseen failures in AI implementation have negative outcomes.\n",
          "High cost constraints remain unresolved despite potential benefits.",
        ],
      },
      "Supporting Evidence": [
        {
          Pro: "Reduces healthcare costs through improved diagnostics and treatments.",
          Con: "Historical failures of AI implementations often result in negative outcomes due to flawed data inputs, biased algorithms, or inadequate testing.",
          Evidence:
            "Past studies show that while AI can reduce costs, implementation is not without challenges (Smith et al., 2021).",
        },
        {
          Pro: "Environmental practices promoted via energy-efficient data centers.",
          Con: "AI implementation leads to significant carbon emissions due to large-scale data center operations.",
          Evidence:
            "Studies indicate that while AI can be eco-friendly, its environmental impact depends on the efficiency of data centers (Greenfield et al., 2019).",
        },
      ],
      "Alternative Options": [
        {
          Option:
            "Implement AI with rigorous training and testing phases to minimize historical failures.",
          Explanation:
            "Balances the need for benefits like cost savings through improved diagnostics and treatments, while addressing concerns about the negative outcomes of past implementations.",
        },
        {
          Option:
            "Establish partnerships with existing ethical frameworks to ensure accountability in the development and use of autonomous systems.",
          Explanation:
            "Fosters a collaborative environment that leverages established best practices for AI implementation, addressing both benefits (like improved healthcare delivery) and concerns (regarding privacy, security, and ethics).",
        },
        {
          Option:
            "Investigate hybrid approaches to AI deployment that blend traditional diagnostic methods with advanced computational models for cost-effective and efficient results.",
          Explanation:
            "Mitigates the financial strain associated with high costs while harnessing the benefits of improved diagnostics and treatments. Also addresses concerns about data privacy, security vulnerabilities, and ethical implications.",
        },
      ],
      "Risk & Uncertainty Analysis": [
        {
          Risk: "Data breaches leading to identity theft and financial loss.",
          Likelihood: "High",
          Impact: "Medium",
        },
        {
          Risk: "Security vulnerabilities in AI systems causing harm or exploitation of sensitive data.",
          Likelihood: "High",
          Impact: "High",
        },
        {
          Risk: "Negative environmental impact due to large-scale energy consumption by data centers.",
          Likelihood: "Medium",
          Impact: "High",
        },
      ],
      "Actionable Recommendations": [
        "Conduct comprehensive risk assessments and implement robust cybersecurity measures, including multi-factor authentication, regular audits, and secure data storage solutions.",
        "Establish clear ethical guidelines for the development and deployment of AI systems to ensure transparency, accountability, and fairness in decision-making processes.",
        "Investigate opportunities for hybrid AI approaches that integrate traditional diagnostic methods with advanced computational models to balance cost efficiency with benefits like improved diagnostics and treatments.",
      ],
      "Scenario Analysis": [
        {
          Scenario:
            "Increased regulatory scrutiny due to heightened public awareness of data privacy issues.",
          "Effect on Pros/Cons":
            "High likelihood of increased costs for compliance, potentially offsetting the financial benefits; however, stringent regulations could mitigate risks associated with data breaches and security vulnerabilities.",
        },
        {
          Scenario:
            "Significant advancements in AI technology leading to decreased energy consumption by data centers.",
          "Effect on Pros/Cons":
            "Positive impact: Reduced carbon footprint from data centers would mitigate environmental concerns. Negative impact: May not alleviate the financial burden of high costs, especially if current regulatory frameworks do not adapt quickly.",
        },
        {
          Scenario:
            "Shift in societal values and priorities favoring sustainable practices over economic growth.",
          "Effect on Pros/Cons":
            "Negative for AI implementation as cost savings are less compelling; positive for environmental benefits but could challenge existing financial constraints. Ethical concerns about equitable access to healthcare remain relevant.",
        },
      ],
      "Consensus Score": {
        Score: 70,
        Explanation:
          "The pros and cons have a balanced view, with significant points from both sides addressing key areas like costs, environmental impact, ethical considerations, historical failures, and security vulnerabilities. While the risks are substantial, there is still potential for substantial benefits that could outweigh the downsides.",
      },
      "Open Questions": [
        "How can we best balance the cost-effectiveness of AI with ongoing concerns about privacy, security, and ethical implications?",
        "What strategies should be implemented to ensure data security and mitigate vulnerabilities in AI systems given their complexity and potential for misuse?",
      ],
      "Next Steps": [
        {
          Action:
            "Conduct a comprehensive risk assessment and develop a robust cybersecurity strategy.",
          Responsible: "IT Security Team",
          Timeline: "Within the next month.",
        },
        {
          Action:
            "Establish an AI ethics board to oversee development and deployment of AI systems, ensuring transparency, accountability, and fairness in decision-making processes.",
          Responsible: "Chief Ethics Officer",
          Timeline: "By the end of the year.",
        },
      ],
    },
    createdAt: 1766681711007,
    id: "d120dc1e-d4ed-490a-86c8-3a9e3833908f",
  },
  {
    role: "USER",
    data: "Implementing ai in medical field",
    createdAt: 1766681032098,
    id: "d5289214-9af8-4591-9abc-a1b0ccb373f8",
    qId: "eaeb836f-ddb0-4488-9da0-5ae981192a60_q",
  },
];
