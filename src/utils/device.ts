// 裝置偵測工具
export function isMobile() {
  if (typeof window === 'undefined') return false
  return /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent)
}
