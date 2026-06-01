// src/components/MathText.tsx

import katex from 'katex'
import 'katex/dist/katex.min.css'

// Renders a string that mixes plain text and inline LaTeX wrapped in $...$
// e.g. "A $2\\,\\mu$F capacitor charged to $100$ V"
export default function MathText({ text }: { text: string }) {
  if (!text) return null

  // Split on $...$ groups, keeping the delimiters in the result.
  const parts = text.split(/(\$[^$]+\$)/g)

  return (
    <>
      {parts.map((part, i) => {
        const isMath = part.startsWith('$') && part.endsWith('$')

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

        // Plain text: preserve \n line breaks (used in explanations).
        const lines = part.split('\n')

        return (
          <span key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </span>
        )
      })}
    </>
  )
}