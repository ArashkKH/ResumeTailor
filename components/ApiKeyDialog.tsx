'use client';
import { useState } from 'react';
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
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const STORAGE_KEY = 'rt_anthropic_key';

interface Props {
  open: boolean;
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyDialog({ open, currentKey, onSave, onClose }: Props) {
  const [value, setValue] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    const trimmed = value.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    onSave(trimmed);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setValue('');
    onSave('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { bgcolor: '#171717', border: '1px solid #2a2a2a' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <KeyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        Anthropic API Key
      </DialogTitle>

      <DialogContent>
        <Alert
          severity="info"
          sx={{
            mb: 2.5,
            bgcolor: 'rgba(74,240,184,0.05)',
            border: '1px solid rgba(74,240,184,0.15)',
            color: 'secondary.main',
            '& .MuiAlert-icon': { color: 'secondary.main' },
          }}
        >
          Your key is saved only in your browser's <strong>localStorage</strong>. It is never
          stored on any server — it is forwarded directly to Anthropic only during a tailor
          request, over HTTPS.
        </Alert>

        <TextField
          fullWidth
          label="API Key"
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="sk-ant-api03-..."
          onKeyDown={e => e.key === 'Enter' && value.trim() && handleSave()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowKey(v => !v)} edge="end" size="small">
                  {showKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { fontFamily: 'var(--font-dm-mono), monospace', fontSize: 13 },
          }}
          sx={{ mb: 1 }}
        />

        <Typography variant="caption" color="text.secondary">
          Get your key at{' '}
          <Link
            href="https://console.anthropic.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary.main"
          >
            console.anthropic.com/keys
          </Link>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {currentKey && (
          <Button color="error" onClick={handleClear} size="small">
            Clear Key
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: '#2a2a2a', color: 'text.secondary', '&:hover': { borderColor: '#444' } }}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!value.trim()}>
          Save Key
        </Button>
      </DialogActions>
    </Dialog>
  );
}
