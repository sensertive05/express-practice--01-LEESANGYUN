/**
 * =============================================
 * Step 5: POST 요청 처리하기
 * =============================================
 *
 * POST 요청으로 새 데이터를 생성하는 방법을 배웁니다.
 *
 * 핵심:
 * - express.json() 미들웨어 → req.body 사용 가능
 * - req.body에서 전송된 데이터를 꺼냄
 * - 검증 후 배열에 push
 * - 201 Created 상태 코드로 응답
 *
 * 실행 방법: node steps/step5-post.js
 *
 * 테스트 (터미널에서):
 *   curl -X POST http://localhost:8080/api/subscriptions \
 *     -H "Content-Type: application/json" \
 *     -d '{"service":"Disney+","price":9900,"cycle":"monthly","startDate":"2024-03-01"}'
 */

import express from 'express';

const app = express();
const PORT = 8080;

// ─────────────────────────────────────────────
// TODO 1: JSON 파싱 미들웨어 등록
// ─────────────────────────────────────────────
// 이게 없으면 req.body가 undefined입니다!
// 힌트: app.use(express.???());



// 임시 데이터 (let으로 선언 - push로 추가할 것이므로)
let subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
];

// 목록 조회 (완성됨)
app.get('/api/subscriptions', (req, res) => {
  res.json({ success: true, count: subscriptions.length, data: subscriptions });
});


// ─────────────────────────────────────────────
// TODO 2: 검증 함수 만들기
// ─────────────────────────────────────────────
function validateSubscription(data) {
  const errors = [];
  const { service, price, cycle, startDate } = data;

  // 1. 서비스 이름 확인
  if (!service) errors.push('서비스 이름은 필수입니다');

  // 2. 가격 확인
  if (price === undefined || price === null) {
    errors.push('가격은 필수입니다');
  } else if (typeof price !== 'number' || price <= 0) {
    errors.push('가격은 양수여야 합니다');
  }

  // 3. 주기 확인 (포함 여부 체크)
  const validCycles = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!validCycles.includes(cycle)) {
    errors.push('올바른 구독 주기가 아닙니다');
  }

  // 4. 시작일 확인
  if (!startDate) errors.push('시작일은 필수입니다');

  return errors;
}

// ─────────────────────────────────────────────
// TODO 3: POST 라우트 만들기
// ─────────────────────────────────────────────
app.post('/api/subscriptions', (req, res) => {
  // 1) 데이터 꺼내기
  const { service, price, cycle, startDate } = req.body;

  // 2) 검증 실행
  const errors = validateSubscription(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // 3) 중복 검사 (이미 같은 이름의 서비스가 있는지 확인)
  const isDuplicate = subscriptions.some(s => s.service === service);
  if (isDuplicate) {
    return res.status(409).json({ success: false, message: '이미 존재하는 구독입니다' });
  }

  // 4) 새 ID 생성 (가장 큰 ID 값 + 1)
  // 데이터가 하나도 없을 경우를 대비해 기본값 1을 설정해주는 게 안전해요!
  const nextId = subscriptions.length > 0 
    ? Math.max(...subscriptions.map(s => s.id)) + 1 
    : 1;

  // 5) 새 객체 생성 및 배열에 추가
  const newSubscription = {
    id: nextId,
    service,
    price,
    cycle,
    startDate
  };
  subscriptions.push(newSubscription);

  // 6) 결과 응답
  res.status(201).json({ success: true, data: newSubscription });
});


// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
