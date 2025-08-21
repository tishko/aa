export function sanitize(html: string | null | undefined) {
  if (!html) return ''
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '')
}
