/**
 * =============================================
 * Step 7: DELETE 요청 처리하기
 * =============================================
 *
 * DELETE 요청으로 데이터를 삭제하는 방법을 배웁니다.
 *
 * 삭제 방식:
 *   Hard Delete → 데이터를 배열에서 완전히 제거 (splice)
 *   Soft Delete → deleted 플래그만 추가 (복구 가능)
 *
 * 실행 방법: node steps/step7-delete.js
 *
 * 테스트: curl -X DELETE http://localhost:8080/api/subscriptions/1
 */

import express from 'express';

const app = express();
const PORT = 8080;

app.use(express.json());

// 임시 데이터
let subscriptions = [
  { id: 1, service: 'Netflix', price: 9900, cycle: 'monthly', startDate: '2024-01-01' },
  { id: 2, service: 'YouTube Premium', price: 14900, cycle: 'monthly', startDate: '2024-01-15' },
  { id: 3, service: 'Spotify', price: 10900, cycle: 'monthly', startDate: '2024-02-01' },
  { id: 4, service: 'Disney+', price: 9900, cycle: 'monthly', startDate: '2024-03-01' },
  { id: 5, service: 'ChatGPT Plus', price: 22000, cycle: 'monthly', startDate: '2024-04-01' },
];

// 목록 조회 (완성됨)
app.get('/api/subscriptions', (req, res) => {
  res.json({
    success: true,
    count: subscriptions.length,
    data: subscriptions,
  });
});

// ─────────────────────────────────────────────
// TODO 1: 단일 삭제 (Hard Delete)
// ─────────────────────────────────────────────
// DELETE /api/subscriptions/:id
//
// 순서:
// 1) req.params.id → Number로 변환
// 2) subscriptions.findIndex()로 해당 ID의 인덱스를 찾으세요
//    - 없으면 → 404 + { success: false, message: '구독을 찾을 수 없습니다' }
// 3) 삭제 전에 해당 데이터를 변수에 저장 (응답용)
// 4) subscriptions.splice(index, 1)로 배열에서 제거
// 5) 응답: { success: true, message: '구독이 삭제되었습니다', data: 삭제된데이터 }

app.delete('/api/subscriptions/:id', (req, res) => {

  // 1) 파라미터 ID를 숫자로 변환
  const id = Number(req.params.id);

  // 2) subscriptions.findIndex()로 인덱스 찾기
  const index = subscriptions.findIndex(s => s.id === id);

  // 인덱스가 -1이면 데이터가 없다는 뜻입니다.
  if (index === -1) {
    return res.status(404).json({ 
      success: false, 
      message: '삭제하려는 구독 정보를 찾을 수 없습니다.' 
    });
  }

  // 3) 삭제 전 응답을 위해 해당 데이터를 저장
  const deletedItem = subscriptions[index];

  // 4) splice(시작인덱스, 개수)로 배열에서 제거
  subscriptions.splice(index, 1);

  // 5) 결과 응답
  res.json({ 
    success: true, 
    message: '구독이 정상적으로 삭제되었습니다.', 
    data: deletedItem 
  });
});


// ─────────────────────────────────────────────
// TODO 2: 여러 항목 삭제
// ─────────────────────────────────────────────
// DELETE /api/subscriptions
//
// 요청 본문: { "ids": [1, 2, 3] }
//
// 순서:
// 1) req.body에서 ids를 꺼내세요
// 2) ids가 배열이 아니거나 비어있으면
//    → 400 + { success: false, message: 'ID 배열을 제공해주세요' }
// 3) ids를 순회하면서 각각 찾아서 삭제
//    - 찾은 것 → deletedItems 배열에 추가 후 splice
//    - 못 찾은 것 → notFoundIds 배열에 추가
// 4) 응답: { success: true, message: 'N개 항목이 삭제되었습니다', deleted: [...], notFound: [...] }
//
// 테스트:
//   curl -X DELETE http://localhost:8080/api/subscriptions \
//     -H "Content-Type: application/json" \
//     -d '{"ids": [1, 2, 999]}'

app.delete('/api/subscriptions', (req, res) => {
  
  // 1) req.body에서 ids 배열 꺼내기
  const { ids } = req.body;

  // 2) 유효성 검사: 배열이 아니거나 비어있는지 확인
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: '삭제할 ID 배열(ids)을 제공해주세요.' 
    });
  }

  const deletedItems = [];
  const notFoundIds = [];

  // 3) ids를 순회하면서 하나씩 처리
  ids.forEach(id => {
    const targetId = Number(id);
    const index = subscriptions.findIndex(s => s.id === targetId);

    if (index !== -1) {
      // 찾았을 경우: 삭제 배열에 담고 원본에서 제거
      deletedItems.push(subscriptions[index]);
      subscriptions.splice(index, 1);
    } else {
      // 못 찾았을 경우: 없는 ID 목록에 추가
      notFoundIds.push(id);
    }
  });

  // 4) 종합 결과 응답
  res.json({
    success: true,
    message: `${deletedItems.length}개의 항목이 삭제되었습니다.`,
    deleted: deletedItems,
    notFound: notFoundIds
  });
});

// ─────────────────────────────────────────────
// 서버 시작
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
