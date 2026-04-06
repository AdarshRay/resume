import { describe, expect, it } from 'vitest';
import { analyzeJobFit } from '../utils/ats';

describe('analyzeJobFit', () => {
  it('returns an empty report when no job description is provided', () => {
    expect(analyzeJobFit({}, '')).toEqual({
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: [],
      strengths: [],
      focusAreas: [],
    });
  });

  it('detects matched and missing keywords from resume content buckets', () => {
    const report = analyzeJobFit(
      {
        name: 'Taylor Reed',
        title: 'Data Analyst',
        summary: 'Data analyst focused on SQL dashboards and stakeholder reporting.',
        skills: ['SQL', 'Tableau', 'Reporting'],
        experience: [
          {
            role: 'Analyst',
            company: 'Northstar',
            bullets: ['Built dashboards for finance stakeholders', 'Improved reporting quality'],
          },
        ],
        customSections: [{ title: 'Projects', items: ['Forecasting automation with Python'] }],
      },
      'Seeking a data analyst with SQL, Tableau, Python, dashboards, and forecasting experience.'
    );

    expect(report.score).toBeGreaterThan(0);
    expect(report.matchedKeywords).toEqual(expect.arrayContaining(['sql', 'tableau', 'dashboards']));
    expect(report.missingKeywords).toContain('seeking');
    expect(report.focusAreas.length).toBeGreaterThan(0);
  });
});
