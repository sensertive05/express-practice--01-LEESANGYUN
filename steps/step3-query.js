/**
 * =============================================
 * Step 3: 쿼리스트링 처리하기
 * =============================================
 *
 * URL 쿼리 파라미터로 데이터를 필터링하는 방법을 배웁니다.
 *
 * 쿼리스트링 = URL의 ? 뒤에 오는 키-값 쌍
 * 예: /api/subscriptions?service=Netflix&minPrice=10000
 *
 * req.query 객체로 접근합니다.
 *
 * 실행 방법: node steps/step3-query.js
 */

import express from 'express';

const app = express();
const PORT = 8080;

const subscriptions = [
  { id: 1, service: 'Netflix',        price: 9900,  cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium',price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify',        price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
  { id: 4, service: 'Adobe CC',       price: 79000, cycle: 'yearly',  startDate: '2024-03-01' },
  { id: 5, service: 'GitHub Pro',     price: 4000,  cycle: 'monthly', startDate: '2024-03-15' },
  { id: 6, service: 'ChatGPT Plus',   price: 22000, cycle: 'monthly', startDate: '2024-04-01' },
  { id: 7, service: 'Disney+',        price: 9900,  cycle: 'monthly', startDate: '2024-04-15' },
  { id: 8, service: 'Microsoft 365',  price: 89000, cycle: 'yearly',  startDate: '2024-05-01' },
];

// TODO 1: 쿼리 파라미터 읽어보기
app.get('/api/debug-query', (req, res) => {
  const { service, cycle } = req.query;
  res.json({
    service,
    cycle,
    allParams: req.query,
  });
});

// TODO 2~4: 필터링 + 정렬 + 페이지네이션
app.get('/api/subscriptions', (req, res) => {
  const { service, cycle, minPrice, maxPrice, sort, order = 'asc', page, limit } = req.query;

  let results = [...subscriptions];

  // TODO 2a: service 필터링 (부분 일치, 대소문자 무시)
  if (service) {
    results = results.filter((s) =>
      s.service.toLowerCase().includes(service.toLowerCase())
    );
  }

  // TODO 2b: cycle 필터링 (정확히 일치)
  if (cycle) {
    results = results.filter((s) => s.cycle === cycle);
  }

  // TODO 2c: minPrice 필터링
  if (minPrice) {
    results = results.filter((s) => s.price >= Number(minPrice));
  }

  // TODO 2d: maxPrice 필터링
  if (maxPrice) {
    results = results.filter((s) => s.price <= Number(maxPrice));
  }

  // TODO 3: 정렬
  if (sort) {
    results.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      // 문자열이면 소문자로 변환해서 비교
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // TODO 4: 페이지네이션
  if (page && limit) {
    const pageNum  = Number(page);
    const limitNum = Number(limit);
    const total      = results.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;

    results = results.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      data: results,
    });
  }

  // 기본 응답
  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
