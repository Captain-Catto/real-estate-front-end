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

export function formatDetailedPrice(price: number): string {
  if (!price || price <= 0) return "Thỏa thuận";

  const billion = Math.floor(price / 1000000000);
  const million = Math.floor((price % 1000000000) / 1000000);
  const thousand = Math.floor((price % 1000000) / 1000);
  const unit = price % 1000;

  const parts: string[] = [];

  if (billion > 0) {
    parts.push(`${billion} tỷ`);
  }

  if (million > 0) {
    parts.push(`${million} triệu`);
  }

  if (thousand > 0) {
    parts.push(`${thousand} ngàn`);
  }

  if (unit > 0 && parts.length === 0) {
    // Chỉ hiển thị đơn vị khi không có tỷ, triệu, ngàn
    parts.push(`${unit} VNĐ`);
  }

  return parts.join(" ");
}

export function formatPriceByType(price: number, type: string): string {
  const detailedPrice = formatDetailedPrice(price);

  switch (type) {
    case "cho-thue":
      return `${detailedPrice}/tháng`;
    case "ban":
      return detailedPrice;
    case "project":
      return `${detailedPrice}/m²`;
    default:
      return detailedPrice;
  }
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
