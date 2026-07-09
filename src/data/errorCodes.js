import ciscoErrors from "./errorcodes/cisco.json";
import printerErrors from "./errorcodes/printer.json";
import windowsErrors from "./errorcodes/windows.json";

const withSystem = (system, errors) =>
  errors.map((error) => ({
    severity: "Medium",
    system,
    ...error,
  }));

export const errorCodes = [
  ...withSystem("Windows", windowsErrors),
  ...withSystem("Printer", printerErrors),
  ...withSystem("Cisco", ciscoErrors),
  {
    code: "DNS_PROBE_FINISHED_NXDOMAIN",
    system: "Network",
    title: "DNS Name Resolution Failure",
    severity: "High",
    cause:
      "The client cannot resolve the requested hostname through the configured DNS servers.",
    fixes: [
      "Verify the DNS server address and gateway.",
      "Flush the DNS cache and retry lookup.",
      "Check domain records, DHCP scope options, and firewall rules.",
    ],
  },
];
