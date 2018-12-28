import { StreamApiNotSupportedError } from './errors.js'
import { imageDataFromVideo } from './image-data.js'
import { hasFired } from './promisify.js'

class Camera {

  constructor (videoEl, stream, centerArea = null) {
    this.videoEl = videoEl
    this.stream = stream

    this.centerArea = centerArea
  }

  stop () {
    this.stream.getTracks().forEach(
      track => track.stop()
    )
  }

  captureFrame (cropped = true) {
    if (cropped && this.centerArea) {
      return imageDataFromVideo(this.videoEl, this.centerArea)
    }

    return imageDataFromVideo(this.videoEl)
  }

}

export default async function (constraints, videoEl, size) {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    throw new StreamApiNotSupportedError()
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  const streamLoaded = hasFired(videoEl, 'loadeddata', 'error')

  if (videoEl.srcObject !== undefined) {
    videoEl.srcObject = stream
  } else if (videoEl.mozSrcObject !== undefined) {
    videoEl.mozSrcObject = stream
  } else if (window.URL.createObjectURL) {
    videoEl.src = window.URL.createObjectURL(stream)
  } else if (window.webkitURL) {
    videoEl.src = window.webkitURL.createObjectURL(stream)
  } else {
    videoEl.src = stream
  }

  await streamLoaded

  let area = null
  if (size) area = {position: {x: Math.floor((videoEl.videoWidth - size) / 2), y: Math.floor((videoEl.videoHeight - size) / 2)}, size: {width: size, height: size}}

  return new Camera(videoEl, stream, area)
}
