import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AIVision.css";

const CATEGORIES = [
    "Windows Error",
    "Blue Screen (BSOD)",
    "Printer Issue",
    "Router / Modem LEDs",
    "Network Switch / Firewall",
    "Cabling / Patch Panel",
    "Motherboard / Hardware",
    "Packet Tracer Lab",
    "Other",
];

const MOCK_AI = {
    "Windows Error": {
        issue: "Windows Update Service Failure",
        confidence: 86,
        severity: "Medium",
        rootCause:
            "The Windows Update service is disabled or blocked by a permission or network configuration issue, preventing patches from downloading or installing.",
        fix: "Re-enable the Windows Update service, clear the software distribution cache, run SFC to repair system files, and retry the update.",
        steps: [
            "Press Win + R, type services.msc, and press Enter",
            "Locate Windows Update in the service list",
            "Right-click Properties and set Startup Type to Automatic",
            "Click Start to run the service immediately",
            "Open Windows Update via Settings and retry",
            "If errors persist, run sfc /scannow in an elevated PowerShell",
            "Reboot and verify the update downloads successfully",
        ],
        commands: ["Get-Service wuauserv", "Start-Service wuauserv", "sfc /scannow"],
        relatedErrors: ["0x80070422", "0x80070005", "0x80072EE7"],
        vendors: ["Microsoft Support"],
        playbook: "Windows Update Error",
    },
    "Blue Screen (BSOD)": {
        issue: "Critical Stop Error / BSOD Detected",
        confidence: 82,
        severity: "High",
        rootCause:
            "Windows crashed due to a driver failure, bad Windows update, RAM instability, or corrupted system file. The stop code pinpoints the failing component.",
        fix: "Record the stop code, check recent driver or update changes, run SFC and CHKDSK, and roll back the suspect driver.",
        steps: [
            "Record the exact stop code shown on the BSOD screen",
            "Boot into Windows and open Event Viewer (eventvwr.msc)",
            "Navigate to Windows Logs then System and look for Critical errors",
            "Identify the driver or service named in the event log",
            "Open Device Manager and roll back the suspect driver",
            "Run sfc /scannow from an elevated command prompt",
            "Run chkdsk C: /scan to check disk integrity",
            "Reboot and monitor for repeat crashes",
        ],
        commands: ["Get-WinEvent -LogName System -MaxEvents 20", "sfc /scannow", "chkdsk C: /scan"],
        relatedErrors: ["STOP CODE", "0x80070005", "KERNEL_SECURITY_CHECK_FAILURE"],
        vendors: ["Microsoft Support", "Dell Support", "HP Support"],
        playbook: "BSOD Recovery",
    },
    "Printer Issue": {
        issue: "Printer Offline or Print Queue Stuck",
        confidence: 90,
        severity: "Medium",
        rootCause:
            "The printer is offline due to a stuck print queue, stale TCP/IP port, or a network address change since the port was last configured.",
        fix: "Clear the print queue, restart the spooler service, verify the printer IP address, and recreate the TCP/IP port if needed.",
        steps: [
            "Check the printer screen for any displayed error codes",
            "Open Control Panel then Devices and Printers on the PC",
            "Right-click the printer and choose See what's printing",
            "Cancel all queued print jobs",
            "Open Services (services.msc) and restart the Print Spooler",
            "Ping the printer IP to verify network reachability",
            "If ping fails, check the printer front panel for its current IP",
            "Delete and recreate the TCP/IP printer port with the correct IP",
            "Print a test page to confirm the issue is resolved",
        ],
        commands: ["ping printer-ip", "Get-Service Spooler", "Restart-Service Spooler"],
        relatedErrors: ["13.20.00", "Printer Offline", "Error 0x00000709"],
        vendors: ["HP Support", "Canon Support", "Brother Support"],
        playbook: "Printer Offline",
    },
    "Router / Modem LEDs": {
        issue: "WAN or Internet Link Failure",
        confidence: 78,
        severity: "High",
        rootCause:
            "The modem or router cannot establish upstream connectivity due to an ISP outage, coax or fiber signal loss, or failed PPPoE authentication.",
        fix: "Verify ISP outage status, check all physical cable connections, power-cycle the modem and router, and confirm the internet LED after sync.",
        steps: [
            "Check the internet LED on the modem — red or amber means no WAN link",
            "Verify all coax or fiber cable connections at the wall and device",
            "Power off the modem, wait 30 seconds, then power back on",
            "Wait 3 to 5 minutes for the modem to re-sync with the ISP",
            "Check the ISP status page or call support for outage reports",
            "If the WAN LED turns solid, ping 8.8.8.8 from a PC to verify internet",
            "If still failing, escalate to the ISP with the modem event log",
        ],
        commands: ["ping 8.8.8.8", "tracert 8.8.8.8", "nslookup google.com"],
        relatedErrors: ["ERR_CONNECTION_TIMED_OUT", "DNS_PROBE_FINISHED_NXDOMAIN"],
        vendors: ["Ubiquiti Support", "Fortinet Support", "Aruba / HPE Support"],
        playbook: "No Internet",
    },
    "Network Switch / Firewall": {
        issue: "Port or VLAN Configuration Issue",
        confidence: 84,
        severity: "Medium",
        rootCause:
            "One or more switch ports are blocked, assigned to the wrong VLAN, or experiencing a duplex mismatch. Spanning Tree Protocol may also be blocking a port.",
        fix: "Check interface status and VLAN assignment. Verify spanning tree state and correct any err-disabled or blocked ports.",
        steps: [
            "Console into the switch or open the management interface",
            "Run: show interfaces status to identify connected and error ports",
            "Run: show vlan brief to confirm correct VLAN assignments",
            "Run: show spanning-tree to check for blocked or err-disabled ports",
            "Correct any VLAN or trunk misconfigurations found",
            "Use no shutdown on disabled interfaces if appropriate",
            "Test end-to-end connectivity with ping after changes",
            "Document all configuration changes made",
        ],
        commands: ["show interfaces status", "show vlan brief", "show spanning-tree"],
        relatedErrors: ["%LINEPROTO-5-UPDOWN", "%LINK-3-UPDOWN", "err-disabled"],
        vendors: ["Cisco Support", "Ubiquiti Support", "Fortinet Support"],
        playbook: "Cisco VLAN Issue",
    },
    "Cabling / Patch Panel": {
        issue: "Physical Layer Connectivity Problem",
        confidence: 80,
        severity: "Medium",
        rootCause:
            "A loose cable, incorrect patch panel connection, or damaged RJ45 connector is preventing a stable Layer 1 link between the device and switch.",
        fix: "Reseat or replace the cable, trace the patch panel path, and verify the switch port shows a solid link light.",
        steps: [
            "Check the switch port for a green link light",
            "Reseat the patch cable at both the device and patch panel end",
            "Swap the cable with a known-good cable to rule out cable failure",
            "Trace the wall jack label back to the correct patch panel port",
            "Verify the patch panel port connects to the right switch port",
            "Run ipconfig /all on the client to confirm a valid IP is received",
            "Document the final port label and connection path",
        ],
        commands: ["show interfaces status", "ipconfig /all"],
        relatedErrors: ["169.254.x.x", "No Link Light", "APIPA Address"],
        vendors: ["Cisco Support", "Aruba / HPE Support"],
        playbook: "No Internet",
    },
    "Motherboard / Hardware": {
        issue: "Hardware Fault or Component Seating Issue",
        confidence: 74,
        severity: "High",
        rootCause:
            "A component is not properly seated, a power connector is loose, or a hardware part such as RAM or storage has failed or is not detected.",
        fix: "Power off, apply ESD precautions, visually inspect and reseat RAM and cables, then boot and verify hardware in BIOS.",
        steps: [
            "Power off the system and unplug the power cable from the wall",
            "Use an ESD strap or ground yourself before touching components",
            "Visually inspect the board for swollen capacitors or burn marks",
            "Remove and reseat RAM modules firmly one at a time",
            "Verify all power connectors are secure: ATX 24-pin, CPU 8-pin, and SATA",
            "Check storage cables for both SATA data and power connections",
            "Power on and enter BIOS to verify all components are detected",
            "Boot into Windows and run: wmic memorychip get capacity,speed",
        ],
        commands: ["systeminfo", "wmic memorychip get capacity,speed", "chkdsk C: /scan"],
        relatedErrors: ["No POST", "Beep Codes", "BSOD", "Missing Storage"],
        vendors: ["Dell Support", "HP Support", "Lenovo Support"],
        playbook: "Hardware Fault",
    },
    "Packet Tracer Lab": {
        issue: "Packet Tracer Connectivity Failure",
        confidence: 88,
        severity: "Medium",
        rootCause:
            "A PC is missing a default gateway, a switch port is in the wrong VLAN, or a router interface is administratively shut down in the topology.",
        fix: "Verify the PC default gateway, VLAN assignment on the switchport, and router interface state. Test with ping after corrections.",
        steps: [
            "Click the PC in Packet Tracer and open Desktop then IP Configuration",
            "Verify the IP address, subnet mask, and default gateway are correct",
            "Check the switchport config: show running-config interface fa0/X",
            "Verify the correct access VLAN is assigned to the port",
            "Check the router interface: show ip interface brief",
            "Bring up any shutdown interface with: no shutdown",
            "Configure an SVI or router-on-a-stick for inter-VLAN routing if needed",
            "Test with ping from the PC to its gateway and to a remote network",
        ],
        commands: ["show ip interface brief", "show vlan brief", "ping <gateway>"],
        relatedErrors: ["Missing Gateway", "169.254.x.x", "Request Timed Out"],
        vendors: ["Cisco Support", "Cisco NetAcad"],
        playbook: "DHCP / Gateway Failure",
    },
    "Other": {
        issue: "General Technology Issue Detected",
        confidence: 55,
        severity: "Low",
        rootCause:
            "The image content requires manual review. Additional context including error text, device model, and LED state is needed for an accurate diagnosis.",
        fix: "Identify the exact device model and error message, capture diagnostic evidence, and run relevant commands based on the symptom.",
        steps: [
            "Identify the device manufacturer and model number from a label or settings",
            "Record any error codes or messages exactly as displayed",
            "Check power status and all physical connections",
            "Run ipconfig /all to capture the current network state",
            "Open Event Viewer and check for recent critical errors",
            "Search the exact error code in vendor documentation",
            "Document the symptom, evidence gathered, and all steps taken",
        ],
        commands: ["systeminfo", "ipconfig /all", "ping 8.8.8.8"],
        relatedErrors: ["Unknown"],
        vendors: ["Vendor Resources"],
        playbook: "General Troubleshooting",
    },
};

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function AIVision({ data }) {
    const navigate = useNavigate();
    const dropZoneRef = useRef(null);

    const [image, setImage] = useState(null);
    const [category, setCategory] = useState("Windows Error");
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [recentScans, setRecentScans] = useState([]);
    const [reportSaved, setReportSaved] = useState(false);

    const analysis = MOCK_AI[category] || MOCK_AI["Other"];

    useEffect(() => {
        function handlePaste(event) {
            const items = event.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) loadImage(file);
                    break;
                }
            }
        }
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [category]);

    function loadImage(file) {
        const url = URL.createObjectURL(file);
        const name = file.name || "pasted-screenshot.png";
        setImage({ url, name });
        setAnalyzed(false);
        setAnalyzing(true);
        setReportSaved(false);
        setTimeout(() => {
            setAnalyzing(false);
            setAnalyzed(true);
            const current_analysis = MOCK_AI[category] || MOCK_AI["Other"];
            setRecentScans((prev) =>
                [
                    {
                        id: createId("scan"),
                        name,
                        url,
                        category,
                        date: new Date().toLocaleDateString(),
                        confidence: current_analysis.confidence,
                        severity: current_analysis.severity,
                    },
                    ...prev,
                ].slice(0, 6),
            );
        }, 1400);
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (file) loadImage(file);
        event.target.value = "";
    }

    function handleDrop(event) {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) loadImage(file);
    }

    function handleDragOver(event) {
        event.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave(event) {
        if (!dropZoneRef.current?.contains(event.relatedTarget)) {
            setDragOver(false);
        }
    }

    async function pasteScreenshot() {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const type = item.types.find((t) => t.startsWith("image/"));
                if (type) {
                    const blob = await item.getType(type);
                    loadImage(new File([blob], "pasted-screenshot.png", { type }));
                    return;
                }
            }
            alert("No image found in clipboard. Copy a screenshot first, then click Paste Screenshot.");
        } catch {
            alert(
                "Clipboard access not available in this browser. Use Ctrl+V anywhere on this page to paste a screenshot instead.",
            );
        }
    }

    function clearImage() {
        setImage(null);
        setAnalyzed(false);
        setAnalyzing(false);
        setReportSaved(false);
    }

    function generateReport() {
        const report = {
            id: createId("vision-report"),
            client: "AI Vision Case",
            asset: category,
            issue: analysis.issue,
            diagnosis: analysis.rootCause,
            fix: analysis.fix,
            status: "Open",
            date: new Date().toISOString().slice(0, 10),
        };
        data.setReports((current) => [report, ...current]);
        setReportSaved(true);
        navigate("/repair-reports");
    }

    return (
        <main className="page vision-page">
            <section className="vision-hero">
                <div className="vision-hero-content">
                    <p className="eyebrow">AI Vision — Flagship</p>
                    <h1>Instant visual diagnostics for any tech issue</h1>
                    <p>
                        Upload a screenshot, device photo, or paste an image. TechMate AI returns a full
                        diagnostic report with root cause, repair guide, and technician commands in seconds.
                    </p>
                </div>
                <div className="vision-hero-stats">
                    <div className="vision-stat">
                        <strong>9</strong>
                        <span>Device categories</span>
                    </div>
                    <div className="vision-stat">
                        <strong>90%</strong>
                        <span>Max confidence</span>
                    </div>
                    <div className="vision-stat">
                        <strong>{"<"}2s</strong>
                        <span>Analysis time</span>
                    </div>
                </div>
            </section>

            <section className="vision-safety">
                AI Vision results are diagnostic guidance only. Always verify model number, error code,
                cables, power state, and official vendor documentation before making changes.
            </section>

            <section className="vision-category-strip">
                <p className="strip-label">What does this image show?</p>
                <div className="vision-category-grid">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={category === cat ? "cat-btn active" : "cat-btn"}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            <section
                className={`vision-drop-zone${dragOver ? " drag-active" : ""}${image ? " has-image" : ""}`}
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {image ? (
                    <div className="vision-image-preview">
                        <img src={image.url} alt="Uploaded diagnostic" />
                        <div className="preview-meta">
                            <span className="preview-filename">{image.name}</span>
                            <button type="button" className="preview-clear-btn" onClick={clearImage}>
                                Clear
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="drop-prompt">
                        <div className="drop-icon-wrap">
                            <svg
                                width="52"
                                height="52"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                        </div>
                        <strong>Drop your screenshot or device photo here</strong>
                        <span>Supports JPG, PNG, WebP — or paste directly with Ctrl+V</span>
                    </div>
                )}
            </section>

            <div className="vision-upload-actions">
                <label className="vision-upload-btn primary-upload">
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Screenshot
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>

                <label className="vision-upload-btn">
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                    >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    Upload Device Photo
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
                </label>

                <button type="button" className="vision-upload-btn" onClick={pasteScreenshot}>
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                    >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Paste Screenshot
                </button>

                {image && (
                    <button type="button" className="vision-upload-btn clear-action" onClick={clearImage}>
                        Clear Image
                    </button>
                )}
            </div>

            {analyzing && (
                <section className="vision-analyzing">
                    <span className="analyzing-dot" />
                    <span className="analyzing-dot" />
                    <span className="analyzing-dot" />
                    <div className="analyzing-text">
                        <strong>TechMate AI is analyzing your image</strong>
                        <span>Running diagnostic pattern matching for {category}…</span>
                    </div>
                </section>
            )}

            {analyzed && (
                <section className="vision-console">
                    <div className="analysis-panel">
                        <header className="analysis-panel-header">
                            <p className="eyebrow">AI Analysis</p>
                            <h2>{analysis.issue}</h2>
                        </header>

                        <div className="analysis-metrics-row">
                            <div className="analysis-metric-card">
                                <span className="metric-label">Confidence Score</span>
                                <div className="confidence-wrap">
                                    <div className="confidence-track">
                                        <div
                                            className="confidence-fill"
                                            style={{ width: `${analysis.confidence}%` }}
                                        />
                                    </div>
                                    <strong className="confidence-value">{analysis.confidence}%</strong>
                                </div>
                            </div>
                            <div className="analysis-metric-card">
                                <span className="metric-label">Severity Level</span>
                                <span className={`severity-pill ${analysis.severity.toLowerCase()}`}>
                                    {analysis.severity}
                                </span>
                            </div>
                            <div className="analysis-metric-card">
                                <span className="metric-label">Category</span>
                                <span className="category-pill">{category}</span>
                            </div>
                        </div>

                        <div className="analysis-block">
                            <h3>Issue Detected</h3>
                            <p>{analysis.issue}</p>
                        </div>

                        <div className="analysis-block">
                            <h3>Root Cause</h3>
                            <p>{analysis.rootCause}</p>
                        </div>

                        <div className="analysis-block">
                            <h3>Recommended Fix</h3>
                            <p>{analysis.fix}</p>
                        </div>

                        <div className="analysis-related-row">
                            <div className="related-item">
                                <span className="related-label">Playbook</span>
                                <span>{analysis.playbook}</span>
                            </div>
                            <div className="related-item">
                                <span className="related-label">Related Errors</span>
                                <span>{analysis.relatedErrors.join(", ")}</span>
                            </div>
                            <div className="related-item">
                                <span className="related-label">Vendors</span>
                                <span>{analysis.vendors.join(", ")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="repair-guide-panel">
                        <header className="repair-guide-header">
                            <p className="eyebrow">Repair Guide</p>
                            <h2>Step-by-step fix</h2>
                        </header>

                        <ol className="repair-steps">
                            {analysis.steps.map((step, index) => (
                                <li key={index} className="repair-step">
                                    <span className="step-num">{index + 1}</span>
                                    <span className="step-text">{step}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="repair-commands">
                            <h3>Diagnostic Commands</h3>
                            <div className="command-chips">
                                {analysis.commands.map((cmd) => (
                                    <button
                                        key={cmd}
                                        type="button"
                                        className="command-chip"
                                        onClick={() => navigator.clipboard?.writeText(cmd)}
                                        title="Click to copy"
                                    >
                                        {cmd}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="generate-report-btn primary-btn"
                            onClick={generateReport}
                        >
                            {reportSaved ? "Report Saved — View Reports" : "Generate Technician Report"}
                        </button>
                    </div>
                </section>
            )}

            {recentScans.length > 0 && (
                <section className="vision-recent">
                    <div className="recent-header">
                        <h2>Recent Scans</h2>
                        <p>Click any scan to reload it for analysis.</p>
                    </div>
                    <div className="recent-scans-grid">
                        {recentScans.map((scan) => (
                            <button
                                key={scan.id}
                                type="button"
                                className="recent-scan-card"
                                onClick={() => {
                                    setImage({ url: scan.url, name: scan.name });
                                    setCategory(scan.category);
                                    setAnalyzed(true);
                                    setAnalyzing(false);
                                }}
                            >
                                <div className="scan-thumb">
                                    <img src={scan.url} alt={scan.name} />
                                </div>
                                <div className="scan-info">
                                    <strong>{scan.name}</strong>
                                    <span>{scan.category}</span>
                                    <div className="scan-meta-row">
                                        <span className={`severity-pill ${scan.severity.toLowerCase()}`}>
                                            {scan.severity}
                                        </span>
                                        <small>{scan.date}</small>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

export default AIVision;
