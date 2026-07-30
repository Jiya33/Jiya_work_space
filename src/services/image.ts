// ====== 图片压缩工具 ======

/**
 * 将 File 压缩为 Base64 字符串
 * 宽度压缩至 1080px，质量 70%，转 JPEG
 * Base64 字符串 < 150KB
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxWidth = 1080
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        // 逐步降低质量，直到 Base64 < 150KB
        let quality = 0.7
        let result = canvas.toDataURL('image/jpeg', quality)

        // 粗略估计：Base64 字符串长度 ≈ 文件字节数 × 1.37
        // 150KB ≈ 153600 字节 → 目标 Base64 长度 ≈ 210000
        while (result.length > 210000 && quality > 0.1) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(result)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * 根据 Base64 字符串估算文件大小（KB）
 */
export function estimateBase64Size(base64: string): number {
  return Math.round((base64.length * 0.75) / 1024)
}
