/**
 * =============================================
 * 구독 관리 API - 전체 CRUD 완성본 (정답)
 * =============================================
 *
 * Step 1~7의 모든 내용이 통합된 최종 버전입니다.
 * 실습을 먼저 해보고, 막히면 이 파일을 참고하세요!
 *
 * 실행: npm run dev
 * 포트: http://localhost:8080
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

// ─────────────────────────────────────────────
// 미들웨어
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// 임시 데이터 (메모리 DB)
// ─────────────────────────────────────────────
let subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium', price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
  { id: 4, service: 'Disney+', price: 9900, cycle: 'monthly', startDate: '2024-03-01' },
  { id: 5, service: 'ChatGPT Plus', price: 22000, cycle: 'monthly', startDate: '2024-04-01' },
];

// ─────────────────────────────────────────────
// 검증 함수
// ─────────────────────────────────────────────
function validateSubscription(data) {
  const errors = [];

  if (!data.service) errors.push('서비스 이름은 필수입니다');
  if (!data.price) errors.push('가격은 필수입니다');
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
    errors.push('가격은 양수여야 합니다');
  }

  const validCycles = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!data.cycle) {
    errors.push('구독 주기는 필수입니다');
  } else if (!validCycles.includes(data.cycle)) {
    errors.push(`구독 주기는 ${validCycles.join(', ')} 중 하나여야 합니다`);
  }

  if (!data.startDate) {
    errors.push('시작일은 필수입니다');
  } else if (isNaN(Date.parse(data.startDate))) {
    errors.push('올바른 날짜 형식이 아닙니다 (예: 2024-01-01)');
  }

  return errors;
}

// ─────────────────────────────────────────────
// GET / - 기본 라우트
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '구독 관리 API',
    endpoints: {
      'GET /api/subscriptions': '전체 목록 조회 (필터, 정렬, 페이지네이션 지원)',
      'GET /api/subscriptions/:id': '특정 구독 조회',
      'POST /api/subscriptions': '새 구독 생성',
      'PATCH /api/subscriptions/:id': '구독 수정',
      'DELETE /api/subscriptions/:id': '구독 삭제',
    },
  });
});

// ─────────────────────────────────────────────
// GET /api/subscriptions - 전체 목록 조회
// ─────────────────────────────────────────────
app.get('/api/subscriptions', (req, res) => {
  const { service, cycle, minPrice, maxPrice, sort, order = 'asc', page, limit } = req.query;

  let results = [...subscriptions];

  if (service) {
    results = results.filter((sub) =>
      sub.service.toLowerCase().includes(service.toLowerCase())
    );
  }

  if (cycle) {
    results = results.filter((sub) => sub.cycle === cycle);
  }

  if (minPrice) {
    results = results.filter((sub) => sub.price >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter((sub) => sub.price <= Number(maxPrice));
  }

  if (sort) {
    results.sort((a, b) => {
      let valueA = a[sort];
      let valueB = b[sort];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (order === 'desc') {
        return valueA > valueB ? -1 : 1;
      }
      return valueA > valueB ? 1 : -1;
    });
  }

  const total = results.length;

  if (page || limit) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;

    results = results.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: results,
    });
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// ─────────────────────────────────────────────
// GET /api/subscriptions/:id - 특정 구독 조회
// ─────────────────────────────────────────────
app.get('/api/subscriptions/:id', (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'ID는 숫자여야 합니다' });
  }

  const numId = Number(id);

  if (numId <= 0) {
    return res.status(400).json({ success: false, message: 'ID는 양수여야 합니다' });
  }

  const subscription = subscriptions.find((sub) => sub.id === numId);

  if (!subscription) {
    return res.status(404).json({ success: false, message: `ID ${numId}인 구독을 찾을 수 없습니다` });
  }

  res.json({ success: true, data: subscription });
});

// ─────────────────────────────────────────────
// POST /api/subscriptions - 새 구독 생성
// ─────────────────────────────────────────────
app.post('/api/subscriptions', (req, res) => {
  const { service, price, cycle, startDate } = req.body;

  const errors = validateSubscription(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const duplicate = subscriptions.find(
    (sub) => sub.service.toLowerCase() === service.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({ success: false, message: '이미 존재하는 구독입니다' });
  }

  const newId =
    subscriptions.length > 0
      ? Math.max(...subscriptions.map((s) => s.id)) + 1
      : 1;

  const newSubscription = {
    id: newId,
    service,
    price,
    cycle,
    startDate,
    createdAt: new Date().toISOString(),
  };

  subscriptions.push(newSubscription);

  res.status(201).json({
    success: true,
    message: '구독이 생성되었습니다',
    data: newSubscription,
  });
});

// ─────────────────────────────────────────────
// PATCH /api/subscriptions/:id - 구독 수정
// ─────────────────────────────────────────────
app.patch('/api/subscriptions/:id', (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: '수정할 내용이 없습니다' });
  }

  const allowedFields = ['service', 'price', 'cycle', 'startDate'];
  const invalidFields = Object.keys(updates).filter((key) => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `수정할 수 없는 필드입니다: ${invalidFields.join(', ')}`,
      allowedFields,
    });
  }

  if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
    return res.status(400).json({ success: false, message: '가격은 양수여야 합니다' });
  }

  if (updates.cycle !== undefined) {
    const validCycles = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validCycles.includes(updates.cycle)) {
      return res.status(400).json({
        success: false,
        message: `구독 주기는 ${validCycles.join(', ')} 중 하나여야 합니다`,
      });
    }
  }

  if (updates.startDate !== undefined && isNaN(Date.parse(updates.startDate))) {
    return res.status(400).json({ success: false, message: '올바른 날짜 형식이 아닙니다' });
  }

  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '구독을 찾을 수 없습니다' });
  }

  subscriptions[index] = {
    ...subscriptions[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: '구독이 수정되었습니다',
    data: subscriptions[index],
  });
});

// ─────────────────────────────────────────────
// DELETE /api/subscriptions/:id - 구독 삭제
// ─────────────────────────────────────────────
app.delete('/api/subscriptions/:id', (req, res) => {
  const id = Number(req.params.id);

  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '구독을 찾을 수 없습니다' });
  }

  const deleted = subscriptions[index];
  subscriptions.splice(index, 1);

  res.json({
    success: true,
    message: '구독이 삭제되었습니다',
    data: deleted,
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
