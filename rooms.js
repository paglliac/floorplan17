// Room boundaries follow the model's wall axes, including the open passage from the kitchen.
export const rooms = {
  all: {name: 'Вся квартира', area: '58,5', center: [4.44, 3.88], span: 12.4, angle: .64, pitch: .85},
  living: {name: 'Гостиная', area: '16,4', points: [[1.49,0],[5.38,0],[5.38,3.85],[5.18,4.04],[4.55,4.45],[1.49,4.45]], angle: -2.48},
  nursery: {name: 'Детская', area: '14,6', points: [[5.38,0],[8.87,0],[8.87,4.45],[6.32,4.45],[5.58,4.04],[5.38,3.85]], angle: -.75},
  kitchen: {name: 'Кухня', area: '12,8', points: [[1.49,4.45],[4.23,4.45],[4.23,7.77],[0,7.77],[0,5.7],[1.49,4.5]], angle: 2.6},
  hall: {name: 'Коридор', area: '9,5', points: [[4.23,4.45],[4.55,4.45],[5.18,4.04],[5.38,3.85],[5.58,4.04],[6.32,4.45],[8.87,4.45],[8.87,7.77],[7.12,7.77],[7.12,5.83],[4.23,5.83]], angle: -2.42, pitch: .82},
  bath: {name: 'Санузел', area: '5,2', points: [[4.23,5.83],[7.12,5.83],[7.12,7.77],[4.23,7.77]], angle: -2.82}
};
for (const room of Object.values(rooms)) {
  if (!room.points) continue;
  const xs = room.points.map(p => p[0]), zs = room.points.map(p => p[1]);
  const width = Math.max(...xs) - Math.min(...xs), depth = Math.max(...zs) - Math.min(...zs);
  room.center = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
  room.span = Math.hypot(width, depth) + .7;
}
