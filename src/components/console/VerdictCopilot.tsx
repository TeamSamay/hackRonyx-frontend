import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';

const samplePrompts = [
  'Why is Case TX-92831 assigned CONFLICTING state?',
  'What is the SHAP feature contribution breakdown?',
  'Show traceability metadata for Evidence E003 KYC',
  'Explain how the Deterministic Gate prevents LLM bypass',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function VerdictCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content:
        'Hello Analyst! I am **VERDICT Copilot**, your evidence-grounded intelligence assistant. I analyze multi-source Evidence Objects, ML risk scores (XGBoost + Isolation Forest + SHAP), and Python Deterministic Decision Gate contracts. How can I assist your investigation today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    await new Promise((r) => setTimeout(r, 650));

    let reply = '';
    const query = text.toLowerCase();

    if (query.includes('tx-92831') || query.includes('conflicting')) {
      reply = `**Case TX-92831 Verdict Analysis:**\n\n- **Trust State:** \`CONFLICTING\` → \`HUMAN_REVIEW\`\n- **Fraud Risk (XGBoost):** 91%\n- **Anomaly Score (Isolation Forest):** 84%\n- **Primary Contradiction:** \`CONTRA-LOC-01\` — Core Banking placed the transfer in **Mumbai** (E001, ₹85,000) while Device Telemetry placed the same transfer in **Delhi** (E002) at the identical timestamp.\n- **Gate Enforcement:** The Deterministic Decision Gate blocks auto-approval and routes the case to human audit. LLM reasoning cannot bypass this gate.`;
    } else if (query.includes('shap') || query.includes('feature')) {
      reply = `**SHAP Feature Contribution Analysis (TX-92831):**\n\n1. **Location Mismatch:** \`+0.34\` (Highest positive risk driver)\n2. **Amount Velocity:** \`+0.28\` (₹85,000 high velocity attempt)\n3. **Device Novelty:** \`+0.18\` (New device token in Delhi)\n4. **KYC Affinity:** \`-0.09\` (Verified registered address in Mumbai reduces baseline fraud score)`;
    } else if (query.includes('e003') || query.includes('kyc') || query.includes('traceability')) {
      reply = `**Evidence Object E-003 Traceability Record:**\n\n- **Source System:** KYC_REGISTRY (\`kyc_acc992.png\`)\n- **Traceability File:** \`kyc_acc992.png\` (Page 1)\n- **Claim:** Registered address city = \`Mumbai\`\n- **OCR Confidence:** 96%\n- **Reliability:** \`HIGH\` | **Freshness:** \`RECENT\``;
    } else {
      reply = `**VERDICT Engine Query Response:**\n\nBased on canonical evidence objects in the database:\n- **Decision Gate Rules:** Python gate enforces 6 deterministic trust states (\`SUFFICIENT\`, \`INCOMPLETE\`, \`CONFLICTING\`, \`LOW_QUALITY\`, \`NEED_MORE_INFO\`, \`REFUSE\`).\n- **Active Connectors:** PostgreSQL Core Banking, REST Device Telemetry, KYC File Shares.\n- **Security:** Read-only SQL sanitizer & token hashing active. All evidence is traceable down to source tables and record IDs.`;
    }

    const botMsg: Message = { id: `b-${Date.now()}`, role: 'assistant', content: reply };
    setMessages((prev) => [...prev, botMsg]);
    setThinking(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col p-4 sm:p-6">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-violet-300" />
          <h1 className="text-base font-bold text-frost">VERDICT AI Copilot</h1>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-mono text-violet-200">
            EVIDENCE_GROUNDED
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'accent-gradient text-white font-medium'
                  : 'border border-line/80 bg-card/80 text-frost font-sans shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-line bg-card/60 px-4 py-3 text-xs text-mute font-mono flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 animate-spin text-violet-300" />
              Querying Evidence Objects & Decision Gate rules...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="pt-2 pb-3">
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSend(p)}
              className="rounded-xl border border-line bg-card/40 px-3 py-1.5 text-[11px] text-mute hover:border-violet-400/40 hover:text-frost transition"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 rounded-2xl border border-line bg-card/90 p-2 shadow-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VERDICT Copilot about cases, evidence objects, or decision gate logic..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-frost outline-none placeholder:text-mute"
        />
        <button
          type="submit"
          className="accent-gradient grid h-8 w-8 place-items-center rounded-xl text-white shadow-md hover:opacity-90 active:scale-95 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
