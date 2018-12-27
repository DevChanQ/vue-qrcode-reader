import { DropImageFetchError, DropImageDecodeError } from './errors.js'
import { hasFired } from './promisify.js'

const canvas = document.createElement('canvas')
const canvasCtx = canvas.getContext('2d')

canvas.width = 1920
canvas.height = 1080

function imageDataFromCanvas (canvasImageSource, area = null) {
  const scalingRatio = Math.min(1, canvas.width / area.size.width, canvas.height / area.size.height)
  const widthScaled = scalingRatio * area.size.width
  const heightScaled = scalingRatio * area.size.height
  const xScaled = scalingRatio * area.position.x
  const yScaled = scalingRatio * area.position.y

  canvasCtx.drawImage(canvasImageSource, xScaled, yScaled, widthScaled, heightScaled, 0, 0, widthScaled, heightScaled)

  return canvasCtx.getImageData(0, 0, widthScaled, heightScaled)
}

export function imageDataFromImage (imageElement) {
  const width = imageElement.naturalWidth
  const height = imageElement.naturalHeight

  return imageDataFromCanvas(imageElement, {position: {x: 0, y: 0}, size: {width: width, height: height}})
}

export function imageDataFromVideo (videoElement, area = null) {
  if (!area) {
    const width = videoElement.videoWidth
    const height = videoElement.videoHeight

    return imageDataFromCanvas(videoElement, {position: {x: 0, y: 0}, size: {width: width, height: height}})
  }

  return imageDataFromCanvas(videoElement, area)
}

export async function imageDataFromUrl (url) {
  if (url.startsWith('http') && url.includes(location.host) === false) {
    throw new DropImageFetchError()
  }

  const image = document.createElement('img')
  const imageLoaded = hasFired(image, 'load')

  image.src = url

  await imageLoaded

  return imageDataFromImage(image)
}

export async function imageDataFromFile (file) {
  if (/image.*/.test(file.type)) {
    const reader = new FileReader()
    const readerLoaded = hasFired(reader, 'load')

    reader.readAsDataURL(file)

    const dataURL = (await readerLoaded).target.result

    return imageDataFromUrl(dataURL)
  } else {
    throw new DropImageDecodeError()
  }
}
