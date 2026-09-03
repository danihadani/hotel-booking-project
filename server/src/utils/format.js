// ============================================================
// Turning database rows into the exact JSON shape the API promises.
// ============================================================

export const VAT_RATE = 0.18; // 18% VAT, as required by the assignment

/** Hotel row -> API object (field order matches the assignment screenshots). */
export function hotelToJson(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    city: row.city,
    number_of_rooms: row.number_of_rooms,
    stars: row.stars,
  };
}

/** Room row -> API object. Note: the FK column hotel_id is exposed as "hotel". */
export function roomToJson(row) {
  return {
    id: row.id,
    name: row.name,
    max_guests: row.max_guests,
    price: row.price,
    size: row.size,
    hotel: row.hotel_id,
  };
}

/**
 * Final price = (nights x price per night) + 18% VAT.
 * Rounded to 2 decimals ("agorot") so we never show 1234.5600000001.
 */
export function calculatePrice(pricePerNight, nights) {
  const subtotal = round2(pricePerNight * nights);
  const vat = round2(subtotal * VAT_RATE);
  return { subtotal, vat, total: round2(subtotal + vat) };
}

export function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Reservation row (joined with hotel + room) -> API object. */
export function reservationToJson(row) {
  const { subtotal, vat, total } = calculatePrice(row.price_per_night, row.nights);
  return {
    id: row.id,
    guest_name: row.guest_name,
    start_date: row.start_date,
    end_date: row.end_date,
    nights: row.nights,
    price_per_night: row.price_per_night,
    subtotal,
    vat_rate: VAT_RATE,
    vat,
    total_price: total,
    hotel: { id: row.hotel_id, name: row.hotel_name, city: row.city, country: row.country },
    room: { id: row.room_id, name: row.room_name, max_guests: row.max_guests, size: row.size },
  };
}
