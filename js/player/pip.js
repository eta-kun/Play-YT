export function supportsPictureInPicture() {
  return "pictureInPictureEnabled" in document || "webkitSupportsPresentationMode" in HTMLVideoElement.prototype;
}

export function getPipStatus() {
  return {
    supported: supportsPictureInPicture(),
    availableInIframePlayer: false
  };
}
