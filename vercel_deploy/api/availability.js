export default function handler(req, res) {
  const { date } = req.query;
  const timezone = 'Africa/Lagos';
  const workingDays = [1, 2, 3, 4, 5]; // Mon-Fri
  const startMinutes = 9 * 60; // 9:00 AM
  const endMinutes = 17 * 60; // 5:00 PM
  const duration = 60;
  const buffer = 15;

  const getSlots = (targetDate) => {
    const d = new Date(targetDate);
    const day = d.getUTCDay();
    const dayOfWeek = day === 0 ? 7 : day; // 1 (Mon) - 7 (Sun)

    if (!workingDays.includes(dayOfWeek)) return [];

    const slots = [];
    const step = duration + buffer;

    for (let min = startMinutes; min + duration <= endMinutes; min += step) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return slots;
  };

  if (date) {
    return res.status(200).json({ success: true, date, slots: getSlots(date) });
  }

  const today = new Date();
  const availableDates = [];
  for (let i = 0; i <= 90; i++) {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + i);
    const dateStr = futureDate.toISOString().split('T')[0];
    if (getSlots(dateStr).length > 0) {
      availableDates.push(dateStr);
    }
  }

  return res.status(200).json({
    success: true,
    settings: { timezone, duration_minutes: duration, buffer_minutes: buffer },
    available_dates: availableDates
  });
}
