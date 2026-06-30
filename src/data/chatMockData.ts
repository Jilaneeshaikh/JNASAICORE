import { Conversation, PromptTemplate, ChatSettings } from '../types/chat';

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'chat-1',
    title: 'Cloud Run Auto-Scaling Schema Fix',
    createdAt: '2026-06-29T09:12:00-07:00',
    updatedAt: '2026-06-29T11:45:00-07:00',
    favorite: true,
    pinned: true,
    category: 'Engineering',
    project: 'Enterprise JNAS Shell',
    workspace: 'engineering',
    tags: ['database', 'cloud-run', 'schema-auto-heal'],
    status: 'active',
    messages: [
      {
        id: 'msg-1',
        role: 'system',
        content: 'System Initialized. Clearance authorized for Operator: Chief Developer. Core telemetry monitoring connected. Safety limits loaded: STRICT.',
        timestamp: '11:40 AM',
        status: 'done'
      },
      {
        id: 'msg-2',
        role: 'user',
        content: 'The Drizzle schema is throwing a constraint failure on auto-healing when scale exceeds 10 containers. Can you audit our setup?',
        timestamp: '11:41 AM',
        status: 'done',
        attachments: [
          { id: 'att-1', name: 'schema-drizzle.ts', type: 'md', size: '12.4 KB' },
          { id: 'att-2', name: 'container-logs.zip', type: 'zip', size: '2.8 MB' }
        ]
      },
      {
        id: 'msg-3',
        role: 'assistant',
        content: 'I have analyzed the schema file and container logs. The issue is due to sequential transaction locks being triggered under simultaneous database migrations across auto-scaling instances. Let me execute a simulated SQL health check to trace current lock indexes.',
        timestamp: '11:42 AM',
        status: 'done'
      },
      {
        id: 'msg-4',
        role: 'tool',
        toolName: 'cloudsql_schema_trace',
        content: 'Successfully executed schema-lock tracer.\nFound [1] active deadlock on index constraint "jnas_workspace_unique_idx".\nLock hold time: 182 ms.',
        timestamp: '11:42 AM',
        status: 'done'
      },
      {
        id: 'msg-5',
        role: 'assistant',
        content: 'The tracer has successfully pinpointed the deadlock on the `jnas_workspace_unique_idx` index. To resolve this, you must apply a staggered backoff or bypass simultaneous DDL sync calls on container startup.',
        timestamp: '11:43 AM',
        status: 'done'
      },
      {
        id: 'msg-6',
        role: 'user',
        content: 'Let me double check the safety protocol limits.',
        timestamp: '11:44 AM',
        status: 'done'
      },
      {
        id: 'msg-7',
        role: 'assistant',
        content: 'Retrieving security guardrails...',
        timestamp: '11:44 AM',
        status: 'loading'
      },
      {
        id: 'msg-8',
        role: 'assistant',
        content: 'Warning: Running concurrent DDL schema migrations on uncoordinated clusters is highly prone to schema corruption. Please ensure your migration scripts are coordinated.',
        timestamp: '11:45 AM',
        status: 'warning'
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'SSO Passkey Token Handshake Guide',
    createdAt: '2026-06-28T14:20:00-07:00',
    updatedAt: '2026-06-28T16:30:00-07:00',
    favorite: false,
    pinned: true,
    category: 'Programming',
    project: 'IAM Shield',
    workspace: 'personal',
    tags: ['auth', 'passkey', 'oauth'],
    status: 'active',
    messages: [
      {
        id: 'msg-201',
        role: 'user',
        content: 'How do we verify the WebAuthn signature response securely in Node.js?',
        timestamp: '04:25 PM',
        status: 'done'
      },
      {
        id: 'msg-202',
        role: 'assistant',
        content: 'To verify the WebAuthn signature, you need the public key registered during credential creation. Here is the Node.js implementation using `crypto.verify`:\n\n```javascript\nconst crypto = require(\'crypto\');\n\nfunction verifyAssertion(publicKey, clientDataJSON, authenticatorData, signature) {\n  const hash = crypto.createHash(\'sha256\').update(clientDataJSON).digest();\n  const verify = crypto.createVerify(\'SHA256\');\n  verify.update(authenticatorData);\n  verify.update(hash);\n  return verify.verify(publicKey, signature);\n}\n```',
        timestamp: '04:27 PM',
        status: 'done'
      }
    ]
  },
  {
    id: 'chat-3',
    title: 'Sprint 4 CRM Integration Blueprint',
    createdAt: '2026-06-27T10:00:00-07:00',
    updatedAt: '2026-06-27T11:22:00-07:00',
    favorite: true,
    pinned: false,
    category: 'Business',
    project: 'Enterprise CRM Base',
    workspace: 'business',
    tags: ['crm', 'clients', 'blueprint'],
    status: 'active',
    messages: [
      {
        id: 'msg-301',
        role: 'user',
        content: 'Can you summarize the mock client database structures we designed in Sprint 3?',
        timestamp: '11:15 AM',
        status: 'done'
      },
      {
        id: 'msg-302',
        role: 'assistant',
        content: 'Certainly. The CRM schema tracks three key structures:\n1. **Clients Table**: Core details like brand, licensing tier, and active workspace nodes.\n2. **Engagements Log**: Timeline record of all administrative audits.\n3. **Licensing Caps**: Dynamic operational API limits (default 10,000 requests/sec).',
        timestamp: '11:18 AM',
        status: 'done'
      },
      {
        id: 'msg-303',
        role: 'user',
        content: 'Let\'s run a test query draft.',
        timestamp: '11:20 AM',
        status: 'done'
      },
      {
        id: 'msg-304',
        role: 'assistant',
        content: 'Drafting PostgreSQL integration code...',
        timestamp: '11:21 AM',
        status: 'streaming'
      }
    ]
  },
  {
    id: 'chat-4',
    title: 'LMS Academic Certification Syllabus',
    createdAt: '2026-06-25T08:00:00-07:00',
    updatedAt: '2026-06-25T10:15:00-07:00',
    favorite: false,
    pinned: false,
    category: 'Documentation',
    project: 'LMS Train Module',
    workspace: 'learning',
    tags: ['syllabus', 'lms', 'certification'],
    status: 'archived',
    messages: [
      {
        id: 'msg-401',
        role: 'user',
        content: 'Has the curriculum for the Level 3 IAM clearance certification been compiled?',
        timestamp: '10:00 AM',
        status: 'done',
        attachments: [
          { id: 'att-401', name: 'curriculum-draft.xlsx', type: 'xls', size: '240 KB' }
        ]
      },
      {
        id: 'msg-402',
        role: 'assistant',
        content: 'Yes, the Level 3 syllabus is compiled. It consists of three primary modules:\n- **Advanced RBAC Mapping**: Dynamic role creation and workspace boundaries.\n- **Secrets Management**: Dynamic JWT rotation and credential scopes.\n- **Containerized Telemetry Auditing**: Connecting Prometheus/Grafana alerts to kernel logs.',
        timestamp: '10:15 AM',
        status: 'done'
      }
    ]
  }
];

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Audit Drizzle Migrations',
    prompt: 'Analyze this Drizzle schema file and outline potential database lock deadlocks when run concurrently under scaling. List specific index constraints.',
    category: 'Engineering',
    favorite: true
  },
  {
    id: 'tpl-2',
    title: 'OAuth Auth-Code Exchange Node',
    prompt: 'Write an Express.js router handler that handles OAuth 2.0 Auth Code flow securely, including state validation, PKCE, and dynamic JWT generation.',
    category: 'Programming',
    favorite: true
  },
  {
    id: 'tpl-3',
    title: 'CRM Dynamic SLA Check',
    prompt: 'Generate an aggregate PostgreSQL query that maps clients against active licensing usage tiers and flags tenants exceeding 85% of their daily caps.',
    category: 'Business',
    favorite: false
  },
  {
    id: 'tpl-4',
    title: 'LMS Course Plan Structure',
    prompt: 'Draft an interactive course syllabus structure on "Secrets Handshaking" with 4 practical laboratory sessions using mock environment variables.',
    category: 'Documentation',
    favorite: false
  },
  {
    id: 'tpl-5',
    title: 'Platform Packaging Blueprint',
    prompt: 'Analyze this package.json and generate a standardized Dockerfile configured to run production ESM compilation via tsx server.ts with Node 20 alpine.',
    category: 'Packaging',
    favorite: false
  },
  {
    id: 'tpl-6',
    title: 'Personal Workspace Setup script',
    prompt: 'Create a bash script to clone the development sandbox environment, bind .env.example, and verify npm dependencies are fully linked.',
    category: 'Personal',
    favorite: false
  }
];

export const DEFAULT_SETTINGS: ChatSettings = {
  defaultProvider: 'Gemini 2.5 Flash (Standard Hub)',
  temperature: 0.7,
  responseStyle: 'balanced',
  theme: 'dark',
  privacyMode: false,
  maxTokens: 2048,
  safetyLevel: 'block_medium_above',
  streaming: true,
  retryCount: 3,
  timeout: 30000
};
