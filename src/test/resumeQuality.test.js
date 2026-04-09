import { describe, expect, it } from 'vitest';
import { calculateResumeQuality } from '../utils/resumeQuality';

describe('calculateResumeQuality', () => {
  it('returns a low-polish score for sparse resume data', () => {
    const result = calculateResumeQuality({
      name: 'Avery Hart',
      skills: ['SQL'],
      experience: [{ bullets: ['Built report'] }],
    });

    expect(result.label).toBe('Needs polish');
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('returns a strong score for well-rounded resume data', () => {
    const result = calculateResumeQuality({
      name: 'Avery Hart',
      email: 'avery@example.com',
      phone: '1234567890',
      location: 'Seattle, WA',
      summary: 'Product designer with strong systems and execution experience.',
      skills: ['Figma', 'Research', 'Design Systems', 'Prototyping', 'Accessibility', 'Strategy'],
      experience: [
        { bullets: ['Led redesign', 'Improved conversion', 'Built component library'] },
        { bullets: ['Shipped prototypes', 'Partnered with engineering', 'Improved onboarding'] },
      ],
      education: [{ degree: 'B.Des' }],
      certifications: ['UX Certificate'],
      customSections: [{ items: ['Portfolio', 'Awards'] }],
    });

    expect(result.score).toBeGreaterThanOrEqual(72);
    expect(['Strong', 'Excellent']).toContain(result.label);
  });
});
