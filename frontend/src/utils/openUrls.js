export function openUrlInNewTab(url) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

export function openMultipleUrls(urls = []) {
  const unique = [...new Set(urls.filter((u) => u && u.startsWith('http')))]
  unique.forEach((url) => openUrlInNewTab(url))
  return unique.length
}

export function groupUrlsByProvider(items = []) {
  const map = new Map()
  items.forEach((item) => {
    if (!item.url || !item.url.startsWith('http')) return
    const key = item.provider || 'Tienda'
    if (!map.has(key)) map.set(key, [])
    const list = map.get(key)
    if (!list.some((entry) => entry.url === item.url)) {
      list.push({ url: item.url, title: item.name || item.title || 'Producto' })
    }
  })
  return [...map.entries()].map(([provider, links]) => ({ provider, links }))
}
