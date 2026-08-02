// 平台识别：用于运动教程链接的图标与分类

export const PLATFORM_ICON: Record<string, string> = {
  '小红书': '📕', '抖音': '🎵', 'B站': '📺', 'YouTube': '▶️', '其他': '🔗'
}

export function detectPlatform(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('xiaohongshu.com') || u.includes('xhslink.com')) return '小红书'
  if (u.includes('douyin.com') || u.includes('v.douyin.com') || u.includes('iesdouyin')) return '抖音'
  if (u.includes('bilibili.com') || u.includes('b23.tv')) return 'B站'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube'
  return '其他'
}
