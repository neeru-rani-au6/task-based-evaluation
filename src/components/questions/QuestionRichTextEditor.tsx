import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LinkIcon from '@mui/icons-material/Link'
import { colors } from '../../theme'

type FormatAction = 'bold' | 'italic' | 'underline' | 'bullet' | 'number' | 'image' | 'link'

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
  const [activeFormats, setActiveFormats] = useState<Partial<Record<FormatAction, boolean>>>({})

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

  const syncContent = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html === '<br>' ? '' : html)
    updateActiveFormats()
  }

  const runFormat = (action: FormatAction, command?: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()

    if (action === 'image') {
      const url = window.prompt('Enter image URL')
      if (url) document.execCommand('insertImage', false, url)
    } else if (action === 'link') {
      const url = window.prompt('Enter link URL')
      if (url) document.execCommand('createLink', false, url)
    } else if (command) {
      document.execCommand(command, false)
    }

    syncContent()
  }

  return (
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
  )
}
