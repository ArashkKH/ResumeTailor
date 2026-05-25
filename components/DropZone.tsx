'use client';
import { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { extractParagraphs } from '@/lib/docx';
import type { ParsedParagraph } from '@/lib/types';

interface Props {
  fileName: string;
  paraCount: number;
  onLoaded: (bytes: ArrayBuffer, name: string, paras: ParsedParagraph[]) => void;
}

export default function DropZone({ fileName, paraCount, onLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const hasFile = !!fileName;

  async function loadFile(file: File) {
    if (!file.name.endsWith('.docx')) {
      setError('Please upload a .docx file.');
      return;
    }
    setError('');
    try {
      const bytes = await file.arrayBuffer();
      const paras = await extractParagraphs(bytes);
      onLoaded(bytes, file.name, paras);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the .docx file.');
    }
  }

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) loadFile(f);
      }}
      sx={{
        mx: 2,
        my: 1.5,
        border: '1.5px dashed',
        borderStyle: hasFile ? 'solid' : 'dashed',
        borderColor: hasFile ? 'secondary.main' : dragging ? 'primary.main' : '#2a2a2a',
        borderRadius: 2,
        px: 2,
        py: 3.5,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        bgcolor: hasFile
          ? 'rgba(74,240,184,0.04)'
          : dragging
          ? 'rgba(200,240,74,0.04)'
          : 'transparent',
        '&:hover': {
          borderColor: hasFile ? 'secondary.main' : 'primary.main',
          bgcolor: hasFile ? 'rgba(74,240,184,0.04)' : 'rgba(200,240,74,0.04)',
        },
        flexShrink: 0,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); e.target.value = ''; }}
      />

      {hasFile ? (
        <CheckCircleIcon sx={{ fontSize: 30, color: 'secondary.main', mb: 1 }} />
      ) : (
        <UploadFileIcon sx={{ fontSize: 30, color: 'text.secondary', mb: 1, opacity: 0.4 }} />
      )}

      <Typography variant="body2" fontWeight={600} mb={0.5}>
        {hasFile ? 'Resume loaded' : 'Drop your .docx here'}
      </Typography>

      <Typography variant="caption" color="text.secondary" display="block">
        {hasFile ? `${paraCount} text paragraphs found` : 'or click to browse'}
      </Typography>

      {hasFile && (
        <Typography
          variant="caption"
          display="block"
          sx={{
            mt: 0.75,
            color: 'secondary.main',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 11,
            wordBreak: 'break-all',
          }}
        >
          {fileName}
        </Typography>
      )}

      {error && (
        <Typography variant="caption" color="error" display="block" mt={1}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
