import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestAnthropicResumeParse } from '../utils/resumeGeneration';

describe('resumeGeneration', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('parses Anthropic JSON output into an object', async () => {
    globalThis.fetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        content: [{ text: '{"name":"Avery Hart","skills":["SQL"]}' }],
      }),
    });

    const result = await requestAnthropicResumeParse({
      apiKey: 'test-key',
      text: 'Resume body',
      model: 'test-model',
      timeoutMs: 1000,
    });

    expect(result).toEqual({ name: 'Avery Hart', skills: ['SQL'] });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('aborts if the request exceeds the timeout', async () => {
    vi.useFakeTimers();
    globalThis.fetch.mockImplementation((_url, options) => new Promise((_, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));

    const promise = requestAnthropicResumeParse({
      apiKey: 'test-key',
      text: 'Resume body',
      timeoutMs: 50,
    });

    const rejection = expect(promise).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(50);
    await rejection;
  });
});
