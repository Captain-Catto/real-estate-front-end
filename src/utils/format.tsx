export function formatPrice(price: number): string {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`;
  } else if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} triệu`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}k`;
  }
  return price.toLocaleString("vi-VN");
}

export function formatArea(area: number): string {
  return `${area}m²`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("vi-VN");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
