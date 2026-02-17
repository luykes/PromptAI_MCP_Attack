import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, 'assets');
const RUNTIME_CONFIG_PATH = join(__dirname, '..', 'backend', '.runtime-config.json');

const PORT = parseInt(process.env.PORT || '8787');
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

console.log(`[MCP-SERVER] Starting on port ${PORT} | Security: ${SECURITY_ENABLED ? 'ENABLED' : 'DISABLED'}`);

// Load Prompt Security config from shared runtime config
function getPromptSecurityConfig() {
  try {
    if (existsSync(RUNTIME_CONFIG_PATH)) {
      const config = JSON.parse(readFileSync(RUNTIME_CONFIG_PATH, 'utf8'));
      return {
        apiKey: config.promptSecurityApiKey || '',
        apiUrl: config.promptSecurityApiUrl || 'https://apsouth.prompt.security/api/protect',
        user: config.username || 'anonymous',
      };
    }
  } catch {
    // ignore
  }
  return { apiKey: '', apiUrl: 'https://apsouth.prompt.security/api/protect', user: 'anonymous' };
}

// Call Prompt Security API to scan tool call intent (pre-execution)
async function scanToolCall(toolName, toolArgs) {
  const { apiKey, apiUrl, user } = getPromptSecurityConfig();
  if (!apiKey) {
    return { action: 'allow', reason: 'No API key configured' };
  }

  const prompt = `Tool call: ${toolName}\nArguments: ${JSON.stringify(toolArgs)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APP-ID': apiKey,
      },
      body: JSON.stringify({ prompt, user }),
    });

    if (!response.ok) {
      return { action: 'allow', reason: `Prompt Security API error: ${response.status}` };
    }

    const result = await response.json();
    const promptResult = result?.result?.prompt || {};
    return {
      action: promptResult.action || 'allow',
      reason: promptResult.action === 'block' ? 'Blocked by Prompt Security policy' : '',
      sanitized: promptResult.modified_text,
    };
  } catch (err) {
    return { action: 'allow', reason: `Prompt Security API unreachable: ${err.message}` };
  }
}

// Scan tool output (post-execution)
async function scanToolOutput(toolName, output) {
  const { apiKey, apiUrl, user } = getPromptSecurityConfig();
  if (!apiKey) return { action: 'allow' };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APP-ID': apiKey,
      },
      body: JSON.stringify({ response: output, user }),
    });

    if (!response.ok) return { action: 'allow' };
    const result = await response.json();
    const responseResult = result?.result?.response || {};
    return {
      action: responseResult.action || 'allow',
      sanitized: responseResult.modified_text,
    };
  } catch {
    return { action: 'allow' };
  }
}

// Wrap tool handler with Prompt Security enforcement
async function protectedExecute(toolName, toolArgs, executeFn) {
  if (!SECURITY_ENABLED) {
    const result = await executeFn();
    return { content: [{ type: 'text', text: result }] };
  }

  // Pre-execution scan
  const preCheck = await scanToolCall(toolName, toolArgs);
  if (preCheck.action === 'block') {
    return {
      content: [{
        type: 'text',
        text: `[BLOCKED by Prompt Security] Prompt injection / malicious intent detected.`,
      }],
    };
  }

  // Execute tool
  let output;
  try {
    output = await executeFn();
  } catch (err) {
    output = `Error: ${err.message}`;
  }

  // Post-execution scan
  const postCheck = await scanToolOutput(toolName, output);
  if (postCheck.action === 'block') {
    return {
      content: [{
        type: 'text',
        text: `[OUTPUT BLOCKED by Prompt Security] Secrets / sensitive data detected in tool response.`,
      }],
    };
  }

  // 'modify' means Prompt Security sanitized the output
  const finalOutput = (postCheck.action === 'modify' && postCheck.sanitized) ? postCheck.sanitized : output;
  return { content: [{ type: 'text', text: finalOutput }] };
}

// Factory: create a fresh MCP server per session
function createMcpServer() {
  const server = new McpServer({
    name: 'promptai-vulnerable-server',
    version: '1.0.0',
  });

  // Tool: read_file
  server.tool(
    'read_file',
    'Read a file from the server filesystem',
    { path: z.string().describe('Relative path to file within assets directory') },
    async ({ path: filePath }) => {
      return protectedExecute('read_file', { path: filePath }, async () => {
        const fullPath = join(ASSETS_DIR, filePath);
        if (!existsSync(fullPath)) return `File not found: ${filePath}`;
        return readFileSync(fullPath, 'utf8');
      });
    }
  );

  // Tool: search_docs
  server.tool(
    'search_docs',
    'Search through server documents for a keyword or phrase',
    { query: z.string().describe('Search query to find in documents') },
    async ({ query }) => {
      return protectedExecute('search_docs', { query }, async () => {
        const results = [];
        const files = readdirSync(ASSETS_DIR);
        for (const file of files) {
          try {
            const content = readFileSync(join(ASSETS_DIR, file), 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
              if (line.toLowerCase().includes(query.toLowerCase())) {
                results.push(`[${file}:${i + 1}] ${line.trim()}`);
              }
            });
          } catch {
            // skip unreadable files
          }
        }
        return results.length > 0
          ? `Found ${results.length} matches:\n${results.join('\n')}`
          : `No results found for: ${query}`;
      });
    }
  );

  // Tool: http_fetch
  server.tool(
    'http_fetch',
    'Fetch content from an external URL',
    { url: z.string().describe('URL to fetch') },
    async ({ url }) => {
      return protectedExecute('http_fetch', { url }, async () => {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const text = await response.text();
        return text.slice(0, 2000);
      });
    }
  );

  // Tool: db_export
  server.tool(
    'db_export',
    'Export data from the database',
    { table: z.string().describe('Table name to export (e.g. customers, employees)') },
    async ({ table }) => {
      return protectedExecute('db_export', { table }, async () => {
        const tableMap = {
          customers: 'customers.csv',
          employees: 'customers.csv',
        };
        const file = tableMap[table.toLowerCase()];
        if (!file) return `Unknown table: ${table}. Available: customers, employees`;
        const fullPath = join(ASSETS_DIR, file);
        return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : 'Table not found';
      });
    }
  );

  // Tool: send_email
  server.tool(
    'send_email',
    'Send an email message',
    {
      to: z.string().describe('Recipient email address'),
      subject: z.string().describe('Email subject'),
      body: z.string().describe('Email body content'),
    },
    async ({ to, subject, body }) => {
      return protectedExecute('send_email', { to, subject, body }, async () => {
        console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
        return `Email queued for delivery to ${to} with subject: "${subject}"`;
      });
    }
  );

  // Tool: run_shell
  server.tool(
    'run_shell',
    'Execute a shell command on the server',
    { command: z.string().describe('Shell command to execute') },
    async ({ command }) => {
      return protectedExecute('run_shell', { command }, async () => {
        const blocked = ['rm ', 'rmdir', 'mkfs', 'dd ', 'format', ':(){', 'shutdown', 'reboot'];
        if (blocked.some(b => command.toLowerCase().includes(b))) {
          return `[DEMO SAFETY] Destructive command blocked in demo environment.`;
        }
        try {
          const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
          return stdout || stderr || '(no output)';
        } catch (err) {
          return `Error: ${err.message}`;
        }
      });
    }
  );

  return server;
}

// Express app with session-based transports
const app = express();
app.use(cors());
app.use(express.json());

const transports = new Map();

app.all('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      // New session
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };

      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('[MCP-SERVER] Request error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    security: SECURITY_ENABLED ? 'enabled' : 'disabled',
  });
});

app.listen(PORT, () => {
  console.log(`[MCP-SERVER] Listening on http://localhost:${PORT}/mcp`);
  console.log(`[MCP-SERVER] Security enforcement: ${SECURITY_ENABLED ? 'ON (Prompt Security active)' : 'OFF (vulnerable mode)'}`);
});
