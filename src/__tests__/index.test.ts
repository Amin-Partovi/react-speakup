import * as hooks from '../index'

test('useVoiceToText and useTextToVoice are exported', () => {
  expect(hooks.useVoiceToText).toBeDefined()
  expect(hooks.useTextToVoice).toBeDefined()
})
