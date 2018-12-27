import { StreamApiNotSupportedError } from './errors.js'
import { imageDataFromVideo } from './image-data.js'
import { hasFired } from './promisify.js'

class Camera {

  constructor (videoEl, stream) {
    this.videoEl = videoEl
    this.stream = stream

    let areaSize = Math.floor(this.videoEl.videoWidth / 2)
    this.centerArea = {position: {x: Math.floor(areaSize / 2), y: Math.floor((this.videoEl.videoHeight - areaSize) / 2)}, size: {width: areaSize, height: areaSize}}
  }

  stop () {
    this.stream.getTracks().forEach(
      track => track.stop()
    )
  }

  captureFrame (center = false) {
    if (center) return imageDataFromVideo(this.videoEl, this.centerArea)
    return imageDataFromVideo(this.videoEl)
  }

}

export default async function (constraints, videoEl) {
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

  return new Camera(videoEl, stream)
}
