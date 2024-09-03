import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface Options {
  pitch?: number
  rate?: number
  volume?: number
}

enum NODE_TYPE {
  ELEMENT = 1,
  TEXT = 3,
}

const useTextToVoice = <T extends HTMLElement>({ pitch, rate, volume }: Options = {}) => {
  const textContainerRef = useRef<T>(null)
  const voiceTranscript = useRef<string>('')
  const firstRenderRef = useRef<boolean>(true)
  const [textContent, setTextContent] = useState<string>('')
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const synth = typeof window === 'undefined' ? null : window.speechSynthesis

  const utterThis = useMemo(() => {
    if (typeof SpeechSynthesisUtterance === 'undefined') {
      return null
    }
    return new SpeechSynthesisUtterance(textContent)
  }, [textContent])

  const extractText = useCallback((element: Element | ChildNode | null) => {
    if (!element) return
    // Check if the element has child nodes
    if (element.childNodes.length > 0) {
      // Loop through the child nodes
      element.childNodes.forEach((child) => {
        if (child.nodeType === NODE_TYPE.TEXT) {
          // If it's a text node (nodeType 3), add its text content to the result
          voiceTranscript.current += child.textContent
        } else if (child.nodeType === NODE_TYPE.ELEMENT) {
          // If it's an element node (nodeType 1), recursively call the function
          extractText(child)
        }
      })
    }
  }, [])

  if (utterThis) {
    utterThis.onerror = (event) => {
      console.log(`An error has occurred with the speech synthesis: ${event.error}`)
    }

    utterThis.onend = () => {
      setIsSpeaking(false)
    }
  }

  // get voices Web Speech API provided
  const voices = useMemo(() => synth?.getVoices() ?? [], [synth])
  const voiceNames = useMemo(() => voices.map((voice) => voice.name), [voices])

  useEffect(() => {
    if (firstRenderRef.current && textContainerRef) {
      const voiceContainer = textContainerRef.current
      firstRenderRef.current = false
      extractText(voiceContainer)
    }
    setTextContent(voiceTranscript.current)
  }, [extractText, textContainerRef])

  useEffect(() => {
    if (pitch && utterThis) {
      utterThis.pitch = pitch
    }
    if (volume && utterThis) {
      utterThis.volume = volume
    }
    if (rate && utterThis) {
      utterThis.rate = rate
    }
  }, [utterThis, pitch, volume, rate])

  function speak() {
    if (synth && utterThis) {
      synth.speak(utterThis)
      setIsSpeaking(true)
    }
  }

  function pause() {
    if (synth) {
      synth.pause()
      setIsSpeaking(false)
    }
  }

  function resume() {
    if (synth) {
      synth.resume()
      setIsSpeaking(true)
    }
  }

  function setVoice(voiceName: string) {
    // find selected voice by its name
    if (utterThis) utterThis.voice = voices.find((item) => item.name === voiceName) as SpeechSynthesisVoice
  }

  return {
    speak,
    pause,
    resume,
    voices: voiceNames,
    setVoice,
    ref: textContainerRef,
    utterance: utterThis,
    isSpeaking,
  }
}

export default useTextToVoice
