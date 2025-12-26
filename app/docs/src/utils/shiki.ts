import { createHighlighter, type Highlighter } from 'shiki'

let sharedHighlighter: Highlighter | null = null
let initPromise: Promise<Highlighter> | null = null

export const getHighlighter = async (): Promise<Highlighter> => {
  if (sharedHighlighter) {
    return sharedHighlighter
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = createHighlighter({
    themes: ['github-dark'],
    langs: ['typescript', 'javascript', 'ts', 'js'],
  }).then((h) => {
    sharedHighlighter = h
    return h
  })

  return initPromise
}
