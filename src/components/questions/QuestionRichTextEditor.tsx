import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LinkIcon from '@mui/icons-material/Link'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { colors } from '../../theme'

type FormatAction = 'bold' | 'italic' | 'underline' | 'bullet' | 'number' | 'image' | 'link'
type DialogType = 'image' | 'link' | null

const TOOLBAR_ACTIONS: { action: FormatAction; Icon: typeof FormatBoldIcon; command?: string }[] = [
  { action: 'bold', Icon: FormatBoldIcon, command: 'bold' },
  { action: 'italic', Icon: FormatItalicIcon, command: 'italic' },
  { action: 'underline', Icon: FormatUnderlinedIcon, command: 'underline' },
  { action: 'bullet', Icon: FormatListBulletedIcon, command: 'insertUnorderedList' },
  { action: 'number', Icon: FormatListNumberedIcon, command: 'insertOrderedList' },
  { action: 'image', Icon: ImageOutlinedIcon },
  { action: 'link', Icon: LinkIcon },
]

const ACTIVE_COMMANDS: Partial<Record<FormatAction, string>> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  bullet: 'insertUnorderedList',
  number: 'insertOrderedList',
}

interface QuestionRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  error?: boolean
  helperText?: string
  editorKey?: string | number
}

export function stripHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.replace(/\u00a0/g, ' ').trim() || ''
}

export default function QuestionRichTextEditor({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  editorKey,
}: QuestionRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<Range | null>(null)
  const imageFileRef = useRef<HTMLInputElement>(null)
  const [activeFormats, setActiveFormats] = useState<Partial<Record<FormatAction, boolean>>>({})
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [urlInput, setUrlInput] = useState('')
  const [linkText, setLinkText] = useState('')
  const [dialogError, setDialogError] = useState('')

  const updateActiveFormats = useCallback(() => {
    const next: Partial<Record<FormatAction, boolean>> = {}
    ;(Object.entries(ACTIVE_COMMANDS) as [FormatAction, string][]).forEach(([action, command]) => {
      try {
        next[action] = document.queryCommandState(command)
      } catch {
        next[action] = false
      }
    })
    setActiveFormats(next)
  }, [])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
  }, [editorKey, value])

  useEffect(() => {
    const onSelectionChange = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateActiveFormats()
      }
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [updateActiveFormats])

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const restoreSelection = () => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (!sel || !savedSelectionRef.current) return
    sel.removeAllRanges()
    sel.addRange(savedSelectionRef.current)
  }

  const syncContent = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html === '<br>' ? '' : html)
    updateActiveFormats()
  }

  const closeDialog = () => {
    setDialogType(null)
    setUrlInput('')
    setLinkText('')
    setDialogError('')
  }

  const openDialog = (type: DialogType) => {
    saveSelection()
    setDialogType(type)
    setUrlInput('')
    setLinkText('')
    setDialogError('')
  }

  const runFormat = (action: FormatAction, command?: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()

    if (action === 'image') {
      openDialog('image')
      return
    }
    if (action === 'link') {
      openDialog('link')
      return
    }
    if (command) {
      document.execCommand(command, false)
    }
    syncContent()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setDialogError('Please select a valid image file (PNG, JPG, GIF, etc.)')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setDialogError('Image must be smaller than 2 MB')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setUrlInput(String(reader.result || ''))
      setDialogError('')
    }
    reader.onerror = () => setDialogError('Failed to read image file')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const insertImage = () => {
    const url = urlInput.trim()
    if (!url) {
      setDialogError('Enter an image URL or upload a file')
      return
    }
    restoreSelection()
    document.execCommand('insertImage', false, url)
    syncContent()
    closeDialog()
  }

  const insertLink = () => {
    const url = urlInput.trim()
    if (!url) {
      setDialogError('Enter a link URL')
      return
    }
    restoreSelection()
    const text = linkText.trim()
    if (text) {
      document.execCommand('insertText', false, text)
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.setStart(range.endContainer, range.endOffset - text.length)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    document.execCommand('createLink', false, url)
    syncContent()
    closeDialog()
  }

  return (
    <>
      <Box sx={{ border: `1px solid ${error ? '#ef4444' : colors.line}`, borderRadius: 2, overflow: 'hidden' }}>
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ px: 1, py: 0.75, borderBottom: `1px solid ${colors.line}`, bgcolor: '#fafafa', flexWrap: 'wrap' }}
        >
          {TOOLBAR_ACTIONS.map(({ action, Icon, command }) => {
            const isActive = !!activeFormats[action]
            return (
              <IconButton
                key={action}
                size="small"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runFormat(action, command)}
                sx={{
                  borderRadius: 1,
                  p: 0.75,
                  bgcolor: isActive ? colors.brand50 : 'transparent',
                  border: isActive ? `1px solid ${colors.brand100}` : '1px solid transparent',
                  '&:hover': { bgcolor: isActive ? colors.brand50 : '#f3f4f6' },
                }}
              >
                <Icon sx={{ fontSize: 18, color: isActive ? colors.brand500 : colors.muted }} />
              </IconButton>
            )
          })}
        </Stack>

        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onFocus={updateActiveFormats}
          onBlur={() => {
            syncContent()
            onBlur?.()
          }}
          data-placeholder="Type here"
          sx={{
            minHeight: 140,
            px: 2,
            py: 1.5,
            outline: 'none',
            fontSize: 14,
            lineHeight: 1.6,
            color: colors.ink,
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: colors.muted,
            },
            '&:focus': {
              outline: `2px dashed ${colors.brand500}`,
              outlineOffset: -2,
            },
            '& ul, & ol': { pl: 3, my: 0.5 },
            '& img': { maxWidth: '100%', height: 'auto' },
          }}
        />

        {helperText && (
          <Typography variant="caption" color="error" sx={{ px: 2, py: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>

      <Dialog open={dialogType === 'image'} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Insert Image</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Image URL"
              placeholder="https://example.com/image.png"
              value={urlInput.startsWith('data:') ? '' : urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setDialogError('')
              }}
              size="small"
              fullWidth
            />

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Or upload from your device
              </Typography>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFileOutlinedIcon />}
                onClick={() => imageFileRef.current?.click()}
                sx={{ textTransform: 'none' }}
              >
                Upload Image
              </Button>
            </Box>

            {urlInput.startsWith('data:') && (
              <Box
                component="img"
                src={urlInput}
                alt="Preview"
                sx={{ maxWidth: '100%', maxHeight: 120, borderRadius: 1, border: `1px solid ${colors.line}` }}
              />
            )}

            {dialogError && (
              <Typography variant="caption" color="error">
                {dialogError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={insertImage} sx={{ textTransform: 'none' }}>
            Insert
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogType === 'link'} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Insert Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="URL"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setDialogError('')
              }}
              size="small"
              fullWidth
            />
            <TextField
              label="Link text (optional)"
              placeholder="Click here"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              size="small"
              fullWidth
              helperText="Leave empty to use selected text"
            />
            {dialogError && (
              <Typography variant="caption" color="error">
                {dialogError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={insertLink} sx={{ textTransform: 'none' }}>
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
