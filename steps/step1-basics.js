import express from 'express';

// TODO 1: Express 앱 생성
const app = express();
const PORT = 8080;

// TODO 2: 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// TODO 3: 여러 라우트
app.get('/users', (req, res) => {
  res.send('사용자 목록');
});

app.get('/products', (req, res) => {
  res.send('상품 목록');
});

app.get('/about', (req, res) => {
  res.send('About 페이지');
});

// TODO 4: JSON 응답
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
});

// TODO 5: 상태 코드와 함께 응답
app.get('/success', (req, res) => {
  res.status(200).json({ message: 'Success' });
});

app.get('/error', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// TODO 6: 서버 시작
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

