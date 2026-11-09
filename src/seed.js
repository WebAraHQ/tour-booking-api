/** Sample tours with departures in the coming weeks. */
export function sampleData(today = new Date()) {
  const inDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  return {
    tours: [
      { id: 'north-weekend', title: 'Northern Iran Weekend', category: 'domestic', nights: 2, price: 9000000 },
      { id: 'hamedan-heritage', title: 'Hamedan Heritage Day Trip', category: 'domestic', nights: 0, price: 2800000 },
      { id: 'desert-camp', title: 'Desert Camp & Stargazing', category: 'nature', nights: 1, price: 4500000 },
      { id: 'istanbul-4d', title: 'Istanbul 4 Days', category: 'international', nights: 3, price: 42000000 },
    ],
    departures: [
      { id: 1, tourId: 'north-weekend', date: inDays(7), capacity: 40 },
      { id: 2, tourId: 'north-weekend', date: inDays(21), capacity: 40 },
      { id: 3, tourId: 'hamedan-heritage', date: inDays(3), capacity: 25, bookedSeats: 25 },
      { id: 4, tourId: 'desert-camp', date: inDays(10), capacity: 20, bookedSeats: 14 },
      { id: 5, tourId: 'istanbul-4d', date: inDays(30), capacity: 30 },
    ],
  };
}
