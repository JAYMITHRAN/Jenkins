import React, { useState, useEffect, useRef } from 'react'

const BUTTONS = [
  '7','8','9','DEL',
  '4','5','6','+',
  '1','2','3','-',
  '.','0','=','*',
  'C','(',')','/'
]

function sanitize(expr) {
  return /^[-+/*(). 0-9]+$/.test(expr)
}

function evaluateExpression(expr) {
  if (!sanitize(expr)) throw new Error('Invalid characters')
  expr = expr.trim()
  while (expr.length && /[+\-*/.]$/.test(expr)) expr = expr.slice(0, -1)
  if (!expr) return ''
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)()
    if (Number.isFinite(result)) return String(result)
    throw new Error('Non-finite result')
  } catch {
    throw new Error('Invalid expression')
  }
}

export default function App() {
  const [display, setDisplay] = useState('')
  const [history, setHistory] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') {
        onPress('=')
        e.preventDefault()
        return
      }
      if (e.key === 'Backspace') { onPress('DEL'); e.preventDefault(); return }
      const key = e.key
      const allowed = '0123456789.+-*/() '
      if (allowed.includes(key)) {
        setDisplay((d) => d + key)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function onPress(value) {
    if (value === 'C') {
      setDisplay('')
      return
    }
    if (value === 'DEL') {
      setDisplay((d) => d.slice(0, -1))
      return
    }
    if (value === '=') {
      try {
        const res = evaluateExpression(display)
        setHistory((h) => [{ expr: display, result: res }, ...h].slice(0, 20))
        setDisplay(res)
      } catch {
        setDisplay('Error')
        setTimeout(() => setDisplay(''), 900)
      }
      return
    }
    setDisplay((d) => d + value)
  }

  return (
    <div className="app">
      <div className="calculator">
        <div className="screen" onClick={() => inputRef.current?.focus()}>
          <div className="expr">{display || '0'}</div>
        </div>

        <div className="buttons">
          {BUTTONS.map((b) => (
            <button
              key={b}
              className={`btn ${b === '=' ? 'equals' : ''}`}
              onClick={() => onPress(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="history">
          <h4>History</h4>
          {history.length === 0 && <div className="muted">No calculations yet</div>}
          <ul>
            {history.map((h, i) => (
              <li key={i} onClick={() => setDisplay(h.result)}>
                <span className="h-expr">{h.expr}</span> = <span className="h-res">{h.result}</span>
              </li>
            ))}
          </ul>
        </div>

        <input
          ref={inputRef}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          aria-hidden
        />
      </div>

      <footer className="footer">Vite Calculator • keyboard supported</footer>
    </div>
  )
}
