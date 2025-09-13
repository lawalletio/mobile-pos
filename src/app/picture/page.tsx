/* eslint-disable @next/next/no-img-element */
'use client'

// React/Next
import { useRouter } from 'next/navigation'

// Components
import Container from '@/components/Layout/Container'
import { Button, Divider, Flex, Heading } from '@/components/UI'

// Utils
import Navbar from '@/components/Layout/Navbar'

// Camera
import { Camera, CameraType } from 'react-camera-pro'
import { useRef, useState } from 'react'

import promptText from '@/constants/prompt'

console.dir('promptText' + promptText)

export default function Page() {
  // Hooks
  const router = useRouter()

  const camera = useRef<CameraType>(null)
  const [image, setImage] = useState<string | null>(null)

  // Load prompt text

  // Handle take photo
  const handleTakePhoto = async (base64String: string) => {
    console.dir(base64String)
    try {
      console.log('Generating image with prompt:', promptText)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base64Image: base64String, prompt: promptText })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Internal API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      console.log('Generated image URLs:', data.urls)
      console.dir(data)
      // Handle the result as needed
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }
  /** Functions */

  return (
    <>
      <Navbar showBackPage={true}>
        <Flex align="center">
          <Heading as="h5">Take a picture</Heading>
        </Flex>
      </Navbar>

      <Flex justify="center" align="center" flex={1}>
        <div style={{ width: '500px', height: '500px' }}>
          <Camera ref={camera} errorMessages={{}} />
        </div>
      </Flex>

      <Flex>
        <Container size="small">
          <Divider y={16} />
          <Flex gap={8}>
            <Button
              variant="filled"
              onClick={() => {
                const photo = camera?.current?.takePhoto()
                if (photo) {
                  handleTakePhoto(photo as string)
                }
              }}
            >
              Sacar Foto
            </Button>
          </Flex>
          <Divider y={32} />
        </Container>
      </Flex>
    </>
  )
}

// const styleQrReader = {
//   position: 'relative',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   width: '100%',
//   maxWidth: '500px',
//   height: '100%'
// }
