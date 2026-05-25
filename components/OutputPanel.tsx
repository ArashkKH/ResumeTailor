'use client';
import { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { TailorResult, Change } from '@/lib/types';

interface Props {
  result: TailorResult | null;
  loading: boolean;
  error: string;
}

function LoadingDots() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        bgcolor: '#0f0f0f',
        border: '1px solid #2a2a2a',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              animation: 'rt-bounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes rt-bounce': {
                '0%,80%,100%': { transform: 'translateY(0)', opacity: 0.4 },
                '40%': { transform: 'translateY(-5px)', opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 11, color: 'text.secondary' }}>
        Analyzing resume and job description…
      </Typography>
    </Box>
  );
}

function SectionCard({ section, changes }: { section: string; changes: Change[] }) {
  const rewrites = changes.filter(c => c.action === 'rewrite');
  const tweaks = changes.filter(c => c.action === 'tweak');
  const nonKept = changes.filter(c => c.action !== 'keep');

  let badgeLabel = '✓ KEPT';
  let badgeColor: 'primary' | 'warning' | 'secondary' = 'secondary';
  if (rewrites.length) {
    badgeLabel = `↻ ${rewrites.length} REWRITTEN`;
    badgeColor = 'primary';
  } else if (tweaks.length) {
    badgeLabel = `~ ${tweaks.length} TWEAKED`;
    badgeColor = 'warning';
  }

  return (
    <Box
      sx={{
        bgcolor: '#0f0f0f',
        border: '1px solid #2a2a2a',
        borderRadius: 2,
        mb: 1.5,
        overflow: 'hidden',
        animation: 'rt-fadeup .25s ease',
        '@keyframes rt-fadeup': {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          px: 1.75,
          py: 1.25,
          bgcolor: '#1f1f1f',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            color: 'primary.main',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {section}
        </Typography>
        <Chip
          label={badgeLabel}
          color={badgeColor}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: 9 }}
        />
      </Box>

      {/* Card body */}
      <Box sx={{ px: 1.75, py: 1.5 }}>
        {nonKept.length === 0 ? (
          <Typography sx={{ fontSize: 11, color: '#3a3a3a', fontStyle: 'italic' }}>
            No changes needed — already well-matched to this role.
          </Typography>
        ) : (
          nonKept.map((c, i) => (
            <Box key={c.para_idx}>
              {i > 0 && <Box sx={{ borderTop: '1px solid #2a2a2a', my: 1.5 }} />}

              <Typography
                sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 9, color: '#555', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}
              >
                Para #{c.para_idx} · Original
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  mb: 1,
                  color: c.action === 'rewrite' ? '#444' : 'text.secondary',
                  textDecoration: c.action === 'rewrite' ? 'line-through' : 'none',
                  textDecorationColor: '#333',
                }}
              >
                {c.original_text}
              </Typography>

              <Typography
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 9,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  mb: 0.5,
                  color: c.action === 'rewrite' ? 'primary.main' : 'warning.main',
                }}
              >
                Tailored
              </Typography>
              <Typography sx={{ fontSize: 12, lineHeight: 1.65, color: '#d4d4d0', whiteSpace: 'pre-wrap', mb: 1 }}>
                {c.new_text}
              </Typography>

              <Typography sx={{ fontSize: 11, color: '#666', lineHeight: 1.6, fontStyle: 'italic' }}>
                💬 {c.reasoning}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default function OutputPanel({ result, loading, error }: Props) {
  const sections = useMemo(() => {
    if (!result) return [];
    const map: Record<string, Change[]> = {};
    const order: string[] = [];
    for (const c of result.changes) {
      if (!map[c.section]) { map[c.section] = []; order.push(c.section); }
      map[c.section].push(c);
    }
    return order.map(name => ({ name, changes: map[name] }));
  }, [result]);

  if (loading) return <LoadingDots />;

  if (error) {
    return (
      <Box sx={{ bgcolor: '#0f0f0f', border: '1px solid', borderColor: 'error.main', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 1.75, py: 1.25, bgcolor: '#1f1f1f', borderBottom: '1px solid #2a2a2a' }}>
          <Typography sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: 'error.main', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Error
          </Typography>
        </Box>
        <Box sx={{ px: 1.75, py: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: '#d4d4d0' }}>{error}</Typography>
        </Box>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 1.5,
          color: 'text.secondary',
          textAlign: 'center',
          px: 5,
          py: 6,
        }}
      >
        <Typography sx={{ fontSize: 36, opacity: 0.18, lineHeight: 1 }}>◈</Typography>
        <Typography sx={{ fontSize: 13, lineHeight: 1.7, maxWidth: 300 }}>
          Upload your base <strong style={{ color: '#efefed' }}>.docx</strong> and paste a job
          description.
          <br />
          <br />
          The app reads your resume&apos;s structure, tailors the text to the role, and hands back
          a <strong style={{ color: '#efefed' }}>.docx with your exact layout intact</strong> —
          fonts, spacing, columns, everything.
        </Typography>
      </Box>
    );
  }

  const rw = result.changes.filter(c => c.action === 'rewrite').length;
  const tw = result.changes.filter(c => c.action === 'tweak').length;
  const kp = result.changes.filter(c => c.action === 'keep').length;

  return (
    <Box>
      {/* Summary bar */}
      <Box
        sx={{
          mb: 2,
          px: 1.75,
          py: 1.25,
          bgcolor: 'rgba(200,240,74,0.05)',
          border: '1px solid rgba(200,240,74,0.12)',
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', mb: 1 }}
        >
          Tailoring for ·{' '}
          <span style={{ color: '#c8f04a' }}>{result.job_title}</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2.5 }}>
          {[
            { n: rw, label: 'Rewritten', color: '#c8f04a' },
            { n: tw, label: 'Tweaked', color: '#f0b44a' },
            { n: kp, label: 'Kept', color: '#4af0b8' },
          ].map(({ n, label, color }) => (
            <Box key={label}>
              <Typography sx={{ fontFamily: 'var(--font-dm-serif), serif', fontSize: 22, color, lineHeight: 1.1 }}>
                {n}
              </Typography>
              <Typography sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Section cards */}
      {sections.map(({ name, changes }) => (
        <SectionCard key={name} section={name} changes={changes} />
      ))}

      {/* Keywords woven in */}
      {result.keywords_added?.length > 0 && (
        <Box sx={{ bgcolor: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 2, mb: 1.5, overflow: 'hidden' }}>
          <Box sx={{ px: 1.75, py: 1.25, bgcolor: '#1f1f1f', borderBottom: '1px solid #2a2a2a' }}>
            <Typography sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: 'primary.main', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Keywords Woven In
            </Typography>
          </Box>
          <Box sx={{ px: 1.75, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {result.keywords_added.map(k => (
              <Chip key={k} label={k} size="small" variant="outlined" color="secondary" />
            ))}
          </Box>
        </Box>
      )}

      {/* Application tip */}
      {result.overall_tip && (
        <Box
          sx={{
            bgcolor: '#0f0f0f',
            border: '1px solid rgba(74,240,184,0.2)',
            borderRadius: 2,
            mb: 1.5,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 1.75, py: 1.25, bgcolor: 'rgba(74,240,184,0.04)', borderBottom: '1px solid rgba(74,240,184,0.2)' }}>
            <Typography sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10, color: 'secondary.main', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Application Tip
            </Typography>
          </Box>
          <Box sx={{ px: 1.75, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, lineHeight: 1.65, color: '#d4d4d0' }}>
              {result.overall_tip}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
