export const knowledgeCategories = [
  "All",
  "Help Desk",
  "Windows",
  "Networking",
  "Cisco",
  "Security",
  "Cloud",
  "Linux",
  "Hardware",
  "Packet Tracer",
  "Fiber Optics",
];

export const bookCatalog = [
  {
    title: "A Guide to Computer User Support for Help Desk",
    category: "Help Desk",
    description: "User support, ticket handling, technician communication, and service desk workflow.",
    location: "KnowledgeBase/Books/HelpDesk",
  },
  {
    title: "Windows 10 Troubleshooting",
    category: "Windows",
    description: "Windows startup issues, updates, device errors, system repair, and support procedures.",
    location: "KnowledgeBase/Books/Windows",
  },
  {
    title: "Windows Server 2019 Administration",
    category: "Windows",
    description: "Server roles, administration tasks, PowerShell automation, Active Directory, and repair paths.",
    location: "KnowledgeBase/Books/WindowsServer",
  },
  {
    title: "CompTIA Network+ Guide to Networks",
    category: "Networking",
    description: "Network fundamentals, TCP/IP, cabling, wireless, routing, switching, and troubleshooting.",
    location: "KnowledgeBase/Books/Networking",
  },
  {
    title: "CCNA 200-301 Official Cert Guide",
    category: "Cisco",
    description: "Cisco routing, switching, VLANs, subnetting, command references, and certification labs.",
    location: "KnowledgeBase/Books/Cisco",
  },
  {
    title: "Security+ Guide to Network Security Fundamentals",
    category: "Security",
    description: "Threats, vulnerabilities, hardening, access control, incident response, and security awareness.",
    location: "KnowledgeBase/Books/Security",
  },
  {
    title: "AWS for System Administrators",
    category: "Cloud",
    description: "Cloud administration, secure deployment, automation, and support operations for AWS.",
    location: "KnowledgeBase/Books/AWS",
  },
  {
    title: "Microsoft Azure Fundamentals",
    category: "Cloud",
    description: "Azure basics, identity, networking, virtual machines, security, and cloud support.",
    location: "KnowledgeBase/Books/Azure",
  },
  {
    title: "Mastering Ubuntu Server",
    category: "Linux",
    description: "Linux server administration, services, storage, users, security, and troubleshooting.",
    location: "KnowledgeBase/Books/Linux",
  },
  {
    title: "Fiber Optics Technician's Manual",
    category: "Fiber Optics",
    description: "Fiber basics, testing, connectors, splicing, signal issues, and repair procedures.",
    location: "KnowledgeBase/Books/FiberOptics",
  },
];

export const playbooks = [
  {
    title: "Printer Offline",
    category: "Help Desk",
    sections: ["Symptoms", "Questions to Ask", "Commands to Run", "Possible Causes", "Fix Steps", "Verification", "Repair Notes"],
  },
  {
    title: "DNS Not Working",
    category: "Networking",
    sections: ["Symptoms", "User Scope", "nslookup Checks", "Resolver Settings", "Server Health", "Fix Steps", "Verification"],
  },
  {
    title: "Blue Screen of Death",
    category: "Windows",
    sections: ["Stop Code", "Crash Dump", "Recent Changes", "Driver Checks", "Hardware Checks", "Repair Steps", "Notes"],
  },
  {
    title: "Switch Port Down",
    category: "Cisco",
    sections: ["Interface Status", "Cable Test", "VLAN Check", "Duplex/Speed", "Port Security", "Fix Steps", "Escalation"],
  },
];

export const errorCodeGroups = [
  ["Windows", "Stop codes, update errors, activation issues, event logs"],
  ["Cisco", "Interface, routing, ACL, switch, and Packet Tracer errors"],
  ["HP", "Printer panel codes, fuser errors, feed issues, and maintenance alerts"],
  ["Microsoft 365", "Login, mailbox, SharePoint, Teams, and admin center errors"],
];

export const repairReportTemplates = [
  ["Printer Repair", "Issue, cause, parts checked, fix completed, test print, client notes"],
  ["Network Repair", "Symptoms, affected users, commands run, root cause, fix, verification"],
  ["Server Repair", "Service affected, logs checked, change made, rollback plan, final status"],
];
