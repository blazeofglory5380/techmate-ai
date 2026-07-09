import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
    knowledgeCategories,
    normalizeKnowledgeRecord,
    sampleKnowledgeItems,
    skillLevels,
    vendorNames,
} from "./data/knowledgeData";
import KnowledgeBase from "./pages/KnowledgeBase";
import VendorResources from "./pages/VendorResources";
import AIVision from "./pages/AIVision";
import {
    guidedPlaybooks,
    learningCommandGroups,
    learningErrorCodes,
} from "./data/learningResources";
import "./App.css";

const today = new Date().toISOString().slice(0, 10);

const navItems = [
    ["HM", "Home", "/"],
    ["DB", "Dashboard", "/dashboard"],
    ["KB", "Knowledge Base", "/knowledge-base"],
    ["TS", "Troubleshooting", "/troubleshooting"],
    ["ER", "Error Codes", "/error-codes"],
    ["CM", "Commands", "/commands"],
    ["NC", "Network Center", "/network-center"],
    ["LB", "Labs", "/labs"],
    ["RP", "Reports", "/repair-reports"],
    ["AI", "AI Assistant", "/ai-assistant"],
    ["AV", "AI Vision", "/ai-vision"],
    ["UP", "Upload Docs", "/upload"],
    ["VR", "Vendor Resources", "/vendor-resources"],
    ["PF", "Profile", "/profile"],
    ["PR", "Pricing", "/pricing"],
];

const defaultReports = [{
        id: "report-1",
        client: "Acme Dental",
        asset: "Front Desk PC",
        issue: "No internet after office move",
        diagnosis: "DHCP lease landed on the wrong VLAN.",
        fix: "Moved switchport to VLAN 20, renewed lease, verified DNS.",
        status: "Resolved",
        date: today,
    },
    {
        id: "report-2",
        client: "Northline Clinic",
        asset: "HP LaserJet M404",
        issue: "Printer offline for billing desk",
        diagnosis: "Stale TCP/IP port and stuck queue.",
        fix: "Cleared queue, recreated port, restarted spooler.",
        status: "In Progress",
        date: today,
    },
];

const labItems = [{
        id: "lab-1",
        category: "CCNA",
        title: "VLAN and DHCP Packet Tracer",
        status: "In Progress",
        due: "Today",
        progress: 68,
    },
    {
        id: "lab-2",
        category: "CompTIA",
        title: "Network+ Cabling Scenario",
        status: "Ready",
        due: "Friday",
        progress: 24,
    },
    {
        id: "lab-3",
        category: "NetAcad",
        title: "Switch Basics",
        status: "Queued",
        due: "Next week",
        progress: 12,
    },
];

const troubleshootingTopics = [{
        title: "Windows",
        meaning: "Windows issues often come from updates, services, drivers, or file corruption.",
        check: "Confirm OS version, event logs, service status, and recent updates.",
        commands: ["systeminfo", "Get-EventLog -LogName System -Newest 20", "sfc /scannow"],
        next: "If logs show a service or driver error, isolate that component and follow the next fix step.",
    },
    {
        title: "Network",
        meaning: "Network problems are about whether devices can see each other on the LAN and reach the gateway.",
        check: "Verify cable/Wi-Fi, IP address, gateway, VLAN, and switchport status.",
        commands: ["ipconfig /all", "ping <gateway>", "tracert 8.8.8.8"],
        next: "If gateway fails, inspect the local switch port, VLAN, or wireless connection next.",
    },
    {
        title: "Printer",
        meaning: "Printer issues usually mean the PC cannot reach the printer or the print queue is stuck.",
        check: "Confirm printer power, IP address, queue state, and the spooler service.",
        commands: ["ping printer-ip", "Get-Service Spooler", "Restart-Service Spooler"],
        next: "If the printer is reachable, clear the queue and retry the print job.",
    },
    {
        title: "Email",
        meaning: "Email problems usually mean the service, credentials, or DNS records are broken.",
        check: "Confirm account settings, server reachability, and whether mail is blocked by policy.",
        commands: ["nslookup mail.example.com", "Test-Mailflow", "Get-EventLog -LogName Application -Newest 20"],
        next: "If email server reachability fails, verify MX/DNS records and firewall access.",
    },
    {
        title: "Hardware",
        meaning: "Hardware issues are physical: cables, ports, power, memory, or overheating.",
        check: "Inspect connections, test spare parts, and review hardware event logs.",
        commands: ["wmic memchip get capacity", "Get-EventLog -LogName System -Newest 20", "chkdsk C: /scan"],
        next: "If a part looks bad, swap it or move the device to a known-good port.",
    },
    {
        title: "Blue Screen",
        meaning: "A blue screen means Windows crashed due to drivers, memory, or hardware faults.",
        check: "Capture the stop code, recent changes, and review crash dumps or event logs.",
        commands: ["Get-EventLog -LogName System -Newest 20", "chkdsk C: /scan", "sfc /scannow"],
        next: "Use the stop code to narrow the cause, then update or roll back the suspect driver.",
    },
    {
        title: "Security",
        meaning: "Security issues can show as malware, unauthorized access, or blocked services.",
        check: "Verify permissions, firewall rules, antivirus alerts, and suspicious processes.",
        commands: ["whoami /all", "Get-NetFirewallRule -Enabled True", "tasklist /v"],
        next: "If you suspect a threat, isolate the device and collect evidence before remediation.",
    },
];

const defaultProfile = {
    name: "Thea",
    role: "IT Technician / Network Student",
    company: "TechMate Field Ops",
    certs: "A+, Network+, CCNA in progress",
    focus: "Help desk, networking, cybersecurity, field repair",
};

function App() {
    const [reports, setReports] = useLocalStorage("techmate-reports", defaultReports);
    const [uploads, setUploads] = useLocalStorage("techmate-uploads", []);
    const [customKnowledge, setCustomKnowledge] = useLocalStorage("techmate-custom-knowledge", []);
    const [chat, setChat] = useLocalStorage("techmate-chat", [{
        role: "ai",
        text: "How can I help? Describe the issue, paste an error code, or tell me what device you are working on.",
        insight: null,
    }, ]);
    const [favorites, setFavorites] = useLocalStorage("techmate-command-favorites", ["ipconfig /all", "show vlan brief"]);
    const [recentCommands, setRecentCommands] = useLocalStorage("techmate-recent-commands", []);
    const [profile, setProfile] = useLocalStorage("techmate-profile", defaultProfile);
    const [selectedPlan, setSelectedPlan] = useLocalStorage("techmate-plan", "Starter");
    const [labState, setLabState] = useLocalStorage("techmate-labs", labItems);
    const [learningMode, setLearningMode] = useLocalStorage("techmate-learning-mode", "Student");

    const safeReports = ensureArray(reports, defaultReports).map(normalizeReport);
    const safeUploads = ensureArray(uploads);
    const safeCustomKnowledge = ensureArray(customKnowledge);
    const safeChat = ensureArray(chat);
    const safeFavorites = ensureArray(favorites, ["ipconfig /all", "show vlan brief"]);
    const safeRecentCommands = ensureArray(recentCommands);
    const safeProfile = ensureObject(profile, defaultProfile);
    const safeLabState = ensureArray(labState, labItems).map(normalizeLab);
    const safeLearningMode = typeof learningMode === "string" ? learningMode : "Student";
    const safeSelectedPlan = typeof selectedPlan === "string" ? selectedPlan : "Starter";

    const knowledgeRecords = useMemo(
        () => [...sampleKnowledgeItems, ...safeCustomKnowledge.map(normalizeKnowledgeRecord)], [safeCustomKnowledge],
    );

    const data = {
        reports: safeReports,
        setReports,
        uploads: safeUploads,
        setUploads,
        customKnowledge: safeCustomKnowledge,
        setCustomKnowledge,
        knowledgeRecords,
        chat: safeChat,
        setChat,
        favorites: safeFavorites,
        setFavorites,
        recentCommands: safeRecentCommands,
        setRecentCommands,
        profile: safeProfile,
        setProfile,
        selectedPlan: safeSelectedPlan,
        setSelectedPlan,
        labState: safeLabState,
        setLabState,
        learningMode: safeLearningMode,
        setLearningMode,
    };

    return (
        <AppShell profile={safeProfile}>
        <Routes>
        <Route path = "/"
        element = { <HomePage /> }
        /> <Route path = "/dashboard"
        element = { <DashboardPage data = { data } /> } /> <Route path = "/knowledge-base"
        element = { <KnowledgeBase data = { data }
            />} />
            <Route path = "/troubleshooting"
            element = { <TroubleshootingPage data = { data }
                />} />
                <Route path = "/troubleshooting-wizard"
                element = { <TroubleshootingWizardPage data = { data }
                    />} />
                    <Route path = "/error-codes"
                    element = { <ErrorCodesPage data = { data }
                        />} />
                        <Route path = "/commands"
                        element = { <CommandsPage data = { data }
                            />} />
                            <Route path = "/network-center"
                            element = { <NetworkCenterPage /> } />
                                <Route path = "/labs"
                                element = { <LabsPage data = { data }
                                    />} />
                                    <Route path = "/repair-reports"
                                element = { <RepairReportsPage reports = { safeReports }
                                    setReports = { setReports }
                                    />} />
                                    <Route path = "/assistant"
                                    element = { <AssistantPage data = { data }
                                        />} />
                                        <Route path = "/ai-assistant"
                                        element = { <AssistantPage data = { data }
                                            />} />
                                        <Route path = "/ai-vision"
                                        element = { <AIVision data = { data }
                                            />} />
                                            <Route path = "/upload"
                                            element = { <UploadPage data = { data }
                                                />} />
                                                <Route path = "/vendor-resources"
                                                element = { <VendorResources /> }
                                                /> <Route path = "/profile"
                                                element = { <ProfilePage profile = { safeProfile } setProfile = { setProfile } /> } /> <Route path = "/pricing"
                                                element = { <PricingPage selectedPlan = { safeSelectedPlan }
                                                    setSelectedPlan = { setSelectedPlan }
                                                    />} />
                                                    <Route path = "*"
                                                    element = { <FallbackPage /> } />
        </Routes>
        </AppShell>
    );
}

function AppShell({ profile, children }) {
    const isHome = useLocation().pathname === "/";

    if (isHome) {
        return <div className="landing-shell">{children}</div>;
    }

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-wrapper">
                <TopBar profile={profile} />
                <div className="main-shell">{children}</div>
            </div>
        </div>
    );
}

const LANDING_NAV_LINKS = [
    ["Home", "/"],
    ["Dashboard", "/dashboard"],
    ["Troubleshooting", "/troubleshooting"],
    ["Knowledge Base", "/knowledge-base"],
    ["Reports", "/repair-reports"],
    ["Pricing", "/pricing"],
];

const LANDING_MORE_LINKS = [
    ["Error Codes", "/error-codes"],
    ["Commands", "/commands"],
    ["Network Center", "/network-center"],
    ["Labs", "/labs"],
    ["AI Assistant", "/ai-assistant"],
    ["AI Vision", "/ai-vision"],
    ["Upload Docs", "/upload"],
    ["Vendor Resources", "/vendor-resources"],
    ["Profile", "/profile"],
];

