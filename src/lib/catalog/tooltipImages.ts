const COMMONS_TOOLTIP_IMAGE_WIDTH = 640;

export function commonsTooltipImage(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${COMMONS_TOOLTIP_IMAGE_WIDTH}`;
}
