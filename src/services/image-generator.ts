'use server'

import sharp from 'sharp'
import { RunwayML } from '@runwayml/sdk'

class ImageGenerator {
  private runway: RunwayML

  constructor(apiKey: string) {
    this.runway = new RunwayML({ apiKey })
  }

  async generateImage(
    base64Image: string,
    prompt: string,
    n: number = 1,
    size: string = '1024x1024'
  ): Promise<string[]> {
    const pngBase64Image = await this.convertJpegToPngBase64(base64Image)

    const response = await this.runway.generateImage({
      image: pngBase64Image,
      prompt: prompt,
      n: n,
      size: size
    })

    return response.data.map((item: { url: string }) => item.url)
  }

  private async convertJpegToPngBase64(base64Image: string): Promise<string> {
    const buffer = Buffer.from(base64Image, 'base64')
    const pngBuffer = await sharp(buffer)
      .ensureAlpha() // Adds the alpha channel to produce RGBA
      .png()
      .toBuffer()

    return pngBuffer.toString('base64')
  }

  private createFormData(
    base64Image: string,
    prompt: string,
    n: number,
    size: string
  ) {
    const formData = new FormData()
    const imageBlob = Buffer.from(base64Image, 'base64')
    formData.append('image', new Blob([imageBlob]), 'image.png')
    formData.append('prompt', prompt)
    formData.append('n', n.toString())
    formData.append('size', size)
    return formData
  }
}

export default ImageGenerator
