import { useEffect, useMemo, useRef, useState } from 'react'

interface Options {
  lang?: string
  continuous?: boolean
}

const useVoiceToText = ({ lang, continuous }: Options = { lang: 'en-US', continuous: true }) => {
  const [text, setText] = useState<string>('')
  const isContinuous = useRef<boolean>(continuous ?? true)

  const SpeechRecognition = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, [])

  const recognition = useMemo(() => new SpeechRecognition(), [SpeechRecognition])

  useEffect(() => {
    if (lang) {
      recognition.lang = lang
    }
  }, [lang, recognition])

  function start() {
    recognition.start()
    if (continuous) {
      isContinuous.current = true
    }
  }

  function stop() {
    recognition.stop()
    isContinuous.current = false
  }

  recognition.onend = () => {
    if (isContinuous.current) {
      // if the listening is continuous, it starts listening even the speaker is quiet till it will stop manually
      start()
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error(`Speech recognition error detected: ${event.error}`)
  }

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    setText((text) => text + ' ' + event.results[0][0].transcript)
  }

  return { start, stop, text }
}

export default useVoiceToText
