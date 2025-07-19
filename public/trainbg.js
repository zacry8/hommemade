const c = document.querySelector('#c');
const ctx = c.getContext('2d');

c.style.width = (c.width = window.innerWidth);
c.style.height = (c.height = window.innerHeight);

const palette = [
  // '#001219',
  '#005f73',
  '#0a9396',
  '#94d2bd',
  '#e9d8a6',
  '#ee9b00',
  '#ca6702',
  '#bb3e03',
  '#ae2012',
  '#9b2226',
]

const drawTriangle = (x,y,w,h) => {
  ctx.beginPath();
  ctx.moveTo(x+w/2,y);
  ctx.lineTo(x+w,y+h);
  ctx.lineTo(x,y+h);
  ctx.lineTo(x+w/2,y);
  ctx.stroke();
}

function pseudoRandom(seed) {
  return Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
}

function noise(x, y) {
  const seed = x * 137 + y * 149; // Генерация уникального числа
  return pseudoRandom(seed) % 1; // Возвращаем значение от 0 до 1
}

const distance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1); 

const animate = (time) => {
  requestAnimationFrame(animate);
  
  ctx.lineWidth = 2.5;
  
  const w = 10;
  const h = 8;
  
  ctx.fillStyle = '#001219';
  ctx.fillRect(0, 0, c.width, c.height)

  for (let y = 0; y<c.height; y += h) {
    for (let x = 0; x<c.width; x += w) {
       const even = (y / h) % 2 === 0;
       const t = (time / 2000)
       const e = (1 + Math.sin((y) / 40) + Math.cos((x) / 50))
       const index = Math.floor((e + t) * palette.length)
       ctx.strokeStyle = palette[index % palette.length];

       drawTriangle(even ? x + .5 : x - ((w/2)-0.5),y,w,h);
    }
  }
}

animate(0);
