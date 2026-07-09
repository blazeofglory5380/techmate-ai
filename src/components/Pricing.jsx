const pricing = [
    [
        "Student",
        "Free",
        "A+, Network+, Security+, and CCNA study tools with flashcards, practice exams, labs, and basic AI study help.",
    ],
    [
        "Technician Pro",
        "$29",
        "AI troubleshooting, camera scanner, error database, technician notes, repair reports, and personal repair history.",
    ],
    [
        "Team",
        "$199",
        "Shared ticket queue, team dashboard, technician management, reporting, and secure team knowledge base.",
    ],
    [
        "MSP Business",
        "$499",
        "Client portal, asset management, SLA reporting, multi-client knowledge memory, and operations dashboard.",
    ],
    [
        "Enterprise",
        "Custom",
        "Unlimited users, SSO, API access, security controls, integrations, custom AI training, and analytics.",
    ],
];

function Pricing() {
    return ( <
        section className = "pricing"
        id = "pricing" >
        <
        div className = "section-heading" >
        <
        p className = "eyebrow" > Pricing < /p> <
        h2 > Business pricing that matches real IT team value. < /h2> <
        /div> <
        div className = "pricing-grid" > {
            pricing.map(([plan, price, text]) => ( <
                    article className = { plan === "MSP Business" ? "price-card featured" : "price-card" }
                    key = { plan } >
                    {
                        plan === "MSP Business" && < span className = "badge" > Best
                        for MSPs < /span>} <
                        h3 > { plan } < /h3> <
                        strong > { price } <
                        small > { price === "Free" || price === "Custom" ? "" : " / month" } < /small> <
                        /strong> <
                        p > { text } < /p> <
                        a href = "#home" > Choose Plan < /a> <
                        /article>
                    ))
            } <
            /div> <
            /section>
        );
    }

    export default Pricing;