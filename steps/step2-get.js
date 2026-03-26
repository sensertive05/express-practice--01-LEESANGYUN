import express from 'express';

const app = express();
const PORT = 8080;

const subscriptions = [
  { id: 1, service: 'Netflix',          price: 9900,  cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium',  price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify',          price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
];

// TODO 1: 전체 목록 — 배열 그대로
app.get('/api/subscriptions', (req, res) => {
  res.json(subscriptions);
});

// TODO 2: 전체 목록 — 메타 정보 포함 ★ 권장
app.get('/api/subscriptions-v2', (req, res) => {
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// TODO 3: 에러 처리 포함
app.get('/api/subscriptions-safe', (req, res) => {
  try {
    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '구독 내역이 없습니다',
      });
    }

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
    });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});