export function getReadableTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace(/^#/, "");
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return "#001736";

  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((channel) => channel + channel)
          .join("")
      : hex;
  const channels = normalized.match(/.{2}/g);
  if (!channels) return "#001736";

  const luminance = channels
    .map((channel) => parseInt(channel, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    )
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

  return luminance > 0.179 ? "#001736" : "#ffffff";
}
