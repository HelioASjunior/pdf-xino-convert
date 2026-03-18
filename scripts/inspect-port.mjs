import { spawnSync } from 'node:child_process';

const requestedPort = process.argv[2] ?? '4173';
const port = Number.parseInt(requestedPort, 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${requestedPort}`);
  process.exit(1);
}

if (process.platform !== 'win32') {
  console.error('This script currently supports Windows only.');
  process.exit(1);
}

const psScript = `
$port = ${port}
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $conn) {
  Write-Output "PORT_FREE:$port"
  exit 0
}
$proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
$procInfo = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $conn.OwningProcess)
$result = [pscustomobject]@{
  port = $port
  localAddress = $conn.LocalAddress
  pid = $conn.OwningProcess
  processName = if ($proc) { $proc.ProcessName } else { $null }
  path = if ($proc) { $proc.Path } else { $null }
  commandLine = if ($procInfo) { $procInfo.CommandLine } else { $null }
}
$result | ConvertTo-Json -Compress
`;

const result = spawnSync('powershell', ['-NoProfile', '-Command', psScript], {
  encoding: 'utf8'
});

if (result.status !== 0) {
  if (result.stderr?.trim()) {
    console.error(result.stderr.trim());
  }
  process.exit(result.status ?? 1);
}

const stdout = result.stdout.trim();

if (stdout.startsWith('PORT_FREE:')) {
  console.log(`Port ${port} is free.`);
  process.exit(0);
}

const details = JSON.parse(stdout);
console.log(`Port ${details.port} is in use.`);
console.log(`PID: ${details.pid}`);
console.log(`Process: ${details.processName ?? 'Unknown'}`);
console.log(`Address: ${details.localAddress ?? 'Unknown'}`);

if (details.path) {
  console.log(`Path: ${details.path}`);
}

if (details.commandLine) {
  console.log(`Command: ${details.commandLine}`);
}