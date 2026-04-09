import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils/aiConfig', () => ({
  getAIRewriteEndpoint: vi.fn(),
}));

import { getAIRewriteEndpoint } from '../utils/aiConfig';
import { fallbackRewrite, rewriteTextWithAI } from '../utils/rewriteWithAI';

describe('rewriteWithAI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses built-in rewriting when no endpoint is configured', async () => {
    getAIRewriteEndpoint.mockReturnValue('');

    await expect(rewriteTextWithAI('worked on dashboard cleanup', { scope: 'bullets' }))
      .resolves.toBe('Led dashboard cleanup.');
  });

  it('returns endpoint output when the network rewrite succeeds', async () => {
    getAIRewriteEndpoint.mockReturnValue('https://example.com/rewrite');
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ text: 'Sharper summary.' }),
    });

    const result = await rewriteTextWithAI('old summary', { scope: 'summary' });

    expect(result).toBe('Sharper summary.');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back when the endpoint returns an invalid payload', async () => {
    getAIRewriteEndpoint.mockReturnValue('https://example.com/rewrite');
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('bad json')),
    });

    const result = await rewriteTextWithAI('created workflow docs', { scope: 'bullets' });

    expect(result).toBe(fallbackRewrite('created workflow docs', 'bullets'));
  });

  it('falls back when the endpoint times out', async () => {
    vi.useFakeTimers();
    getAIRewriteEndpoint.mockReturnValue('https://example.com/rewrite');
    globalThis.fetch.mockImplementation((_url, options) => new Promise((_, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));

    const promise = rewriteTextWithAI('used analytics tooling', { scope: 'bullets' });
    await vi.advanceTimersByTimeAsync(12000);

    await expect(promise).resolves.toBe(fallbackRewrite('used analytics tooling', 'bullets'));
  });
});
