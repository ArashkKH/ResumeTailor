'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { saveAs } from 'file-saver';
import ApiKeyDialog from '@/components/ApiKeyDialog';
import DropZone from '@/components/DropZone';
import OutputPanel from '@/components/OutputPanel';
import { applyChanges } from '@/lib/docx';
import type { ParsedParagraph, TailorResult, StatusState } from '@/lib/types';

const STORAGE_KEY = 'rt_anthropic_key';

export default function HomePage() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyOpen, setApiKeyOpen] = useState(false);

  const [docxBytes, setDocxBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [parsedParas, setParsedParas] = useState<ParsedParagraph[]>([]);
  const [jd, setJd] = useState('');

  const [status, setStatus] = useState<StatusState>('idle');
  const [statusText, setStatusText] = useState('Ready');
  const [result, setResult] = useState<TailorResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  const handleFileLoaded = useCallback(
    (bytes: ArrayBuffer, name: string, paras: ParsedParagraph[]) => {
      setDocxBytes(bytes);
      setFileName(name);
      setParsedParas(paras);
      setResult(null);
      setError('');
      setStatus('idle');
      setStatusText(`Loaded: ${name} · ${paras.length} paragraphs`);
    },
    []
  );

  const canTailor = !!docxBytes && !!jd.trim();

  async function tailor() {
    if (!canTailor || status === 'loading') return;
    if (!apiKey.trim()) {
      setApiKeyOpen(true);
      return;
    }

    setStatus('loading');
    setStatusText('Analyzing resume and job description…');
    setResult(null);
    setError('');

    const resumeText = parsedParas
      .filter(p => !p.isEmpty)
      .map(p => `[PARA ${p.idx}][STYLE:${p.style}] ${p.text}`)
      .join('\n');

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, resumeText, jobDescription: jd }),
      });
      const data = (await res.json()) as TailorResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
      setStatus('success');
      const updated = data.changes.filter(c => c.action !== 'keep').length;
      setStatusText(`Done · ${updated} paragraphs updated`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setStatus('error');
      setStatusText('Error — see output panel');
    }
  }

  async function downloadDocx() {
    if (!result || !docxBytes) return;
    setStatusText('Generating tailored .docx…');
    try {
      const blob = await applyChanges(docxBytes, result.changes);
      const outName = fileName.replace(
        /\.docx$/i,
        `_${result.job_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`
      );
      saveAs(blob, outName);
      setStatusText(`Downloaded: ${outName}`);
    } catch (e) {
      setStatusText('Download failed: ' + (e instanceof Error ? e.message : 'Unknown'));
    }
  }

  const dotColor =
    status === 'loading'
      ? '#c8f04a'
      : status === 'success'
      ? '#4af0b8'
      : status === 'error'
      ? '#f04a4a'
      : '#444';

  const step1Active = !!docxBytes;
  const step2Active = !!jd.trim();
  const step3Active = !!result;

  function StepBadge({ n, active }: { n: number; active: boolean }) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: active ? 'primary.main' : '#2a2a2a',
          color: active ? '#0f0f0f' : '#555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
      >
        {n}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── AppBar ── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56, px: '18px !important', gap: 1.5 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-dm-serif), serif',
              fontSize: 22,
              letterSpacing: '-0.5px',
              lineHeight: 1,
              flexGrow: 1,
              color: 'text.primary',
            }}
          >
            Resume Tailor
          </Typography>

          <Box
            sx={{
              px: 1,
              py: 0.3,
              bgcolor: 'rgba(200,240,74,0.07)',
              border: '1px solid rgba(200,240,74,0.18)',
              borderRadius: 0.75,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 10,
                color: 'primary.main',
                letterSpacing: 1,
              }}
            >
              DOCX · LAYOUT PRESERVED
            </Typography>
          </Box>

          <Tooltip title={apiKey ? 'API key saved — click to update' : 'Set your Anthropic API key'}>
            <IconButton
              size="small"
              onClick={() => setApiKeyOpen(true)}
              sx={{
                color: apiKey ? 'primary.main' : '#555',
                border: '1px solid',
                borderColor: apiKey ? 'rgba(200,240,74,0.3)' : '#2a2a2a',
                width: 32,
                height: 32,
                transition: 'all 0.2s',
              }}
            >
              <KeyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Main layout ── */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '380px 1fr' },
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* ─── Sidebar ─── */}
        <Box
          component="aside"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: { md: '1px solid #2a2a2a' },
            overflow: 'hidden',
          }}
        >
          {/* Step 1 header */}
          <Box
            sx={{
              px: 2.25,
              py: 1.5,
              borderBottom: '1px solid #2a2a2a',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            <StepBadge n={1} active={step1Active} />
            <Typography
              sx={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 10,
                letterSpacing: '1.5px',
                color: 'text.secondary',
                textTransform: 'uppercase',
              }}
            >
              Base Resume (.docx)
            </Typography>
          </Box>

          <DropZone
            fileName={fileName}
            paraCount={parsedParas.filter(p => !p.isEmpty).length}
            onLoaded={handleFileLoaded}
          />

          {/* Step 2 header */}
          <Box
            sx={{
              px: 2.25,
              py: 1.5,
              borderTop: '1px solid #2a2a2a',
              borderBottom: '1px solid #2a2a2a',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StepBadge n={2} active={step2Active} />
              <Typography
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Job Description
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setJd('')}
              sx={{
                color: 'text.secondary',
                fontSize: 11,
                minWidth: 0,
                px: 1,
                py: 0.4,
                bgcolor: '#1f1f1f',
                border: '1px solid #2a2a2a',
                '&:hover': { color: 'text.primary', bgcolor: '#282828' },
              }}
            >
              Clear
            </Button>
          </Box>

          {/* Job description textarea */}
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here — role title, responsibilities, required skills, tech stack, company context. More detail = better tailoring."
              style={{
                width: '100%',
                height: '100%',
                minHeight: 200,
                background: '#171717',
                border: 'none',
                color: '#efefed',
                fontFamily: 'var(--font-dm-mono), "DM Mono", monospace',
                fontSize: 12,
                lineHeight: 1.7,
                padding: '16px 18px',
                resize: 'none',
                outline: 'none',
                display: 'block',
              }}
            />
          </Box>

          {/* Action area */}
          <Box
            sx={{ p: 2, borderTop: '1px solid #2a2a2a', bgcolor: 'background.default', flexShrink: 0 }}
          >
            {!apiKey && (
              <Typography
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 10,
                  color: '#555',
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                ⚠ Set your Anthropic API key first (key icon ↑)
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={tailor}
              disabled={!canTailor || status === 'loading'}
              startIcon={<AutoFixHighIcon />}
              sx={{ fontSize: 14, py: 1.4 }}
            >
              {status === 'loading' ? 'Tailoring…' : '✦ Tailor My Resume'}
            </Button>
          </Box>
        </Box>

        {/* ─── Output column ─── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Output header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: '1px solid #2a2a2a',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: step3Active ? 'secondary.main' : '#2a2a2a',
                  color: step3Active ? '#0f0f0f' : '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 10,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                3
              </Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 10,
                  letterSpacing: '1.5px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                }}
              >
                Tailored Output
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadDocx}
              disabled={!result}
              sx={{
                opacity: result ? 1 : 0.35,
                pointerEvents: result ? 'auto' : 'none',
                transition: 'all 0.2s',
                '&:not(:disabled):hover': { transform: 'translateY(-1px)' },
              }}
            >
              Download .docx
            </Button>
          </Box>

          {/* Scrollable output */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2.5,
              bgcolor: 'background.paper',
              minHeight: 0,
            }}
          >
            <OutputPanel result={result} loading={status === 'loading'} error={error} />
          </Box>

          {/* Status bar */}
          <Box
            sx={{
              px: 2.5,
              py: 1.25,
              borderTop: '1px solid #2a2a2a',
              bgcolor: 'background.default',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: dotColor,
                flexShrink: 0,
                transition: 'background-color 0.3s',
                ...(status === 'loading' && {
                  animation: 'rt-pulse 1s infinite',
                  '@keyframes rt-pulse': {
                    '0%,100%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                  },
                }),
              }}
            />
            <Typography
              sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 12, color: 'text.secondary' }}
            >
              {statusText}
            </Typography>
          </Box>
        </Box>
      </Box>

      <ApiKeyDialog
        open={apiKeyOpen}
        currentKey={apiKey}
        onSave={setApiKey}
        onClose={() => setApiKeyOpen(false)}
      />
    </Box>
  );
}
