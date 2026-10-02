import test from 'node:test';
import assert from 'node:assert/strict';
import { reply } from '../agent.js';
import { GET } from '../api/greeting.js';
import { localTime } from '../thulani.js';

test('price questions do not invent quote factors or response times', async () => {
  const result = await reply('What would the price be for my parents and two children?', []);
  assert.match(result.text, /can’t confirm a current premium/i);
  assert.match(result.text, /Matla Life advisor/i);
  assert.doesNotMatch(result.text, /ages|where you live|quick quote|will get back/i);
});

test('AI replies drop stock introductions and respect the length backstop', async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  const previousWorkspace = process.env.ANTHROPIC_WORKSPACE_ID;
  const previousFetch = globalThis.fetch;
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_WORKSPACE_ID = 'test-workspace';
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text: "I'd be happy to help. Matla Life offers funeral cover, including a consolidated plan that can bring several policies together for one family. The public site describes main cover from R10,000 to R150,000, but the advisor would need to confirm the policy terms for your situation. You can discuss the options with the team when you are ready, and they can explain what applies to you." }] }) });
  try {
    const result = await reply('Tell me about funeral cover', []);
    assert.doesNotMatch(result.text, /happy to help/i);
    assert.ok(result.text.split(/\s+/).length <= 65);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
    if (previousWorkspace === undefined) delete process.env.ANTHROPIC_WORKSPACE_ID;
    else process.env.ANTHROPIC_WORKSPACE_ID = previousWorkspace;
  }
});

test('demo handoff routes to the temporary published contacts', async () => {
  const previousPhone = process.env.DEMO_WHATSAPP_NUMBER;
  const previousEmail = process.env.DEMO_EMAIL;
  delete process.env.DEMO_WHATSAPP_NUMBER;
  delete process.env.DEMO_EMAIL;
  try {
    const response = await GET();
    const greeting = await response.json();
    assert.equal(greeting.whatsapp, '27602551513');
    assert.equal(greeting.email, 'info@lulidigital.com');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  } finally {
    if (previousPhone === undefined) delete process.env.DEMO_WHATSAPP_NUMBER;
    else process.env.DEMO_WHATSAPP_NUMBER = previousPhone;
    if (previousEmail === undefined) delete process.env.DEMO_EMAIL;
    else process.env.DEMO_EMAIL = previousEmail;
  }
});

test('office hours use South African time', () => {
  assert.equal(localTime(new Date('2026-10-02T07:00:00Z')).open, true);
  assert.equal(localTime(new Date('2026-10-03T07:00:00Z')).open, false);
});

test('stock openers are trimmed without leaving a dangling "but"', async () => {
  const previousKey = process.env.ANTHROPIC_API_KEY;
  const previousWorkspace = process.env.ANTHROPIC_WORKSPACE_ID;
  const previousFetch = globalThis.fetch;
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_WORKSPACE_ID = 'test-workspace';
  const cases = [
    ["I'd be happy to help, but I'm not able to arrange a callback from this chat.", /^I'd be happy to help, but I'm not able/],
    ['Great question! Funeral cover may cover up to 22 family members.', /^Funeral cover may/],
    ["I'd be happy to help, Matla Life offers life cover.", /^Matla Life offers/],
  ];
  try {
    for (const [text, expected] of cases) {
      globalThis.fetch = async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text }] }) });
      const result = await reply('Can someone call me back?', []);
      assert.match(result.text, expected);
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previousKey;
    if (previousWorkspace === undefined) delete process.env.ANTHROPIC_WORKSPACE_ID;
    else process.env.ANTHROPIC_WORKSPACE_ID = previousWorkspace;
  }
});
