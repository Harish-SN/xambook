// src/components/MathText.tsx

import { Fragment } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Renders a string that mixes plain text, inline LaTeX wrapped in $...$,
// and literal <br> tags (used in assertion-reason questions).
//
// Examples it must handle:
//   "A $2\\,\\mu$F capacitor charged to $100$ V"
//   "Assertion (A): ...<br>Reason (R): ..."
//   explanations with real "\n" newlines
export default function MathText({ text }: { text: string }) {
  if (!text) return null

  // Split on $...$ groups, keeping the delimiters in the result.
  // Math segments are rendered with KaTeX; everything else is plain text.
  const parts = text.split(/(\$[^$]+\$)/g)

  return (
    <>
      {parts.map((part, i) => {
        const isMath =
          part.length > 1 &&
          part.startsWith('$') &&
          part.endsWith('$')

        if (isMath) {
          const html = katex.renderToString(part.slice(1, -1), {
            throwOnError: false,
            displayMode: false,
          })

          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        }

        // Plain text: turn literal <br> / <br/> tags AND real "\n"
        // newlines into actual line breaks.
        const normalized = part.replace(/<br\s*\/?>/gi, '\n')
        const lines = normalized.split('\n')

        return (
          <Fragment key={i}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        )
      })}
    </>
  )
}