function LandingNav() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
        setMoreOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!moreOpen) return undefined;

        function handlePointerDown(event) {
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest(".landing-more")) {
                setMoreOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [moreOpen]);

    return (
        <header className="landing-nav">
            <div className="landing-nav-inner">
                <Link className="landing-brand" to="/">
                    <span className="landing-brand-mark">TM</span>
                    <strong>TechMate AI</strong>
                </Link>

                <nav className="landing-nav-links" aria-label="Main navigation">
                    {LANDING_NAV_LINKS.map(([label, path]) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => isActive ? "landing-nav-link active" : "landing-nav-link"}
                        >
                            {label}
                        </NavLink>
                    ))}
                    <div className="landing-more">
                        <button
                            type="button"
                            className={`landing-more-toggle${moreOpen ? " open" : ""}`}
                            aria-expanded={moreOpen}
                            aria-haspopup="true"
                            onClick={() => setMoreOpen((open) => !open)}
                        >
                            More
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                        {moreOpen ? (
                            <div className="landing-more-menu" role="menu">
                                {LANDING_MORE_LINKS.map(([label, path]) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        className={({ isActive }) => isActive ? "landing-more-link active" : "landing-more-link"}
                                        role="menuitem"
                                        onClick={() => setMoreOpen(false)}
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </nav>

                <Link className="primary-btn landing-nav-cta" to="/ai-assistant">
                    Ask TechMate AI
                </Link>

                <button
                    type="button"
                    className="landing-menu-toggle"
                    aria-expanded={mobileOpen}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMobileOpen((open) => !open)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        {mobileOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </>
                        )}
                    </svg>
                </button>
            </div>

            {mobileOpen ? (
                <nav className="landing-mobile-menu" aria-label="Mobile navigation">
                    {LANDING_NAV_LINKS.map(([label, path]) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => isActive ? "landing-mobile-link active" : "landing-mobile-link"}
                            onClick={() => setMobileOpen(false)}
                        >
                            {label}
                        </NavLink>
                    ))}
                    <div className="landing-mobile-more-label">More</div>
                    {LANDING_MORE_LINKS.map(([label, path]) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => isActive ? "landing-mobile-link active" : "landing-mobile-link"}
                            onClick={() => setMobileOpen(false)}
                        >
                            {label}
                        </NavLink>
                    ))}
                    <Link className="primary-btn landing-mobile-cta" to="/ai-assistant" onClick={() => setMobileOpen(false)}>
                        Ask TechMate AI
                    </Link>
                </nav>
            ) : null}
        </header>
    );
}

                                            function useLocalStorage(key, initialValue) {
                                                const [value, setValue] = useState(() => {
                                                    try {
                                                        const stored = window.localStorage.getItem(key);
                                                        return stored ? normalizeStoredValue(JSON.parse(stored), initialValue) : initialValue;
                                                    } catch {
                                                        return initialValue;
                                                    }
                                                });

                                                function updateValue(nextValue) {
                                                    setValue((current) => {
                                                        const resolved = typeof nextValue === "function" ? nextValue(current) : nextValue;
                                                        window.localStorage.setItem(key, JSON.stringify(resolved));
                                                        return resolved;
                                                    });
                                                }

                                                return [value, updateValue];
                                            }

                                            function normalizeStoredValue(value, initialValue) {
                                                if (Array.isArray(initialValue)) {
                                                    return Array.isArray(value) ? value : initialValue;
                                                }
                                                if (isPlainObject(initialValue)) {
                                                    return ensureObject(value, initialValue);
                                                }
                                                return typeof value === typeof initialValue ? value : initialValue;
                                            }

                                            function ensureArray(value, fallback = []) {
                                                return Array.isArray(value) ? value : fallback;
                                            }

                                            function ensureObject(value, fallback = {}) {
                                                return isPlainObject(value) ? {...fallback, ...value } : fallback;
                                            }

                                            function isPlainObject(value) {
                                                return Boolean(value) && typeof value === "object" && !Array.isArray(value);
                                            }

                                            function normalizeReport(report, index) {
                                                return {
                                                    ...emptyReport(),
                                                    id: `report-${index}`,
                                                    ...(isPlainObject(report) ? report : {}),
                                                };
                                            }

                                            function normalizeLab(lab, index) {
                                                return {
                                                    id: `lab-${index}`,
                                                    category: "General",
                                                    title: "Technician lab",
                                                    status: "Ready",
                                                    due: "Today",
                                                    progress: 0,
                                                    ...(isPlainObject(lab) ? lab : {}),
                                                };
                                            }

                                            function TopBar({ profile }) {
                                                const [query, setQuery] = useState("");
                                                const navigate = useNavigate();
                                                function handleSearch(e) {
                                                    e.preventDefault();
                                                    if (query.trim()) navigate("/ai-assistant");
                                                }
                                                const initials = (profile?.name || "TM").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                                return (
                                                    <header className="top-bar">
                                                        <button type="button" className="top-bar-icon-btn" aria-label="Menu">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                                        </button>
                                                        <form className="top-search" onSubmit={handleSearch}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search TechMate AI... (e.g., DHCP issue, blue screen, error code)" />
                                                            <kbd>⌘K</kbd>
                                                        </form>
                                                        <div className="top-bar-actions">
                                                            <button type="button" className="top-bar-icon-btn" title="Theme">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                                                            </button>
                                                            <button type="button" className="top-bar-icon-btn top-bar-bell" title="Notifications">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                                                <span className="bell-badge">3</span>
                                                            </button>
                                                            <button type="button" className="top-bar-icon-btn" title="Help">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                                            </button>
                                                            <div className="top-bar-avatar">
                                                                <span className="avatar-initials">{initials}</span>
                                                                <div className="avatar-info">
                                                                    <strong>{profile?.name || "Technician"}</strong>
                                                                    <small>{profile?.role?.split("/")[0]?.trim() || "Technician"}</small>
                                                                </div>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                                                            </div>
                                                        </div>
                                                    </header>
                                                );
                                            }

                                            const NAV_ICONS = {
                                                "/": "home",
                                                "/dashboard": "dashboard",
                                                "/knowledge-base": "book",
                                                "/troubleshooting": "wrench",
                                                "/error-codes": "alert",
                                                "/commands": "terminal",
                                                "/network-center": "network",
                                                "/labs": "flask",
                                                "/repair-reports": "clipboard",
                                                "/ai-assistant": "sparkles",
                                                "/ai-vision": "scan",
                                                "/upload": "upload",
                                                "/vendor-resources": "building",
                                                "/profile": "user",
                                                "/pricing": "badge",
                                            };

                                            const NAV_ICON_PATHS = {
                                                home: <><path d="m3 10 9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></>,
                                                dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
                                                book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8"/><path d="M8 11h6"/></>,
                                                wrench: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5.8 5.8a2.1 2.1 0 0 0 3 3l5.8-5.8a4 4 0 0 0 5.4-5.4l-2.9 2.9-3-3 2.9-2.9z"/></>,
                                                alert: <><path d="m12 3 10 18H2L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/></>,
                                                terminal: <><polyline points="4 17 10 11 4 5"/><path d="M12 19h8"/></>,
                                                network: <><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="9" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h6"/><path d="M12 9v6"/></>,
                                                flask: <><path d="M10 2v6L4.7 18.5A2.4 2.4 0 0 0 6.9 22h10.2a2.4 2.4 0 0 0 2.2-3.5L14 8V2"/><path d="M8 2h8"/><path d="M7.5 16h9"/></>,
                                                clipboard: <><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 12h8"/><path d="M8 16h6"/></>,
                                                sparkles: <><path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></>,
                                                scan: <><path d="M7 3H5a2 2 0 0 0-2 2v2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M17 21h2a2 2 0 0 0 2-2v-2"/><circle cx="12" cy="12" r="3"/></>,
                                                upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/></>,
                                                building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h.01"/><path d="M12 7h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M9 21v-5h6v5"/></>,
                                                user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
                                                badge: <><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-5"/></>,
                                            };

                                            function NavIcon({ name }) {
                                                return (
                                                    <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                        {NAV_ICON_PATHS[name] || NAV_ICON_PATHS.home}
                                                    </svg>
                                                );
                                            }

                                            function Sidebar() {
                                                return (
                                                    <aside className="sidebar">
                                                        <Link className="brand" to="/">
                                                            <span className="brand-mark">TM</span>
                                                            <div>
                                                                <strong>TechMate AI</strong>
                                                                <small>IT Command Center</small>
                                                            </div>
                                                        </Link>
                                                        <nav className="nav-group">
                                                            {navItems.map(([, label, path]) => (
                                                                <NavLink
                                                                    className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                                                    to={path}
                                                                    key={path}
                                                                >
                                                                    <span className="nav-icon"><NavIcon name={NAV_ICONS[path]} /></span>
                                                                    {label}
                                                                </NavLink>
                                                            ))}
                                                        </nav>
                                                        <div className="side-status">
                                                            <span className="live-dot" />
                                                            <div>
                                                                <strong>Workspace online</strong>
                                                                <small>Local MVP mode</small>
                                                            </div>
                                                        </div>
                                                    </aside>
                                                );
                                            }

                                            const HARDWARE_ITEMS = {
                                                "Ethernet cable": {
                                                    label: "Ethernet Cable (RJ45)",
                                                    visual: "ethernet-cable",
                                                    images: [
                                                        { visual: "rj45", caption: "RJ45 connector" },
                                                        { visual: "cable", caption: "Cat5e / Cat6 cable" },
                                                        { visual: "port", caption: "Ethernet port" },
                                                    ],
                                                    description: "A standard network cable used to connect devices to a router, switch, or wall jack. The plastic clip on the connector locks it in place — press it down to release.",
                                                    brands: ["Monoprice", "Belden", "Tripp Lite", "AmazonBasics"],
                                                    location: "Back of desktop PCs, side of laptops, wall jacks, patch panels, and switch ports.",
                                                    tips: [
                                                        "Swap with a known-good Cat5e or Cat6 cable before changing network settings.",
                                                        "Check for a broken locking tab, sharp bends, crushed jacket, or loose connector.",
                                                        "Confirm both ends click fully into place and the switch port LED turns on.",
                                                    ],
                                                    steps: [
                                                        "Locate the RJ45 port — it looks like a wide phone jack.",
                                                        "Press the plastic tab on the connector inward.",
                                                        "Slide the cable out without pulling on the wire.",
                                                        "To reconnect, push straight in until you hear a click.",
                                                        "Verify the link light on the switch turns green.",
                                                    ],
                                                    warning: "Never yank the cable by the wire — always grip the plastic connector head.",
                                                },
                                                "Ethernet port": {
                                                    label: "Ethernet Port (RJ45 Jack)",
                                                    visual: "ethernet-port",
                                                    images: [
                                                        { visual: "port", caption: "RJ45 port" },
                                                        { visual: "leds", caption: "Link light indicator" },
                                                        { visual: "workstation", caption: "Location on PC" },
                                                    ],
                                                    description: "The socket where an Ethernet cable plugs in. Most have a green link light that activates when a cable is connected and the connection is live.",
                                                    brands: ["Intel", "Realtek", "Broadcom"],
                                                    location: "Back panel of desktop PCs, side/back of laptops, network switches, routers, and wall plates.",
                                                    tips: [
                                                        "No link light usually means bad cable, disabled NIC, bad port, or wrong switch patch.",
                                                        "Inspect for bent pins, debris, or a loose jack before forcing a connector.",
                                                        "Try another switch port and check adapter status in the operating system.",
                                                    ],
                                                    steps: [
                                                        "Look for the RJ45 port with a small light beside it.",
                                                        "Insert the cable until it clicks into place.",
                                                        "Check the amber and green LEDs — green means linked.",
                                                        "If no light appears, try a different cable or port.",
                                                    ],
                                                    warning: "If the port has physical damage or bent pins, do not force a cable in — replace the port or use a USB adapter.",
                                                },
                                                "Switch": {
                                                    label: "Network Switch",
                                                    visual: "switch",
                                                    images: [
                                                        { visual: "switch", caption: "Managed switch" },
                                                        { visual: "ports", caption: "Port bank" },
                                                        { visual: "leds", caption: "Port LEDs" },
                                                    ],
                                                    description: "A network switch connects multiple wired devices on a LAN. Each port has a link light. Managed switches can be configured via CLI; unmanaged switches are plug-and-play.",
                                                    brands: ["Cisco", "Netgear", "TP-Link", "Ubiquiti", "Aruba"],
                                                    location: "Server rooms, network closets, and under desks for small office deployments.",
                                                    tips: [
                                                        "Check link LEDs, port speed, VLAN assignment, and whether the interface is administratively down.",
                                                        "For managed switches, compare the physical port label to the config before moving cables.",
                                                        "If many users are down, check uplinks, power, spanning tree, and core connectivity first.",
                                                    ],
                                                    steps: [
                                                        "Check all port link lights — green means connected.",
                                                        "Amber or flashing amber may indicate a fault or STP state.",
                                                        "For managed switches, console in via the console port.",
                                                        "Run: show interfaces status to see port states.",
                                                        "Power-cycle by unplugging for 10 seconds if needed.",
                                                    ],
                                                    warning: "Never power-cycle a core switch without change management — other devices will lose connectivity.",
                                                },
                                                "router": {
                                                    label: "Router",
                                                    visual: "router",
                                                    images: [
                                                        { visual: "router", caption: "Edge router" },
                                                        { visual: "wan-lan", caption: "WAN / LAN ports" },
                                                        { visual: "topology", caption: "Network path" },
                                                    ],
                                                    description: "A router connects your local network to the internet. It routes traffic between your LAN and the ISP's WAN. The internet LED shows whether the upstream link is active.",
                                                    brands: ["Cisco", "Ubiquiti", "ASUS", "TP-Link", "Netgear"],
                                                    location: "Usually near the modem or ISP demarcation point in homes and offices.",
                                                    tips: [
                                                        "Confirm WAN link, gateway status, DNS, DHCP, and firewall rules before replacing hardware.",
                                                        "Test from both LAN and router admin/status pages to separate local and ISP issues.",
                                                        "Document existing settings before rebooting or changing DHCP, NAT, or VLAN configuration.",
                                                    ],
                                                    steps: [
                                                        "Identify the WAN port — usually labeled or a different color.",
                                                        "Check the internet LED: solid green means connected.",
                                                        "Power-cycle: unplug, wait 30s, plug back in.",
                                                        "Log into the admin panel (typically 192.168.1.1) to check status.",
                                                        "Ping 8.8.8.8 from a connected PC to test WAN connectivity.",
                                                    ],
                                                    warning: "Changing router settings can disrupt all connected devices — document the current config before making changes.",
                                                },
                                                "modem": {
                                                    label: "Cable / DSL Modem",
                                                    visual: "modem",
                                                    images: [
                                                        { visual: "modem", caption: "Cable modem" },
                                                        { visual: "coax", caption: "Coax / DSL line" },
                                                        { visual: "leds", caption: "Sync LEDs" },
                                                    ],
                                                    description: "A modem converts the ISP signal (coax, fiber, or DSL) into an Ethernet signal for your router. The sync or internet LED confirms whether the ISP link is established.",
                                                    brands: ["Motorola", "Arris", "Netgear", "TP-Link"],
                                                    location: "Near the coax wall outlet or phone line entry point in homes and small offices.",
                                                    tips: [
                                                        "If the online/sync LED never stabilizes, suspect ISP signal, coax, fiber ONT, or account provisioning.",
                                                        "Hand-tighten coax and remove unnecessary splitters during testing.",
                                                        "After a power cycle, allow several minutes for sync before judging the result.",
                                                    ],
                                                    steps: [
                                                        "Check all LEDs — sync, send, receive, and online should be solid.",
                                                        "Verify the coax or phone cable is hand-tight.",
                                                        "Power-cycle: unplug for 30 seconds, then reconnect.",
                                                        "Wait 3-5 minutes for full re-synchronization with the ISP.",
                                                        "Call the ISP if the online LED stays off after power-cycle.",
                                                    ],
                                                    warning: "Do not use a splitter on the coax line unless it is rated for internet — it can degrade signal and prevent sync.",
                                                },
                                                "patch panel": {
                                                    label: "Patch Panel",
                                                    visual: "patch-panel",
                                                    images: [
                                                        { visual: "patch-panel", caption: "24-port patch panel" },
                                                        { visual: "ports", caption: "RJ45 ports" },
                                                        { visual: "labels", caption: "Port labeling" },
                                                    ],
                                                    description: "A patch panel is a rack-mounted board of RJ45 ports. Each port on the front corresponds to a wall jack run to the patch panel with permanent cable. Patch cables connect from the panel to a switch.",
                                                    brands: ["Panduit", "Leviton", "Belden", "Tripp Lite"],
                                                    location: "Network closets and server rooms, mounted in equipment racks.",
                                                    tips: [
                                                        "Use labels, a toner, or a cable tester to match the wall jack to the correct panel port.",
                                                        "Check the short patch cable from panel to switch before assuming the wall run is bad.",
                                                        "Record any port moves so the next technician can trace the circuit quickly.",
                                                    ],
                                                    steps: [
                                                        "Trace the wall jack label to the matching patch panel port.",
                                                        "Verify the patch cable connects from that port to the switch.",
                                                        "If unlabeled, use a cable toner to identify the run.",
                                                        "Replace a faulty patch cable between panel and switch.",
                                                        "Document the port mapping for future reference.",
                                                    ],
                                                    warning: "Never cut or re-terminate a permanent wall run without documenting the change — it can break a circuit that feeds another area.",
                                                },
                                            };

                                            function HardwareVisual({ type }) {
                                                return (
                                                    <div className={`hardware-visual hardware-visual-${type || "device"}`} aria-hidden="true">
                                                        <span className="hwv-led hwv-led-a" />
                                                        <span className="hwv-led hwv-led-b" />
                                                        <span className="hwv-line hwv-line-a" />
                                                        <span className="hwv-line hwv-line-b" />
                                                        <span className="hwv-port hwv-port-a" />
                                                        <span className="hwv-port hwv-port-b" />
                                                        <span className="hwv-chip" />
                                                    </div>
                                                );
                                            }

                                            function HardwareModal({ item, onClose }) {
                                                if (!item) return null;
                                                const hw = HARDWARE_ITEMS[item];
                                                if (!hw) return null;
                                                return (
                                                    <div className="hw-modal-backdrop" onClick={onClose}>
                                                        <div className="hw-modal" onClick={(e) => e.stopPropagation()}>
                                                            <div className="hw-modal-header">
                                                                <h2>{hw.label}</h2>
                                                                <button type="button" className="hw-modal-close" onClick={onClose}>✕</button>
                                                            </div>
                                                            <div className="hw-modal-body">
                                                                <div className="hw-image-strip">
                                                                    {hw.images.map((img) => (
                                                                        <div className="hw-image-card" key={img.caption}>
                                                                            <HardwareVisual type={img.visual} />
                                                                            <span>{img.caption}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="hw-section">
                                                                    <h3>What it is</h3>
                                                                    <p>{hw.description}</p>
                                                                </div>
                                                                <div className="hw-section">
                                                                    <h3>Common brands</h3>
                                                                    <div className="hw-brands">
                                                                        {hw.brands.map((b) => <span className="hw-brand-tag" key={b}>{b}</span>)}
                                                                    </div>
                                                                </div>
                                                                <div className="hw-section">
                                                                    <h3>Where to find it</h3>
                                                                    <p>{hw.location}</p>
                                                                </div>
                                                                <div className="hw-section">
                                                                    <h3>Troubleshooting tips</h3>
                                                                    <ul className="hw-tip-list">
                                                                        {hw.tips.map((tip) => <li key={tip}>{tip}</li>)}
                                                                    </ul>
                                                                </div>
                                                                <div className="hw-section">
                                                                    <h3>How to disconnect / reconnect safely</h3>
                                                                    <ol className="hw-steps">
                                                                        {hw.steps.map((s, i) => <li key={i} data-step={i + 1}>{s}</li>)}
                                                                    </ol>
                                                                </div>
                                                                <div className="hw-warning">⚠ {hw.warning}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            function HardwareTerm({ name, children }) {
                                                const [open, setOpen] = useState(false);
                                                const key = Object.keys(HARDWARE_ITEMS).find(
                                                    (k) => k.toLowerCase() === name.toLowerCase()
                                                );
                                                if (!key) return <span>{children || name}</span>;
                                                return (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="hw-term"
                                                            onClick={() => setOpen(true)}
                                                            title={`Click to learn about: ${name}`}
                                                        >
                                                            {children || name}
                                                        </button>
                                                        {open && <HardwareModal item={key} onClose={() => setOpen(false)} />}
                                                    </>
                                                );
                                            }

                                            const ACTION_CARDS = [
                                                {
                                                    label: "Diagnose Issue", path: "/ai-assistant", desc: "Ask symptoms, error codes, and next steps.",
                                                    color: "#f3f0ff", iconColor: "#7c3aed",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
                                                },
                                                {
                                                    label: "Analyze Screenshot", path: "/ai-vision", desc: "Upload a photo for AI visual diagnostics.",
                                                    color: "#f0fdf4", iconColor: "#16a34a",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
                                                },
                                                {
                                                    label: "Error Code Lookup", path: "/error-codes", desc: "Search codes, causes, and fixes.",
                                                    color: "#fff7ed", iconColor: "#d97706",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                                                },
                                                {
                                                    label: "Start Troubleshooting", path: "/troubleshooting", desc: "Launch guided repair workflows.",
                                                    color: "#eff6ff", iconColor: "#2563eb",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
                                                },
                                                {
                                                    label: "Network Tools", path: "/network-center", desc: "Network checks, topology, and vendor support.",
                                                    color: "#eff6ff", iconColor: "#0284c7",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                                                },
                                                {
                                                    label: "Windows Repair", path: "/commands", desc: "Service, driver, update, and recovery commands.",
                                                    color: "#eff6ff", iconColor: "#1d4ed8",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
                                                },
                                                {
                                                    label: "Knowledge Base", path: "/knowledge-base", desc: "Review playbooks, repair notes, and errors.",
                                                    color: "#f0fdf4", iconColor: "#16a34a",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
                                                },
                                                {
                                                    label: "Generate Report", path: "/repair-reports", desc: "Capture work into a ticket or service report.",
                                                    color: "#fff1f2", iconColor: "#dc2626",
                                                    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                                                },
                                            ];

                                            const RECENT_ACTIVITY_DATA = [
                                                { bg: "#dcfce7", color: "#16a34a", icon: "✓", label: "DHCP Issue Diagnosed", time: "2 minutes ago" },
                                                { bg: "#f3f0ff", color: "#7c3aed", icon: "◎", label: "Screenshot Analyzed", time: "8 minutes ago" },
                                                { bg: "#fff7ed", color: "#d97706", icon: "≡", label: "Report Generated", time: "15 minutes ago" },
                                                { bg: "#eff6ff", color: "#2563eb", icon: ">_", label: "Command Executed", time: "20 minutes ago" },
                                            ];

                                            const QUICK_TIPS_DATA = [
                                                "Try uploading a screenshot of any error for instant AI analysis.",
                                                "Use /release and /renew for most DHCP issues.",
                                                "Check VLAN and scope if the issue persists.",
                                            ];

                                            function HeroTechSVG() {
    const ports12 = [0,1,2,3,4,5,6,7,8,9,10,11];
    const portLedA = [true,true,true,true,true,true,true,true,true,false,false,false];
    const portLedB = [true,true,true,true,true,true,false,false,false,false,false,false];
    return (
        <svg className="hero-tech-bg-svg" viewBox="0 0 420 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <linearGradient id="htBg" x1="0" y1="0" x2="0.6" y2="1">
                    <stop offset="0%" stopColor="#0c1829"/>
                    <stop offset="100%" stopColor="#0e2040"/>
                </linearGradient>
                <radialGradient id="htGlow" cx="50%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.14"/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="htGlow2" cx="80%" cy="70%" r="40%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </radialGradient>
            </defs>

            {/* ── Background ── */}
            <rect width="420" height="430" fill="url(#htBg)"/>
            <rect width="420" height="430" fill="url(#htGlow)"/>
            <rect width="420" height="430" fill="url(#htGlow2)"/>

            {/* ── PCB CIRCUIT TRACES ── */}
            <g stroke="#1e3a8a" strokeWidth="1" fill="none" opacity="0.45">
                <line x1="0" y1="18" x2="420" y2="18"/>
                <line x1="0" y1="32" x2="170" y2="32"/>
                <line x1="230" y1="32" x2="420" y2="32"/>
                <line x1="40" y1="46" x2="420" y2="46"/>
                <line x1="0" y1="60" x2="290" y2="60"/>
                <line x1="40" y1="18" x2="40" y2="60"/>
                <line x1="80" y1="18" x2="80" y2="46"/>
                <line x1="130" y1="18" x2="130" y2="60"/>
                <line x1="170" y1="18" x2="170" y2="32"/>
                <line x1="210" y1="18" x2="210" y2="46"/>
                <line x1="250" y1="18" x2="250" y2="60"/>
                <line x1="290" y1="32" x2="290" y2="60"/>
                <line x1="330" y1="18" x2="330" y2="46"/>
                <line x1="370" y1="18" x2="370" y2="32"/>
                <line x1="400" y1="18" x2="400" y2="46"/>
            </g>
            <g stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.5">
                <line x1="0" y1="18" x2="420" y2="18"/>
                <line x1="80" y1="18" x2="80" y2="46"/>
                <line x1="210" y1="18" x2="210" y2="46"/>
                <line x1="330" y1="18" x2="330" y2="46"/>
            </g>
            <g fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.9">
                {[40,80,130,170,210,250,290,330,370,400].map(x => (
                    <circle key={`via-t-${x}`} cx={x} cy={18} r={2.8}/>
                ))}
                {[40,80,130,250,290,330,400].map(x => (
                    <circle key={`via-b-${x}`} cx={x} cy={46} r={2.4}/>
                ))}
                <circle cx="130" cy="60" r="2.4"/>
                <circle cx="250" cy="60" r="2.4"/>
                <circle cx="290" cy="60" r="2.4"/>
            </g>
            {/* IC chip footprint */}
            <g opacity="0.5">
                <rect x="148" y="22" width="52" height="30" rx="2" fill="#080f1c" stroke="#1e40af" strokeWidth="1"/>
                <text x="152" y="41" fill="#334155" fontSize="7" fontFamily="monospace">MCU</text>
                <circle cx="155" cy="26" r="2" fill="#1e3a8a" opacity="0.8"/>
                {[28,34,40,46].map(y => <line key={`pin-l-${y}`} x1="148" y1={y} x2="138" y2={y} stroke="#1e3a8a" strokeWidth="1" opacity="0.6"/>)}
                {[28,34,40,46].map(y => <line key={`pin-r-${y}`} x1="200" y1={y} x2="210" y2={y} stroke="#1e3a8a" strokeWidth="1" opacity="0.6"/>)}
            </g>

            {/* ── ETHERNET CABLE CROSS-SECTION hint ── */}
            <g transform="translate(350, 24)" opacity="0.55">
                <circle cx="0" cy="0" r="12" fill="#08111e" stroke="#1e40af" strokeWidth="1.2"/>
                <circle cx="-4" cy="-4" r="2.5" fill="#f59e0b" opacity="0.8"/>
                <circle cx="4" cy="-4" r="2.5" fill="#3b82f6" opacity="0.8"/>
                <circle cx="-4" cy="4" r="2.5" fill="#16a34a" opacity="0.8"/>
                <circle cx="4" cy="4" r="2.5" fill="#dc2626" opacity="0.8"/>
                <circle cx="0" cy="-6" r="1.8" fill="#f59e0b" opacity="0.5"/>
                <circle cx="0" cy="6" r="1.8" fill="#3b82f6" opacity="0.5"/>
                <circle cx="-7" cy="0" r="1.8" fill="#16a34a" opacity="0.5"/>
                <circle cx="7" cy="0" r="1.8" fill="#dc2626" opacity="0.5"/>
                <text x="16" y="4" fill="#475569" fontSize="6" fontFamily="monospace">CAT6</text>
            </g>

            {/* ── NETWORK SWITCH FRONT PANEL ── */}
            <rect x="18" y="80" width="384" height="96" rx="5" fill="#080f1c" stroke="#1a3055" strokeWidth="1.5"/>
            <rect x="18" y="80" width="384" height="17" rx="5" fill="#0c1828"/>
            <rect x="18" y="92" width="384" height="5" fill="#080f1c"/>
            <text x="30" y="92" fill="#60a5fa" fontSize="7.5" fontFamily="'Cascadia Code', Consolas, monospace" opacity="0.9">CISCO CATALYST 2960-X-48FPD-L</text>
            <circle cx="368" cy="89" r="3.5" fill="#4ade80" opacity="0.95"/>
            <text x="373" y="92" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">SYS</text>
            <circle cx="348" cy="89" r="3.5" fill="#4ade80" opacity="0.9"/>
            <text x="331" y="92" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">PWR</text>
            <circle cx="313" cy="89" r="3.5" fill="#fbbf24" opacity="0.8"/>
            <text x="295" y="92" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">STAT</text>

            {/* Port grid — 12 ports */}
            {ports12.map(i => (
                <g key={`swp-${i}`}>
                    <rect x={30 + i*28} y={103} width={20} height={30} rx="2" fill="#050c18" stroke="#1a3055" strokeWidth="0.8"/>
                    <rect x={32 + i*28} y={107} width={16} height={12} rx="1" fill="#030810"/>
                    <rect x={38 + i*28} y={117} width={4} height={2.5} rx="0.8" fill="#1a3055"/>
                    <circle cx={37 + i*28} cy={138} r={2.5} fill={portLedA[i] ? "#4ade80" : "#111e30"} opacity={0.95}/>
                    <circle cx={44 + i*28} cy={138} r={2.5} fill={portLedB[i] ? "#4ade80" : "#111e30"} opacity={0.9}/>
                </g>
            ))}
            {/* Port number labels */}
            {[1,5,9].map((n,i) => (
                <text key={`pnum-${n}`} x={32 + i*112} y={101} fill="#2d4a6b" fontSize="5" fontFamily="monospace">{n}–{n+3}</text>
            ))}

            {/* SFP uplink ports */}
            <g opacity="0.9">
                <rect x="368" y="103" width="14" height="30" rx="2" fill="#050c18" stroke="#2563eb" strokeWidth="1"/>
                <rect x="369" y="107" width="12" height="9" rx="1" fill="#030810"/>
                <circle cx="375" cy="138" r="2.5" fill="#60a5fa" opacity="0.9"/>
                <rect x="385" y="103" width="12" height="30" rx="2" fill="#050c18" stroke="#1a3055" strokeWidth="0.8"/>
                <rect x="386" y="107" width="10" height="9" rx="1" fill="#030810"/>
                <circle cx="391" cy="138" r="2.5" fill="#111e30" opacity="0.9"/>
            </g>
            {/* Console port */}
            <rect x="30" y="147" width="16" height="14" rx="1.5" fill="#050c18" stroke="#2d4a6b" strokeWidth="0.8"/>
            <text x="31" y="157" fill="#2d4a6b" fontSize="5" fontFamily="monospace">CON</text>

            {/* ── PATCH PANEL ── */}
            <rect x="18" y="188" width="230" height="42" rx="4" fill="#080e1c" stroke="#1a3055" strokeWidth="1" opacity="0.9"/>
            <text x="28" y="200" fill="#2d4a6b" fontSize="6" fontFamily="monospace">PATCH PANEL  ·  CAT6  ·  24P</text>
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => (
                <g key={`pp-${i}`}>
                    <rect x={26 + i*10} y={204} width={7} height={18} rx="1" fill="#050c18" stroke="#1a3055" strokeWidth="0.5"/>
                    <rect x={27 + i*10} y={207} width={5} height={6} rx="0.5" fill="#030810"/>
                </g>
            ))}

            {/* ── TERMINAL WINDOW ── */}
            <rect x="18" y="244" width="212" height="136" rx="5" fill="#030810" fillOpacity="0.92" stroke="#1a3055" strokeWidth="1"/>
            <rect x="18" y="244" width="212" height="15" rx="5" fill="#0c1828" stroke="none"/>
            <circle cx="30" cy="252" r="3" fill="#dc2626" opacity="0.7"/>
            <circle cx="41" cy="252" r="3" fill="#d97706" opacity="0.7"/>
            <circle cx="52" cy="252" r="3" fill="#16a34a" opacity="0.7"/>
            <text x="100" y="255" fill="#2d4a6b" fontSize="6" fontFamily="monospace" textAnchor="middle">bash — technician@corp</text>
            <text x="27" y="273" fill="#4ade80" fontSize="6.5" fontFamily="monospace">C:\&gt; ipconfig /release</text>
            <text x="27" y="284" fill="#334155" fontSize="6" fontFamily="monospace">Releasing IP configuration...</text>
            <text x="27" y="296" fill="#4ade80" fontSize="6.5" fontFamily="monospace">C:\&gt; ipconfig /renew</text>
            <text x="27" y="307" fill="#334155" fontSize="6" fontFamily="monospace">Renewing IP address...</text>
            <text x="27" y="319" fill="#60a5fa" fontSize="6" fontFamily="monospace">IPv4 Address: 192.168.1.45</text>
            <text x="27" y="330" fill="#60a5fa" fontSize="6" fontFamily="monospace">Default Gateway: 192.168.1.1</text>
            <text x="27" y="342" fill="#4ade80" fontSize="6.5" fontFamily="monospace">C:\&gt; ping 8.8.8.8 -t</text>
            <text x="27" y="353" fill="#334155" fontSize="6" fontFamily="monospace">Reply from 8.8.8.8: time=18ms</text>
            <text x="27" y="364" fill="#334155" fontSize="6" fontFamily="monospace">Reply from 8.8.8.8: time=16ms</text>
            <rect x="116" y="359" width="5" height="7" fill="#4ade80" opacity="0.85"/>

            {/* ── NETWORK TOPOLOGY ── */}
            {/* Internet cloud */}
            <ellipse cx="330" cy="204" rx="26" ry="14" fill="#060d1a" stroke="#1e40af" strokeWidth="1.2" opacity="0.9"/>
            <text x="313" y="207" fill="#60a5fa" fontSize="6.5" fontFamily="monospace">INTERNET</text>
            <line x1="330" y1="218" x2="330" y2="232" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"/>

            {/* Router */}
            <rect x="309" y="232" width="42" height="22" rx="3" fill="#0a1828" stroke="#3b82f6" strokeWidth="1.2"/>
            <text x="313" y="244" fill="#93c5fd" fontSize="6.5" fontFamily="monospace">ROUTER</text>
            <text x="314" y="251" fill="#2d4a6b" fontSize="5.5" fontFamily="monospace">10.0.0.1</text>
            <line x1="330" y1="254" x2="330" y2="268" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"/>

            {/* Core switch */}
            <rect x="303" y="268" width="54" height="24" rx="3" fill="#0d2244" stroke="#3b82f6" strokeWidth="1.5"/>
            <text x="308" y="279" fill="#93c5fd" fontSize="6.5" fontFamily="monospace">CORE-SW</text>
            <text x="308" y="287" fill="#60a5fa" fontSize="5.5" fontFamily="monospace">192.168.1.1</text>

            {/* Branches */}
            <line x1="303" y1="280" x2="274" y2="280" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
            <line x1="357" y1="280" x2="387" y2="280" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
            <line x1="330" y1="292" x2="330" y2="304" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>

            {/* Leaf nodes */}
            <rect x="244" y="271" width="30" height="18" rx="2.5" fill="#060d1a" stroke="#1d4ed8" strokeWidth="1"/>
            <text x="248" y="280" fill="#93c5fd" fontSize="5.5" fontFamily="monospace">DHCP</text>
            <text x="248" y="287" fill="#2d4a6b" fontSize="5" fontFamily="monospace">SRV-01</text>

            <rect x="387" y="271" width="30" height="18" rx="2.5" fill="#060d1a" stroke="#1d4ed8" strokeWidth="1"/>
            <text x="390" y="280" fill="#93c5fd" fontSize="5.5" fontFamily="monospace">FW-01</text>
            <text x="390" y="287" fill="#fbbf24" fontSize="5" fontFamily="monospace">FortiGate</text>

            <rect x="312" y="304" width="36" height="18" rx="2.5" fill="#060d1a" stroke="#1d4ed8" strokeWidth="1"/>
            <text x="316" y="313" fill="#93c5fd" fontSize="5.5" fontFamily="monospace">WS-POOL</text>
            <text x="316" y="320" fill="#4ade80" fontSize="5" fontFamily="monospace">connected</text>

            {/* Grid dots */}
            <g fill="#1e3a8a" opacity="0.2">
                {[0,1,2,3,4].map(row => [0,1,2,3,4,5,6,7].map(col => (
                    <circle key={`dot-${row}-${col}`} cx={250 + col*24} cy={380 + row*12} r="1.3"/>
                )))}
            </g>

            {/* Corner bracket decorations */}
            <g stroke="#1e40af" strokeWidth="1" fill="none" opacity="0.3">
                <polyline points="8,8 8,22 22,22"/>
                <polyline points="398,8 412,8 412,22"/>
                <polyline points="8,408 8,422 22,422"/>
                <polyline points="398,422 412,422 412,408"/>
            </g>

            {/* Subtle vignette fade at bottom */}
            <defs>
                <linearGradient id="htFade" x1="0" y1="0.6" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c1829" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#0c1829" stopOpacity="0.7"/>
                </linearGradient>
            </defs>
            <rect width="420" height="430" fill="url(#htFade)"/>
        </svg>
    );
}

                                            function HeroHardwareVisual() {
                                                const switchPorts = Array.from({ length: 12 }, (_, index) => index);
                                                const patchPorts = Array.from({ length: 16 }, (_, index) => index);

                                                return (
                                                    <div className="hero-hardware-visual" aria-label="Professional network hardware diagnostic visual">
                                                        <div className="hero-circuit-board">
                                                            <span className="trace trace-a" />
                                                            <span className="trace trace-b" />
                                                            <span className="trace trace-c" />
                                                            <span className="trace trace-d" />
                                                            <span className="chip chip-a">ASIC</span>
                                                            <span className="chip chip-b">PHY</span>
                                                            <span className="via via-a" />
                                                            <span className="via via-b" />
                                                            <span className="via via-c" />
                                                        </div>

                                                        <div className="network-device patch-panel-device">
                                                            <div className="device-bar">
                                                                <span>PATCH PANEL 01</span>
                                                                <strong>Rack A</strong>
                                                            </div>
                                                            <div className="patch-port-grid">
                                                                {patchPorts.map((port) => (
                                                                    <span className={port === 6 || port === 7 ? "active" : ""} key={port} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="network-device switch-device">
                                                            <div className="device-bar">
                                                                <span>Cisco access switch</span>
                                                                <strong>1G uplink</strong>
                                                            </div>
                                                            <div className="switch-port-row">
                                                                {switchPorts.map((port) => (
                                                                    <span className={port < 8 ? "linked" : ""} key={port} />
                                                                ))}
                                                            </div>
                                                            <div className="switch-led-row">
                                                                <i />
                                                                <i />
                                                                <i className="warn" />
                                                            </div>
                                                        </div>

                                                        <div className="ethernet-cable-hero">
                                                            <span className="cable-run" />
                                                            <span className="rj45-head rj45-left" />
                                                            <span className="rj45-head rj45-right" />
                                                        </div>

                                                        <div className="topology-card">
                                                            <div className="topology-node core">Core</div>
                                                            <div className="topology-node access">Access</div>
                                                            <div className="topology-node client">Client</div>
                                                            <span className="topology-link link-a" />
                                                            <span className="topology-link link-b" />
                                                        </div>

                                                        <div className="terminal-card">
                                                            <div className="terminal-header">
                                                                <span />
                                                                <span />
                                                                <span />
                                                                <strong>diagnostics</strong>
                                                            </div>
                                                            <code>show interfaces status</code>
                                                            <code>Gi1/0/07 connected vlan 20</code>
                                                            <code>DHCP lease renewed: 10.20.4.118</code>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            function HomePage() {
                                                const heroVideoRef = useRef(null);
                                                const [scanIdx, setScanIdx] = useState(0);

                                                useEffect(() => {
                                                    const video = heroVideoRef.current;
                                                    if (!video) return undefined;

                                                    const ensurePlayback = () => {
                                                        if (video.paused) {
                                                            video.play().catch(() => {});
                                                        }
                                                    };

                                                    ensurePlayback();
                                                    video.addEventListener("loadeddata", ensurePlayback);
                                                    video.addEventListener("canplay", ensurePlayback);

                                                    return () => {
                                                        video.removeEventListener("loadeddata", ensurePlayback);
                                                        video.removeEventListener("canplay", ensurePlayback);
                                                    };
                                                }, []);

                                                const recentScans = [
                                                    { label: "DHCP Issue", color: "#1e293b", text: "#fff", name: "Screenshot_2025-05-13_10-24.png", time: "2 minutes ago", bg: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 38%), repeating-linear-gradient(0deg, rgba(34,197,94,0.16) 0 1px, transparent 1px 12px), linear-gradient(135deg, #020617 0%, #111827 58%, #0f172a 100%)" },
                                                    { label: "Windows Event", color: "#2563eb", text: "#fff", name: "Event_Viewer_Error.png", time: "45 minutes ago", bg: "linear-gradient(90deg, rgba(37,99,235,0.22) 0 26%, transparent 26%), repeating-linear-gradient(0deg, rgba(148,163,184,0.26) 0 1px, transparent 1px 13px), linear-gradient(135deg, #ffffff 0%, #eef4ff 100%)" },
                                                    { label: "Blue Screen", color: "#1d4ed8", text: "#fff", name: "BSOD_MEMORY_MANAGEMENT.png", time: "1 hour ago", bg: "radial-gradient(circle at 18% 28%, rgba(255,255,255,0.36) 0 18px, transparent 19px), linear-gradient(135deg, #0f6bff 0%, #0757d8 55%, #043ea8 100%)" },
                                                    { label: "Network Device", color: "#374151", text: "#fff", name: "Switch_Port_Issue.jpg", time: "2 hours ago", bg: "linear-gradient(175deg, transparent 0 46%, rgba(15,23,42,0.9) 47% 76%, transparent 77%), repeating-linear-gradient(90deg, transparent 0 15px, rgba(34,197,94,0.85) 15px 20px, transparent 20px 28px), linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)" },
                                                ];
                                                const visibleScans = 3;

                                                return (
                                                    <div className="landing-page">
                                                        <LandingNav />
                                                        <section className="hero-cinematic hero-cinematic--landing hero-cinematic--video-only" aria-label="TechMate AI homepage hero video">
                                                            <div className="hero-cinematic-media" aria-hidden="true">
                                                                <div className="hero-cinematic-fallback" />
                                                                <video
                                                                    ref={heroVideoRef}
                                                                    className="hero-cinematic-video"
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                    preload="auto"
                                                                >
                                                                    <source
                                                                        src="/videos/techmateai-app-hero-modern-workspace-dusk.mp4"
                                                                        type="video/mp4"
                                                                    />
                                                                </video>
                                                            </div>
                                                        </section>

                                                        <div className="landing-home-content">
                                                            <div className="home-layout">
                                                                <div className="home-main">
                                                                    <section className="home-cards-section">
                                                                        <div className="home-cards-grid">
                                                                            {ACTION_CARDS.map(({ label, path, desc, color, iconColor, icon }) => (
                                                                                <Link to={path} key={label} className="action-card">
                                                                                    <div className="action-card-icon" style={{background: color, color: iconColor}}>{icon}</div>
                                                                                    <strong>{label}</strong>
                                                                                    <span>{desc}</span>
                                                                                    <span className="action-card-arrow">→</span>
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </section>

                                                                    <section className="recent-scans-section">
                                                                        <div className="recent-scans-header">
                                                                            <h2>Recent Scans</h2>
                                                                            <Link to="/ai-vision" className="view-all-link">View all scans →</Link>
                                                                        </div>
                                                                        <div className="recent-scans-wrap">
                                                                            <button type="button" className="scroll-btn" onClick={() => setScanIdx(Math.max(0, scanIdx - 1))} disabled={scanIdx === 0}>‹</button>
                                                                            <div className="recent-scans-track">
                                                                                {recentScans.slice(scanIdx, scanIdx + visibleScans).map((scan) => (
                                                                                    <div className="recent-scan-item" key={scan.name}>
                                                                                        <div className="scan-preview" style={{background: scan.bg}}>
                                                                                            <span className="scan-label-badge" style={{background: scan.color, color: scan.text}}>{scan.label}</span>
                                                                                        </div>
                                                                                        <div className="scan-item-info">
                                                                                            <span className="scan-item-name">{scan.name}</span>
                                                                                            <span className="scan-item-time">{scan.time}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <button type="button" className="scroll-btn" onClick={() => setScanIdx(Math.min(recentScans.length - visibleScans, scanIdx + 1))} disabled={scanIdx >= recentScans.length - visibleScans}>›</button>
                                                                        </div>
                                                                    </section>
                                                                </div>

                                                                <div className="home-rail">
                                                                    <div className="rail-panel">
                                                                        <h2>Recent Activity</h2>
                                                                        <div className="rail-activity-list">
                                                                            {RECENT_ACTIVITY_DATA.map((item) => (
                                                                                <div className="rail-activity-item" key={item.label}>
                                                                                    <div className="rail-activity-icon" style={{background: item.bg, color: item.color}}>{item.icon}</div>
                                                                                    <div>
                                                                                        <strong>{item.label}</strong>
                                                                                        <span>{item.time}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <Link to="/repair-reports" className="view-all-link" style={{display:"block",marginTop:"14px"}}>View all activity →</Link>
                                                                    </div>

                                                                    <div className="rail-panel">
                                                                        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                                                                            <span style={{color:"var(--blue)"}}>💡</span>
                                                                            <h2 style={{margin:0}}>Quick Tips</h2>
                                                                        </div>
                                                                        {QUICK_TIPS_DATA.map((tip, i) => (
                                                                            <div className="tip-item" key={i}>
                                                                                <span className="tip-bullet">●</span>
                                                                                <span className="tip-text">{tip}</span>
                                                                            </div>
                                                                        ))}
                                                                        <Link to="/troubleshooting" className="view-all-link" style={{display:"block",marginTop:"14px"}}>View all tips →</Link>
                                                                    </div>

                                                                    <div className="rail-panel">
                                                                        <h2>Visual Hardware Library</h2>
                                                                        <p style={{color:"var(--muted)",fontSize:"0.82rem",margin:"0 0 12px",lineHeight:"1.5"}}>Click any item to see images, brands, and safe handling steps.</p>
                                                                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                                                                            {Object.entries(HARDWARE_ITEMS).map(([key, hw]) => (
                                                                                <HardwareTerm name={key} key={key}>{hw.label}</HardwareTerm>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            function DashboardPage({ data }) {
                                                const navigate = useNavigate();
                                                const open = data.reports.filter((report) => report.status !== "Resolved").length;
                                                const labAverage = Math.round(
                                                    data.labState.reduce((sum, lab) => sum + Number(lab.progress || 0), 0) / Math.max(data.labState.length, 1),
                                                );

                                                return ( <PageShell eyebrow = "Dashboard"
                                                        title = "Operations workspace"
                                                        description = { `Welcome back, ${data.profile.name}. Your active work, shortcuts, and technician context live here.` }>
                                                        <section className = "command-summary">
                                                        <Metric value = { open }
                                                        label = "Active tickets" />
                                                        <Metric value = { data.knowledgeRecords.length }
                                                        label = "Knowledge records" />
                                                        <Metric value = { data.uploads.length }
                                                        label = "Uploaded docs" />
                                                        <Metric value = { `${labAverage}%` }
                                                        label = "Lab progress" />
                                                        </section>

                                                        <section className = "workspace-grid two-col">
                                                        <div className = "focus-panel">
                                                        <div className = "section-heading">
                                                        <h2> Technician shortcuts </h2> <p> Start from the task, not the database. </p> </div> <div className ="shortcut-list"> { [
                                                            ["New Report", "/repair-reports"],
                                                            ["Ask AI Tutor", "/ai-assistant"],
                                                            ["Upload Evidence", "/upload"],
                                                            ["Find Error Code", "/error-codes"],
                                                            ["Copy Command", "/commands"],
                                                        ].map(([label, path]) => ( <button type = "button"
                                                            onClick = {
                                                                () => navigate(path)
                                                            }
                                                            key = { label }> { label } </button>
                                                        ))
                                                    } </div> </div>

                                                    <div className = "feed-panel">
                                                    <div className = "section-heading">
                                                    <h2> Ticket feed </h2> <p> Most recent repair activity. </p> </div> {
                                                data.reports.slice(0, 4).map((report) => ( <TicketCard report = { report }
                                                    compact key = { report.id }
                                                    />
                                                ))
                                            } </div> </section> </PageShell>
                                        );
                                    }

                                    function RepairReportsPage({ reports, setReports }) {
                                        const [drawerOpen, setDrawerOpen] = useState(false);
                                        const [draft, setDraft] = useState(emptyReport());
                                        const [editingId, setEditingId] = useState("");
                                        const activeReports = reports.filter((report) => report.status !== "Resolved");

                                        function saveReport(event) {
                                            event.preventDefault();
                                            if (!draft.client.trim() || !draft.issue.trim()) return;
                                            const report = {...draft, id: editingId || createId("report") };
                                            setReports((current) =>
                                                editingId ?
                                                current.map((item) => (item.id === editingId ? report : item)) : [report, ...current],
                                            );
                                            setDrawerOpen(false);
                                            setEditingId("");
                                            setDraft(emptyReport());
                                        }

                                        function openEditor(report = emptyReport()) {
                                            setDraft(report);
                                            setEditingId(report.id || "");
                                            setDrawerOpen(true);
                                        }

                                        return ( <PageShell eyebrow = "Repair Reports"
                                                title = "Ticket feed"
                                                description = "Create repair reports from a focused drawer and review saved jobs as technician tickets.">
                                                <section className = "tool-header">
                                                <div>
                                                <h2> { activeReports.length }
                                                active tickets </h2> <p> Resolved work stays visible without competing with current field tasks. </p> </div> <button type ="button" className="primary-btn" onClick={ ()=> openEditor()
                                            }>
                                            +New Report </button> </section>

                                            <section className = "ticket-feed"> {
                                                reports.map((report) => ( <TicketCard report = { report }
                                                    key = { report.id }
                                                    onOpen = {
                                                        () => openEditor(report)
                                                    }
                                                    onDelete = {
                                                        () => setReports((current) => current.filter((item) => item.id !== report.id))
                                                    }
                                                    onDuplicate = {
                                                        () =>
                                                        setReports((current) => [{
                                                                ...report,
                                                                id: createId("report"),
                                                                client: `${report.client} Copy`,
                                                                status: "Open",
                                                                date: today,
                                                            },
                                                            ...current,
                                                        ])
                                                    }
                                                    />
                                                ))
                                            } </section>

                                        {
                                            drawerOpen && ( <Drawer title = { editingId ? "Edit Report" : "New Report" }
                                                    onClose = {
                                                        () => setDrawerOpen(false)
                                                    }>
                                                    <form className = "guided-form"
                                                    onSubmit = { saveReport }>
                                                    <label>
                                                    Client <input value = { draft.client }
                                                    onChange = {
                                                        (event) => setDraft({...draft, client: event.target.value })
                                                    }
                                                    placeholder = "Acme Dental" />
                                                    </label> <label>
                                                    Asset <input value = { draft.asset }
                                                    onChange = {
                                                        (event) => setDraft({...draft, asset: event.target.value })
                                                    }
                                                    placeholder = "Front Desk PC" />
                                                    </label> <label>
                                                    Issue <textarea value = { draft.issue }
                                                    onChange = {
                                                        (event) => setDraft({...draft, issue: event.target.value })
                                                    }
                                                    placeholder = "No internet after office move" />
                                                    </label> <label>
                                                    Diagnosis <textarea value = { draft.diagnosis }
                                                    onChange = {
                                                        (event) => setDraft({...draft, diagnosis: event.target.value })
                                                    }
                                                    placeholder = "DHCP lease on wrong VLAN" />
                                                    </label> <label>
                                                    Resolution <textarea value = { draft.fix }
                                                    onChange = {
                                                        (event) => setDraft({...draft, fix: event.target.value })
                                                    }
                                                    placeholder = "Moved switchport, renewed lease, verified DNS" />
                                                    </label> <div className ="field-grid"> <label>
                                                    Status <select value = { draft.status }
                                                    onChange = {
                                                        (event) => setDraft({...draft, status: event.target.value })
                                                    }>
                                                    <option> Open </option> <option> In Progress </option> <option> Resolved </option> <option> Escalated </option> </select> </label> <label>
                                                    Date <input type = "date"
                                                    value = { draft.date }
                                                    onChange = {
                                                        (event) => setDraft({...draft, date: event.target.value })
                                                    }
                                                    /> </label> </div> <div className ="action-row"> <button type ="submit" className="primary-btn">
                                                    Save Report </button> <button type ="button" onClick={ ()=> copyText(JSON.stringify(draft, null, 2))
                                                }>
                                                Export </button> <button type ="button" onClick={ ()=> window.print()
                                        }>
                                        Print </button> </div> </form> </Drawer>
                                    )
                                } </PageShell>
                            );
                        }

                        function TicketCard({ report, onOpen, onDelete, onDuplicate, compact = false }) {
                            return ( <article className = { compact ? "ticket-card compact" : "ticket-card" }>
                                    <span className = { `ticket-dot ${statusClass(report.status)}` }
                                    /> <div> <div className ="ticket-topline"> <span className = { `status-badge ${statusClass(report.status)}` }> { report.status } </span> <small> { report.date } </small> </div> <h3> { report.client } </h3> <p className = "asset-name"> { report.asset } </p> <p> { report.issue } </p> {!compact && <p className = "resolution-text"> { report.fix } </p>
                                    } </div> {!compact && ( <div className ="ticket-actions"> <button type = "button"
                                    onClick = { onOpen }>
                                    Open </button> <button type ="button" onClick={ onDuplicate }>
                                    Duplicate </button> <button type ="button" onClick={ ()=> copyText(JSON.stringify(report, null, 2))
                                }>
                                Export </button> <button type ="button" onClick={ onDelete }>
                            Delete </button> </div>
                        )
                    } </article>
                );
            }

            function AssistantPage({ data }) {
                const navigate = useNavigate();
                const [input, setInput] = useState("");
                const sessions = [
                    "No Internet",
                    "Printer Offline",
                    "DHCP Failure",
                    "Cisco VLAN Issue",
                    "Slow Computer",
                ];

                function send(event, promptText = "") {
                    event?.preventDefault();
                    const question = promptText || input;
                    if (!question.trim()) return;
                    const insight = assistantInsight(question);
                    data.setChat((current) => [
                        ...current,
                        { role: "user", text: question },
                        { role: "ai", text: insight.answer, insight },
                    ]);
                    setInput("");
                }

                return ( <main className = "page assistant-workspace">
                        <aside className = "session-rail">
                        <h2> Recent sessions </h2> {
                        sessions.map((session) => ( <button type = "button"
                            onClick = {
                                (event) => send(event, session)
                            }
                            key = { session }> { session } </button>
                        ))
                    } </aside> <section className ="chat-workspace"> <header className ="chat-hero"> <p className = "eyebrow"> TechMate AI </p> <h1> How can I help ? </h1> <p> Describe the symptom, paste an error code, or enter a command result. </p> </header> <div className = "conversation"> {
                        data.chat.map((message, index) => ( <div className = { `message ${message.role}` }
                            key = { `${message.role}-${index}` }>
                            <p> { message.text } </p> {
                            message.insight && <AssistantInsight insight = { message.insight }
                            navigate = { navigate }
                            />} </div>
                        ))
                    } </div> <form className ="assistant-composer" onSubmit={ send }> <input value = { input }
                onChange = {
                    (event) => setInput(event.target.value)
                }
                placeholder = "Type your issue..." />
                    <button type = "submit"
                className = "primary-btn">
                    Send </button> <button type ="button" onClick={ ()=> data.setChat([])
            }>
            Clear </button> </form> </section> </main>
        );
    }

    function AssistantInsight({ insight, navigate }) {
        return ( <div className = "insight-card">
            <div>
            <strong> Issue detected </strong> <span> { insight.issue } </span> </div> <div> <strong> Likely cause </strong> <span> { insight.cause } </span> </div> <div> <strong> Recommended commands </strong> {
            insight.commands.map((command) => ( <code key = { command }> { command } </code>))
                } </div> <div> <strong> Related playbook </strong> <span> { insight.playbook } </span> </div> <button type = "button"
                className = "primary-btn"
                onClick = {
                    () => navigate("/repair-reports")
                }> Create Repair Report </button> </div>
            );
        }

        function UploadPage({ data }) {
            const [category, setCategory] = useState("Networking");
            const [tags, setTags] = useState("");
            const [notes, setNotes] = useState("");
            const [relatedVendor, setRelatedVendor] = useState("Cisco");
            const [skillLevel, setSkillLevel] = useState("Reference");

            function chooseFile(event) {
                const file = event.target.files?.[0];
                if (!file) return;
                const detected = detectFile(file.name);
                const uploadRecord = {
                    id: createId("upload"),
                    name: file.name,
                    type: file.type || file.name.split(".").pop() || "document",
                    size: file.size,
                    date: new Date().toLocaleDateString(),
                    category: category || detected.category,
                    tags: splitList(tags || detected.tags.join(",")),
                    notes,
                    relatedVendor: relatedVendor || detected.vendor,
                    skillLevel,
                };
                const knowledgeRecord = normalizeKnowledgeRecord({
                    id: createId("knowledge-file"),
                    title: file.name,
                    category: uploadRecord.category,
                    sourceType: "Uploaded Document",
                    tags: uploadRecord.tags,
                    summary: notes || `Uploaded ${detected.kind} detected as ${detected.vendor} / ${detected.category}.`,
                    skillLevel,
                    relatedVendor: uploadRecord.relatedVendor,
                    relatedTopics: uploadRecord.tags,
                    dateAdded: today,
                    notes,
                    fileName: file.name,
                    fileType: uploadRecord.type,
                });
                data.setUploads((current) => [uploadRecord, ...current]);
                data.setCustomKnowledge((current) => [knowledgeRecord, ...current]);
            }

            return ( <PageShell eyebrow = "Upload Center"
                title = "Drop files, then act on the intelligence"
                description = "Uploads become lightweight knowledge records. Large PDFs and source files stay outside src/assets.">
                <section className = "upload-command">
                <div className = "drop-zone">
                <input id = "doc-upload"
                type = "file"
                accept = ".pdf,.txt,.doc,.docx,image/*,.pkt,.log"
                onChange = { chooseFile }
                /> <label htmlFor ="doc-upload"> <strong> Drag files here </strong> <span> PDF, Packet Tracer, screenshot, logs, DOCX, TXT </span> </label> </div> <div className ="upload-classifier"> <h2> Classification </h2> <div className = "field-grid"> <select value = { category }
                onChange = {
                    (event) => setCategory(event.target.value)
                }> {
                    knowledgeCategories.map((item) => ( <option key = { item }> { item } </option>))
                        } </select> <select value ={ relatedVendor } onChange={ (event)=> setRelatedVendor(event.target.value)
                    }> {
                        vendorNames.map((item) => ( <option key = { item }> { item } </option>))
                            } </select> </div> <select value = { skillLevel }
                            onChange = {
                                (event) => setSkillLevel(event.target.value)
                            }> {
                                skillLevels.map((item) => ( <option key = { item }> { item } </option>))
                                    } </select> <input value ={ tags } onChange={ (event)=> setTags(event.target.value)
                                }
                                placeholder = "Tags: ccna, dhcp, printer, windows" />
                                <textarea value = { notes }
                                onChange = {
                                    (event) => setNotes(event.target.value)
                                }
                                placeholder = "Technician notes for this file..." />
                                </div> </section> <section className = "file-intel-feed"> {
                                    (data.uploads.length ?
                                        data.uploads : [{
                                            id: "empty",
                                            name: "No files uploaded yet",
                                            category: "Waiting",
                                            relatedVendor: "None",
                                            tags: [],
                                        }, ]
                                    ).map((file) => ( <article className = "file-intel"
                                        key = { file.id }>
                                        <div>
                                        <strong> { file.name } </strong> <span>
                                        Detected: { file.relatedVendor || "Unknown" }
                                        / {file.category || "Uncategorized"} / {
                                            (file.tags || []).join(", ") || "No tags"
                                        } </span> </div> <div className = "action-row">
                                        <button type = "button"> Add To Knowledge Base </button> <button type ="button"> Generate Summary </button> <button type = "button"> Create Flashcards </button> <button type ="button"> Create Playbook </button> </div> </article>
                                    ))
                                } </section> </PageShell>
                            );
                        }

                        function CommandsPage({ data }) {
                            const [query, setQuery] = useState("");
                            const [filter, setFilter] = useState("All");
                            const allCommands = learningCommandGroups.flatMap((group) =>
                                group.commands.map(([command, detail, when]) => ({
                                    group: group.group,
                                    command,
                                    detail,
                                    when,
                                })),
                            );
                            const commands = allCommands.filter((item) => {
                                const inGroup = filter === "All" || item.group === filter;
                                const inQuery = `${item.group} ${item.command} ${item.detail} ${item.when}`.toLowerCase().includes(query.toLowerCase());
                                return inGroup && inQuery;
                            });

                            function handleCommandUse(command) {
                                copyText(command);
                                data.setRecentCommands((current) => [command, ...current.filter((item) => item !== command)].slice(0, 5));
                            }

                            function toggleFavorite(command) {
                                data.setFavorites((current) =>
                                    current.includes(command) ?
                                    current.filter((item) => item !== command) : [command, ...current],
                                );
                            }

                            return ( <PageShell eyebrow = "Commands"
                                    title = "Command library that explains the command"
                                    description = "Search commands by task, learn what they mean, and copy the ones you need.">
                                    <section className = "search-first">
                                    <input value = { query }
                                    onChange = {
                                        (event) => setQuery(event.target.value)
                                    }
                                    placeholder = "Search commands, platforms, or purpose..." />
                                    <div className = "tab-row"> {
                                        ["All", ...learningCommandGroups.map((group) => group.group)].map((item) => ( <button type = "button"
                                            className = { filter === item ? "active" : "" }
                                            onClick = {
                                                () => setFilter(item)
                                            }
                                            key = { item }> { item } </button>
                                        ))
                                    } </div> </section> <section className = "workspace-grid two-col">
                                    <aside className = "utility-rail">
                                    <h2> Favorites </h2> {
                                    data.favorites.map((item) => ( <button type = "button"
                                        onClick = {
                                            () => handleCommandUse(item)
                                        }
                                        key = { item }> { item } </button>
                                    ))
                                } <h2> Recently used </h2> {
                                (data.recentCommands.length ? data.recentCommands : ["No recent commands"]).map((item) => ( <span key = { item }> { item } </span>))
                                    } </aside> <div className ="command-table"> {
                                    commands.map((item) => ( <article className = "command-line"
                                            key = { `${item.group}-${item.command}` }>
                                            <div>
                                            <span> { item.group } </span> <code> { item.command } </code> <p> { item.detail } </p> <small> { item.when } </small> </div> <button type ="button" onClick={ ()=> toggleFavorite(item.command)
                                        }> { data.favorites.includes(item.command) ? "Saved" : "Favorite" } </button> <button type ="button" className="primary-btn" onClick={ ()=> handleCommandUse(item.command)
                                    }>
                                    Copy </button> </article>
                                ))
                    } </div> </section> </PageShell>
                );
            }

            function NetworkCenterPage() {
                const [activeModule, setActiveModule] = useState("Packet Tracer Assistant");
                const [subnetAddress, setSubnetAddress] = useState("192.168.1.0");
                const [subnetCidr, setSubnetCidr] = useState("24");
                const [hostsRequired, setHostsRequired] = useState("");
                const modules = [
                    {
                        title: "Packet Tracer Assistant",
                        detail: "Import lab notes, outline topology goals, and generate a step-by-step build checklist.",
                        action: "Draft lab checklist",
                        output: "Placeholder: VLAN 10/20 topology, DHCP scopes, trunk links, and gateway tests queued.",
                    },
                    {
                        title: "Subnet Calculator",
                        detail: "Plan IPv4 networks with CIDR, usable host counts, wildcard masks, and gateway notes.",
                        action: "Calculate subnet",
                        output: "Placeholder: 192.168.10.0/24 gives 254 usable hosts and wildcard 0.0.0.255.",
                    },
                    {
                        title: "IPv4/IPv6 Tools",
                        detail: "Convert addresses, validate formats, compare private ranges, and document DNS checks.",
                        action: "Open IP tools",
                        output: "Placeholder: IPv4, IPv6, DNS, gateway, and route checks are ready for wiring.",
                    },
                    {
                        title: "CCNA Study Center",
                        detail: "Review switching, routing, subnetting, wireless, security, and automation objectives.",
                        action: "Start study set",
                        output: "Placeholder: Today's CCNA set focuses on VLANs, inter-VLAN routing, and OSPF basics.",
                    },
                    {
                        title: "Cisco Command Library",
                        detail: "Fast access to show, debug, interface, VLAN, trunk, routing, and save commands.",
                        action: "Browse commands",
                        output: "Placeholder: show vlan brief, show ip interface brief, show interfaces trunk.",
                    },
                    {
                        title: "Network Troubleshooter",
                        detail: "Guide technicians through link, IP, DNS, DHCP, VLAN, gateway, and ISP triage.",
                        action: "Run triage",
                        output: "Placeholder: Start with physical link, IP address, gateway ping, DNS, then VLAN path.",
                    },
                ];
                const selected = modules.find((module) => module.title === activeModule) || modules[0];
                const subnetResult = calculateSubnet(subnetAddress, subnetCidr, hostsRequired);
                const subnetCopy = subnetResult.error ? subnetResult.error : formatSubnetResults(subnetResult);

                function loadSubnetExample(address, cidr) {
                    setSubnetAddress(address);
                    setSubnetCidr(String(cidr));
                    setHostsRequired("");
                    setActiveModule("Subnet Calculator");
                }

                return ( <PageShell eyebrow = "Network Center"
                    title = "Network operations workspace"
                    description = "Packet Tracer help, subnet planning, Cisco commands, and guided network troubleshooting in one place.">
                    <section className = "network-hero">
                    <div>
                    <span className = "status-badge resolved"> Lab ready </span> <h2> Build, calculate, troubleshoot, and study without leaving TechMate. </h2> <p>
                    Use this center as the launchpad for CCNA practice, field diagnostics, and network documentation. </p> </div>
                    <div className = "network-signal">
                    <span> Core Switch </span> <strong> VLANs 10 / 20 / 30 </strong> <code> show ip interface brief </code> </div> </section>

                    <section className = "network-module-grid"> {
                        modules.map((module) => ( <article className = { activeModule === module.title ? "network-module-card active" : "network-module-card" }
                            key = { module.title }>
                            <div>
                            <h2> { module.title } </h2> <p> { module.detail } </p> </div> <button type = "button"
                            className = "primary-btn"
                            onClick = {
                                () => setActiveModule(module.title)
                            }> { module.action } </button> </article>
                        ))
                    } </section>

                    <section className = "tool-header network-output">
                    <div>
                    <h2> { selected.title } </h2> <p> { selected.output } </p> </div> <button type = "button"
                    onClick = {
                        () => copyText(selected.output)
                    }>
                    Copy Placeholder </button> </section>

                    <section className = "subnet-calculator">
                    <div className = "section-heading">
                    <h2> Subnet Calculator </h2> <p> Calculate IPv4 subnet details in real time as the address, CIDR, or host requirement changes. </p> </div>
                    <div className = "subnet-example-row"> {
                        [
                            ["192.168.1.0", 24],
                            ["10.0.0.0", 16],
                            ["172.16.0.0", 20],
                        ].map(([address, cidr]) => ( <button type = "button"
                            key = { `${address}/${cidr}` }
                            onClick = {
                                () => loadSubnetExample(address, cidr)
                            }> { address }/{ cidr } </button>
                        ))
                    } </div>
                    <div className = "subnet-tool-grid">
                    <form className = "subnet-form">
                    <label> Network Address <input value = { subnetAddress }
                        onChange = {
                            (event) => setSubnetAddress(event.target.value)
                        }
                        placeholder = "192.168.1.0" /> </label>
                    <label> CIDR <input value = { subnetCidr }
                        onChange = {
                            (event) => setSubnetCidr(event.target.value.replace("/", ""))
                        }
                        placeholder = "/24" /> </label>
                    <label> Hosts Required <input value = { hostsRequired }
                        onChange = {
                            (event) => setHostsRequired(event.target.value)
                        }
                        placeholder = "Optional" /> </label> </form>

                    <div className = "subnet-results">
                    {
                        subnetResult.error ? <p className = "subnet-error"> { subnetResult.error } </p> : <>
                            <div className = "subnet-result-grid"> {
                                [
                                    ["Network Address", subnetResult.networkAddress],
                                    ["Subnet Mask", subnetResult.subnetMask],
                                    ["Wildcard Mask", subnetResult.wildcardMask],
                                    ["Broadcast Address", subnetResult.broadcastAddress],
                                    ["First Usable Host", subnetResult.firstUsableHost],
                                    ["Last Usable Host", subnetResult.lastUsableHost],
                                    ["Total Hosts", subnetResult.totalHosts],
                                    ["Usable Hosts", subnetResult.usableHosts],
                                ].map(([label, value]) => ( <div key = { label }>
                                    <span> { label } </span> <strong> { value } </strong> </div>
                                ))
                            } </div>
                            { subnetResult.hostMessage && <p className = "subnet-host-note"> { subnetResult.hostMessage } </p> }
                            <div className = "binary-panel">
                            <h3> Binary representation </h3> <code> IP: { subnetResult.binary.ip } </code> <code> Mask: { subnetResult.binary.mask } </code> <code> Network: { subnetResult.binary.network } </code> <code> Broadcast: { subnetResult.binary.broadcast } </code> </div>
                        </>
                    }
                    <button type = "button"
                    className = "primary-btn"
                    onClick = {
                        () => copyText(subnetCopy)
                    }>
                    Copy Results </button> </div> </div> </section> </PageShell>
                );
            }

            function ErrorCodesPage({ data }) {
                const [query, setQuery] = useState("");
                const [selected, setSelected] = useState(learningErrorCodes[0]);
                const matches = learningErrorCodes.filter((item) =>
                    `${item.code} ${item.category} ${item.plainEnglish} ${item.why.join(" ")} ${item.easyFix.join(" ")} ${item.advancedFix} ${item.playbook}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                );
                const isStudent = data.learningMode === "Student";

                return ( <PageShell eyebrow = "Error Codes"
                    title = "Error lookup that teaches the fix"
                    description = "Student Mode explains the error in plain English. Technician Mode shows the fastest command path.">
                    <ModeSwitch mode = { data.learningMode }
                    setMode = { data.setLearningMode }
                    /> <section className ="error-search-console"> <input value ={ query } onChange={ (event)=> setQuery(event.target.value)
                }
                placeholder = "Search 0x80070005, DHCP, printer, Cisco, access denied..." />
                    <div className = "common-searches"> {
                        ["0x80070005", "169.254", "Printer offline", "Cisco VLAN", "DNS"].map((item) => ( <button type = "button"
                            onClick = {
                                () => setQuery(item)
                            }
                            key = { item }> { item } </button>
                        ))
                    } </div> </section> <section className = "workspace-grid two-col">
                    <div className = "error-results"> {
                        matches.map((item) => ( <button type = "button"
                            className = { selected.code === item.code ? "error-result active" : "error-result" }
                            onClick = {
                                () => setSelected(item)
                            }
                            key = { item.code }>
                            <span className = { `status-badge ${item.severity.toLowerCase()}` }> { item.severity } </span> <strong> { item.code } </strong> <small> { item.plainEnglish } </small> </button>
                        ))
                    } </div> <article className ="error-detail-panel"> <span className ={ `status-badge ${selected.severity.toLowerCase()}` }> { selected.severity } </span> <h2> { selected.code } </h2> <p> { selected.plainEnglish } </p> {
                        isStudent ? ( <div className = "learning-detail">
                            <h3> Why this happens </h3> <ul> {
                            selected.why.map((item) => <li key = { item }> { item } </li>)}</ul>
                                <h3> Easy fix </h3> <ol> {
                                selected.easyFix.map((item) => <li key = { item }> { item } </li>)}</ol>
                                    <h3> Advanced fix </h3> <code> { selected.advancedFix } </code> <p> { selected.advancedExplanation } </p> </div>
                                ): ( <dl>
                                    <dt> Fast path </dt> <dd> { selected.easyFix.join("> ") } </dd> <dt> Advanced command </dt> <dd> { selected.advancedFix } </dd> <dt> Related playbook </dt> <dd> { selected.playbook } </dd> </dl>
                                )
                            } <div className = "command-chip-row"> {
                                selected.commands.map((command) => ( <button type = "button"
                                    onClick = {
                                        () => copyText(command)
                                    }
                                    key = { command }> { command } </button>
                                ))
                            } </div> <div className ="action-row"> <Link className ="primary-btn" to="/troubleshooting">
                            Open Playbook </Link> <Link className ="ghost-btn" to="/vendor-resources">
                            Vendor Resources </Link> </div> </article> </section> </PageShell>
                        );
                    }

                function TroubleshootingPage({ data }) {
                    const [playbook, setPlaybook] = useState(guidedPlaybooks[0]);
                    const [step, setStep] = useState(0);
                    const progress = Math.round(((step + 1) / playbook.steps.length) * 100);
                    const currentStep = playbook.steps[step];
                    const isStudent = data.learningMode === "Student";

                    return ( <PageShell eyebrow = "Troubleshooting"
                            title = "Guided troubleshooting that teaches each step"
                            description = "Topic cards and guided playbooks for students and technicians with clear next actions.">
                            <ModeSwitch mode = { data.learningMode }
                            setMode = { data.setLearningMode }
                            /> <section className ="topic-card-grid"> {
                            troubleshootingTopics.map((topic) => ( <TroubleshootingTopicCard key = { topic.title }
                                topic = { topic }
                                />
                            ))
                        } </section> <section className ="workspace-grid two-col"> <aside className ="utility-rail"> <h2> Playbooks </h2> {
                    guidedPlaybooks.map((item) => ( <button type = "button"
                        className = { item.title === playbook.title ? "active" : "" }
                        onClick = {
                            () => {
                                setPlaybook(item);
                                setStep(0);
                            }
                        }
                        key = { item.title }> { item.title } </button>
                    ))
                } <div className = "concept-box">
                    <strong> Concept </strong> <p> { isStudent ? playbook.concept : playbook.technicianSummary } </p> {
                        isStudent && ( <>
                            <p className = "beginner-tip">
                            Beginner tip: Read each step to understand how the issue is isolated and why the next test matters. </p> <Link className ="ghost-btn" to="/troubleshooting-wizard">
                            Open Troubleshooting Wizard </Link> </>
                        )
                    } </div> </aside> <div className = "diagnostic-stage learning-stage">
                    <ProgressRow label = { playbook.title }
                value = { progress }
                /> <span> Step { step + 1 }
                of { playbook.steps.length } </span> <h2> { currentStep.title } </h2> <div className = "step-teaching-grid">
                    <TeachingBlock title = "What to do"
                content = { currentStep.what }
                /> <TeachingBlock title ="Why this matters" content={ isStudent ? currentStep.why : playbook.technicianSummary }/> <TeachingBlock title = "Command"
                content = { currentStep.command }
                code />
                    <TeachingBlock title = "Expected result"
                content = { currentStep.expected }
                /> <TeachingBlock title ="If it is wrong" content={ currentStep.ifWrong }/> <TeachingBlock title = "Common mistake"
                content = { currentStep.mistakes }
                /> </div> <div className = "next-step-strip">
                    <strong> Next step </strong> <span> { currentStep.next } </span> </div> {
                isStudent && ( <div className = "student-summary-box">
                    <strong> Student summary </strong> <p>
                    Follow the step, compare what you saw to the expected result, and use the 'If it is wrong'
                    guidance before moving on. </p> </div>
                )
            } <div className = "action-row">
                <button type = "button"
            onClick = {
                    () => setStep(Math.max(0, step - 1))
                }>
                Previous </button> <button type ="button" className="primary-btn" onClick={ ()=> setStep(Math.min(playbook.steps.length - 1, step + 1))
        }>
        Next Step </button> <Link className ="ghost-btn" to="/repair-reports">
        Create Report </Link> </div> </div> </section> </PageShell>
    );
}

function TroubleshootingWizardPage({ data }) {
    const isStudent = data.learningMode === "Student";

    return ( <PageShell eyebrow = "Troubleshooting Wizard"
        title = "Beginner-friendly troubleshooting guide"
        description = "Select a category and use step-based checks, commands, and next actions.">
        <section className = "topic-card-grid"> {
            troubleshootingTopics.map((topic) => ( <TroubleshootingTopicCard key = { topic.title }
                topic = { topic }
                />
            ))
        } </section> <div className ="wizard-note"> <strong> { isStudent ? "Student tip" : "Technician note" } </strong> <p> {
            isStudent ?
            "Follow the card details and use the commands written in plain language to build habits." : "Use this wizard for quick issue rehearsal and then jump to a report or command copy."
        } </p> </div> </PageShell>
    );
}

function LabsPage({ data }) {
    return ( <PageShell eyebrow = "Labs"
        title = "Lab progress board"
        description = "Keep lab work visible without turning the page into a card dump.">
        <section className = "lab-board"> {
            data.labState.map((lab) => ( <article className = "lab-row"
                key = { lab.id }>
                <div>
                <span> { lab.category } </span> <h3> { lab.title } </h3> <p> { lab.status }
                / Due {lab.due}</p>
                </div> <ProgressRow label ="Progress" value={ lab.progress }/> </article>
            ))
        } </section> </PageShell>
    );
}

function ModeSwitch({ mode, setMode }) {
    return ( <section className = "mode-switch"> {
        ["Student", "Technician"].map((item) => ( <button type = "button"
            className = { mode === item ? "active" : "" }
            onClick = {
                () => setMode(item)
            }
            key = { item }> { item }
            Mode </button>
        ))
    } <p> {
        mode === "Student" ?
        "Student mode shows clear explanations and step teaching." : "Technician mode shows fast troubleshooting commands and outcomes."
    } </p> </section> );
}

function TeachingBlock({ title, content, code = false }) {
    const renderContent = () => {
        if (!content) {
            return <p className = "empty-note"> No guidance available
            for this step. </p>;
        }
        if (Array.isArray(content)) {
            return <ul> {
                content.map((item) => <li key = { item }> { item } </li>)}</ul> ;
                }
                return code ? <pre> <code> { content } </code></pre> : <p> { content } </p>;
            };

            return ( <article className = "teaching-block">
                <h3> { title } </h3> { renderContent() } </article>
            );
        }

        function TroubleshootingTopicCard({ topic }) {
            return ( <article className = "troubleshooting-card">
                <h3> { topic.title } </h3> <div className ="troubleshooting-card-field"> <strong> What this means </strong> <p> { topic.meaning } </p> </div> <div className = "troubleshooting-card-field">
                <strong> What to check first </strong> <p> { topic.check } </p> </div> <div className ="troubleshooting-card-field"> <strong> Commands to run </strong> <ul> { topic.commands.map((command)=> <li key ={ command }> <code> { command } </code> </li> ) } </ul> </div> <div className ="troubleshooting-card-field"> <strong> Next step </strong> <p> { topic.next } </p> </div> </article>
            );
        }

        function ProfilePage({ profile, setProfile }) {
            const [draft, setDraft] = useState(profile);
            const safeDraft = ensureObject(draft, defaultProfile);

            function save(event) {
                event.preventDefault();
                setProfile(safeDraft);
            }

            return ( <PageShell eyebrow = "Profile"
                title = "Technician profile"
                description = "Local technician context for future Firebase and AI personalization.">
                <form className = "guided-form profile-form"
                onSubmit = { save }> {
                    Object.keys(defaultProfile).map((field) => ( <label key = { field }> { labelize(field) } <input value = { safeDraft[field] }
                        onChange = {
                            (event) => setDraft({...safeDraft, [field]: event.target.value })
                        }
                        /> </label>
                    ))
                } <button type = "submit"
                className = "primary-btn">
                Save Profile </button> </form> </PageShell>
            );
        }

        function PricingPage({ selectedPlan, setSelectedPlan }) {
            const plans = [
                ["Starter", "$0", "Local command library, reports, and demo assistant."],
                ["Technician", "$9", "Saved workflows, uploads, and expanded knowledge tools."],
                ["Team", "$29", "Future team sync, Firebase, shared clients, and AI integrations."],
            ];

            return ( <PageShell eyebrow = "Pricing"
                title = "Plans"
                description = "Visual plan selection saved locally for now.">
                <section className = "pricing-grid"> {
                    plans.map(([name, price, detail]) => ( <article className = { selectedPlan === name ? "price-card selected" : "price-card" }
                            key = { name }>
                            <h3> { name } </h3> <strong> { price } </strong> <p> { detail } </p> <button type ="button" className="primary-btn" onClick={ ()=> setSelectedPlan(name)
                        }>
                        Choose { name } </button> </article>
                    ))
            } </section> </PageShell>
        );
    }

    function PageShell({ eyebrow, title, description, children }) {
        return ( <main className = "page">
            <section className = "page-hero">
            <p className = "eyebrow"> { eyebrow } </p> <h1> { title } </h1> <p> { description } </p> </section> { children } </main>
        );
    }

    function FallbackPage() {
        return ( <PageShell eyebrow = "Workspace"
            title = "Page ready"
            description = "This route is connected. Choose a workspace from the sidebar or start with one of the shortcuts below.">
            <section className = "workflow-strip"> {
                [
                    ["Dashboard", "/dashboard", "Review tickets, stats, and technician shortcuts."],
                    ["AI Assistant", "/ai-assistant", "Ask TechMate for triage and next steps."],
                    ["Knowledge Base", "/knowledge-base", "Search repair notes and troubleshooting records."],
                    ["Profile", "/profile", "Update local technician context."],
                ].map(([title, path, text]) => ( <Link to = { path }
                    key = { path }>
                    <strong> { title } </strong> <span> { text } </span> </Link>
                ))
            } </section> </PageShell>
        );
    }

    function Drawer({ title, onClose, children }) {
        return ( <div className = "drawer-backdrop"
            role = "presentation"
            onClick = { onClose }>
            <aside className = "drawer"
            role = "dialog"
            aria-modal = "true"
            aria-label = { title }
            onClick = {
                (event) => event.stopPropagation()
            }>
            <header>
            <h2> { title } </h2> <button type ="button" onClick={ onClose }>
            Close </button> </header> { children } </aside> </div>
        );
    }

    function Metric({ value, label }) {
        return ( <article className = "metric-card">
            <strong> { value } </strong> <span> { label } </span> </article>
        );
    }

    function ProgressRow({ label, value }) {
        return ( <div className = "progress-row">
            <div>
            <span> { label } </span> <strong> { value } % </strong> </div> <div className ="progress-track"> <span style = {
                { width: `${value}%` } }
            /> </div> </div>
        );
    }

    function assistantInsight(input) {
        const text = input.toLowerCase();
        if (text.includes("169.254") || text.includes("dhcp") || text.includes("internet")) {
            return {
                issue: "169.254.x.x / No internet",
                cause: "Likely DHCP failure or wrong VLAN.",
                commands: ["ipconfig /release", "ipconfig /renew", "ipconfig /all"],
                playbook: "DHCP Failure",
                answer: "Issue detected: possible DHCP failure. Verify the lease, VLAN, gateway, and DHCP scope before escalating.",
            };
        }
        if (text.includes("printer")) {
            return {
                issue: "Printer offline",
                cause: "Queue, spooler, TCP/IP port, or printer network state.",
                commands: ["Get-Service Spooler", "Restart-Service Spooler", "ping printer-ip"],
                playbook: "Printer Offline",
                answer: "Printer workflow: confirm power and IP, restart spooler, clear queue, verify port, then print a test page.",
            };
        }
        if (text.includes("cisco") || text.includes("vlan")) {
            return {
                issue: "Cisco VLAN reachability",
                cause: "Access VLAN, trunk allowed list, STP, or interface state.",
                commands: ["show vlan brief", "show interfaces status", "show interfaces trunk"],
                playbook: "Cisco VLAN Issue",
                answer: "Cisco VLAN workflow: check access VLAN, trunk status, STP state, then test gateway reachability.",
            };
        }
        return {
            issue: "General technician triage",
            cause: "Needs scope, evidence, and one-change-at-a-time testing.",
            commands: ["ping 8.8.8.8", "nslookup domain.com", "Get-EventLog -LogName System -Newest 20"],
            playbook: "General Troubleshooting",
            answer: "Start with scope, reproduce the issue, capture evidence, run read-only checks, then document the fix.",
        };
    }

    function detectFile(name) {
        const lower = name.toLowerCase();
        if (lower.includes("ccna") || lower.includes("vlan") || lower.endsWith(".pkt")) {
            return {
                kind: "Packet Tracer lab",
                vendor: "Cisco",
                category: "Networking",
                tags: ["ccna", "networking", "lab"],
            };
        }
        if (lower.includes("printer")) {
            return {
                kind: "printer evidence",
                vendor: "HP",
                category: "Printers",
                tags: ["printer", "offline"],
            };
        }
        if (lower.includes("windows") || lower.includes("update")) {
            return {
                kind: "Windows note",
                vendor: "Microsoft",
                category: "Windows",
                tags: ["windows", "update"],
            };
        }
        return {
            kind: "technician document",
            vendor: "None",
            category: "Troubleshooting",
            tags: ["uploaded", "reference"],
        };
    }

    function emptyReport() {
        return {
            client: "",
            asset: "",
            issue: "",
            diagnosis: "",
            fix: "",
            status: "Open",
            date: today,
        };
    }

    function statusClass(status) {
        return status.toLowerCase().replace(/\s+/g, "-");
    }

    function splitList(value) {
        return String(value || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function copyText(text) {
        navigator.clipboard?.writeText(text);
    }

    function calculateSubnet(address, cidrValue, hostsValue) {
        const parsedIp = parseIpv4(address);
        if (!parsedIp.valid) {
            return { error: parsedIp.error };
        }

        const cidrText = String(cidrValue || "").trim().replace("/", "");
        if (!/^\d+$/.test(cidrText)) {
            return { error: "Enter a CIDR between /0 and /32." };
        }

        const cidr = Number(cidrText);
        if (cidr < 0 || cidr > 32) {
            return { error: "CIDR must be between /0 and /32." };
        }

        const hostText = String(hostsValue || "").trim();
        let hostsRequired = 0;
        if (hostText) {
            if (!/^\d+$/.test(hostText)) {
                return { error: "Hosts Required must be a whole number." };
            }
            hostsRequired = Number(hostText);
            if (hostsRequired < 1) {
                return { error: "Hosts Required must be at least 1." };
            }
        }

        const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
        const wildcard = (~mask) >>> 0;
        const network = (parsedIp.value & mask) >>> 0;
        const broadcast = (network | wildcard) >>> 0;
        const totalHosts = 2 ** (32 - cidr);
        const usableHosts = cidr >= 31 ? totalHosts : Math.max(totalHosts - 2, 0);
        const firstUsable = cidr >= 31 ? network : (network + 1) >>> 0;
        const lastUsable = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;

        let hostMessage = "";
        if (hostsRequired) {
            if (hostsRequired <= usableHosts) {
                hostMessage = `This subnet supports ${hostsRequired} required host${hostsRequired === 1 ? "" : "s"}.`;
            } else {
                const recommendedCidr = cidrForHosts(hostsRequired);
                hostMessage = recommendedCidr === null ?
                    "That host count is larger than a single IPv4 subnet can support." :
                    `Need more space: ${hostsRequired} hosts requires about /${recommendedCidr} or larger.`;
            }
        }

        return {
            networkAddress: `${intToIpv4(network)}/${cidr}`,
            subnetMask: intToIpv4(mask),
            wildcardMask: intToIpv4(wildcard),
            broadcastAddress: intToIpv4(broadcast),
            firstUsableHost: intToIpv4(firstUsable),
            lastUsableHost: intToIpv4(lastUsable),
            totalHosts: formatNumber(totalHosts),
            usableHosts: formatNumber(usableHosts),
            hostMessage,
            binary: {
                ip: ipv4ToBinary(parsedIp.value),
                mask: ipv4ToBinary(mask),
                network: ipv4ToBinary(network),
                broadcast: ipv4ToBinary(broadcast),
            },
        };
    }

    function parseIpv4(address) {
        const parts = String(address || "").trim().split(".");
        if (parts.length !== 4) {
            return { valid: false, error: "Enter a valid IPv4 address with four octets, like 192.168.1.0." };
        }

        const octets = parts.map((part) => Number(part));
        const valid = parts.every((part, index) => /^\d+$/.test(part) && octets[index] >= 0 && octets[index] <= 255);
        if (!valid) {
            return { valid: false, error: "Each IPv4 octet must be a number from 0 to 255." };
        }

        return {
            valid: true,
            value: (((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3]) >>> 0,
        };
    }

    function intToIpv4(value) {
        return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
    }

    function ipv4ToBinary(value) {
        return [24, 16, 8, 0]
            .map((shift) => String((value >>> shift) & 255).padStart(8, "0"))
            .join(".");
    }

    function cidrForHosts(hostsRequired) {
        for (let cidr = 32; cidr >= 0; cidr -= 1) {
            const total = 2 ** (32 - cidr);
            const usable = cidr >= 31 ? total : total - 2;
            if (usable >= hostsRequired) {
                return cidr;
            }
        }
        return null;
    }

    function formatSubnetResults(result) {
        return [
            `Network Address: ${result.networkAddress}`,
            `Subnet Mask: ${result.subnetMask}`,
            `Wildcard Mask: ${result.wildcardMask}`,
            `Broadcast Address: ${result.broadcastAddress}`,
            `First Usable Host: ${result.firstUsableHost}`,
            `Last Usable Host: ${result.lastUsableHost}`,
            `Total Hosts: ${result.totalHosts}`,
            `Usable Hosts: ${result.usableHosts}`,
            result.hostMessage ? `Host Check: ${result.hostMessage}` : "",
            "Binary:",
            `IP: ${result.binary.ip}`,
            `Mask: ${result.binary.mask}`,
            `Network: ${result.binary.network}`,
            `Broadcast: ${result.binary.broadcast}`,
        ].filter(Boolean).join("\n");
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en-US").format(value);
    }

    function labelize(value) {
        return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
    }

    function createId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    export default App;
