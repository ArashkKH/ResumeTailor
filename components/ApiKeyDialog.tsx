'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Box,
  Link,
  Radio,
  RadioGroup,
  Chip,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  PROVIDERS,
  DEFAULT_MODELS,
  type ProviderId,
} from '@/lib/providers';

const SK = 'rt_';

interface Props {
  open: boolean;
  provider: ProviderId;
  model: string;
  apiKey: string;
  onSave: (provider: ProviderId, model: string, apiKey: string) => void;
  onClose: () => void;
}

export default function ModelDialog({
  open,
  provider: initProvider,
  model: initModel,
  apiKey: initKey,
  onSave,
  onClose,
}: Props) {
  const [provider, setProvider] = useState<ProviderId>(initProvider);
  const [model, setModel] = useState(initModel);
  const [apiKey, setApiKey] = useState(initKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      setProvider(initProvider);
      setModel(initModel);
      setApiKey(initKey);
      setShowKey(false);
    }
  }, [open, initProvider, initModel, initKey]);

  const providerConfig = PROVIDERS.find(p => p.id === provider)!;

  const handleProviderChange = (newProvider: ProviderId) => {
    setProvider(newProvider);
    setModel(
      localStorage.getItem(`${SK}model_${newProvider}`) ?? DEFAULT_MODELS[newProvider]
    );
    setApiKey(localStorage.getItem(`${SK}key_${newProvider}`) ?? '');
    setShowKey(false);
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    localStorage.setItem(`${SK}provider`, provider);
    localStorage.setItem(`${SK}model_${provider}`, model);
    localStorage.setItem(`${SK}key_${provider}`, trimmed);
    onSave(provider, model, trimmed);
    onClose();
  };

  const freeBadge = (
    <Chip
      label="FREE"
      size="small"
      sx={{
        height: 14,
        fontSize: 9,
        fontFamily: 'var(--font-dm-mono), monospace',
        bgcolor: 'rgba(74,240,184,0.12)',
        color: 'secondary.main',
        borderRadius: 0.5,
        '& .MuiChip-label': { px: 0.6 },
      }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#171717', border: '1px solid #2a2a2a' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <TuneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        AI Model &amp; API Key
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important' }}>
        {/* Provider selection */}
        <Typography
          sx={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            letterSpacing: 1.5,
            color: 'text.secondary',
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          Provider
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          {PROVIDERS.map(p => (
            <Box
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              sx={{
                px: 1.5,
                py: 0.8,
                border: '1px solid',
                borderColor: provider === p.id ? 'primary.main' : '#2a2a2a',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: provider === p.id ? 'rgba(200,240,74,0.07)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                transition: 'all 0.15s',
                '&:hover': { borderColor: provider === p.id ? 'primary.main' : '#444' },
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: 12,
                  color: provider === p.id ? 'primary.main' : 'text.secondary',
                }}
              >
                {p.label}
              </Typography>
              {p.models.some(m => m.free) && freeBadge}
            </Box>
          ))}
        </Box>

        {/* Model selection */}
        <Typography
          sx={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            letterSpacing: 1.5,
            color: 'text.secondary',
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          Model
        </Typography>
        <RadioGroup
          value={model}
          onChange={e => setModel(e.target.value)}
          sx={{ mb: 2.5, gap: 0.75 }}
        >
          {providerConfig.models.map(m => (
            <Box
              key={m.id}
              onClick={() => setModel(m.id)}
              sx={{
                px: 1.5,
                py: 1,
                border: '1px solid',
                borderColor: model === m.id ? 'rgba(200,240,74,0.3)' : '#2a2a2a',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: model === m.id ? 'rgba(200,240,74,0.04)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.15s',
                '&:hover': { borderColor: model === m.id ? 'rgba(200,240,74,0.3)' : '#444' },
              }}
            >
              <Radio
                value={m.id}
                size="small"
                sx={{ p: 0, color: '#444', '&.Mui-checked': { color: 'primary.main' } }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: 12,
                      color: 'text.primary',
                    }}
                  >
                    {m.label}
                  </Typography>
                  {m.free && freeBadge}
                </Box>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                  {m.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </RadioGroup>

        {/* API key */}
        <Typography
          sx={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            letterSpacing: 1.5,
            color: 'text.secondary',
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          API Key
        </Typography>
        <Alert
          severity="info"
          sx={{
            mb: 1.5,
            bgcolor: 'rgba(74,240,184,0.05)',
            border: '1px solid rgba(74,240,184,0.15)',
            color: 'secondary.main',
            '& .MuiAlert-icon': { color: 'secondary.main' },
            fontSize: 11,
          }}
        >
          Stored only in your browser&apos;s <strong>localStorage</strong> — never sent to our
          servers.
        </Alert>
        <TextField
          fullWidth
          label={providerConfig.keyLabel}
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={providerConfig.keyPlaceholder}
          onKeyDown={e => e.key === 'Enter' && apiKey.trim() && handleSave()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowKey(v => !v)} edge="end" size="small">
                  {showKey ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: { fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13 },
          }}
          sx={{ mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          Get your free key at{' '}
          <Link
            href={providerConfig.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary.main"
          >
            {providerConfig.keyUrlLabel}
          </Link>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: '#2a2a2a', color: 'text.secondary', '&:hover': { borderColor: '#444' } }}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!apiKey.trim()}>
          Save &amp; Use
        </Button>
      </DialogActions>
    </Dialog>
  );
}
