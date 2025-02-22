const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
const words = ['butterfly', 'dolphin', 'elephant', 'penguin', 'giraffe', 'kangaroo']

export function generateDemoCredentials(nodeId: string) {
  const existingCreds = localStorage.getItem(`demo-credentials-${nodeId}`)
  if (existingCreds) {
    return JSON.parse(existingCreds)
  }

  const color = colors[Math.floor(Math.random() * colors.length)]
  const word = words[Math.floor(Math.random() * words.length)]
  const number = Math.floor(Math.random() * 900) + 100

  const credentials = {
    email: `${color}-${Math.random().toString(36).substring(2, 8)}@demo.openxai.org`,
    password: `${word}${number}`
  }

  localStorage.setItem(`demo-credentials-${nodeId}`, JSON.stringify(credentials))
  return credentials
} 