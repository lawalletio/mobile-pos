// /app/api/generate-image/route.ts
import ImageGenerator from '@/services/image-generator'

export async function POST(request: Request) {
  const { base64Image, prompt } = await request.json()
  console.log('base64Image', base64Image)
  console.log('prompt', prompt)
  const finalBase64Image = base64Image.replace(/^data:image\/jpeg;base64,/, '')
  const generator = new ImageGenerator(process.env.NEXT_RUNWAY_API!)
  const urls = await generator.generateImage(finalBase64Image, prompt)
  console.dir(urls)

  return Response.json({ urls })
}
