'use client';

import { useState } from 'react';

export default function LTVCalculatorPage() {
  const [productName, setProductName] = useState<string>('');
  const [orderValue, setOrderValue] = useState<number>(0);
  const [purchaseFrequency, setPurchaseFrequency] = useState<number>(0);
  const [ltv, setLTV] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  const calculate = () => {
    if (orderValue <= 0 || purchaseFrequency <= 0) {
      alert('주문액과 구매 빈도를 올바르게 입력해주세요.');
      return;
    }

    // LTV = 주문액 × 구매 빈도
    const calculatedLTV = orderValue * purchaseFrequency;
    setLTV(calculatedLTV);
    console.log('LTV 계산 완료:', { orderValue, purchaseFrequency, ltv: calculatedLTV });
  };

  // AI로 상품 정보 추정
  const estimateProductInfo = async () => {
    if (!productName.trim()) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }

    setLoadingAI(true);
    console.log('AI 상품 정보 추정 시작:', productName);

    try {
      const response = await fetch('/api/estimate-business-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: productName, metricType: 'ltv' }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
        const errorDetails = result.details ? `\n상세: ${result.details}` : '';
        const errorHint = result.hint ? `\n힌트: ${result.hint}` : '';
        throw new Error(errorMessage + errorDetails + errorHint);
      }

      if (result.success && result.data) {
        setOrderValue(result.data.orderValue);
        setPurchaseFrequency(result.data.purchaseFrequency);
        console.log('AI 상품 정보 추정 완료:', result.data);
      }
    } catch (error: any) {
      console.error('AI 상품 정보 추정 오류:', error);
      alert(error.message || '상품 정보 추정 중 오류가 발생했습니다.');
    } finally {
      setLoadingAI(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">2단계: LTV 계산기</h1>
            <p className="text-gray-600">
              주문액과 구매 빈도를 기반으로 고객 생애 가치(LTV)를 계산합니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (AI 자동 입력)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 노트북"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productName.trim()) {
                      estimateProductInfo();
                    }
                  }}
                />
                <button
                  onClick={estimateProductInfo}
                  disabled={!productName.trim() || loadingAI}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                  title="AI로 주문액과 구매 빈도 자동 추정"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평균 주문액 (원)
                </label>
                <input
                  type="number"
                  value={orderValue || ''}
                  onChange={(e) => setOrderValue(Number(e.target.value))}
                  placeholder="예: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">고객이 한 번 주문할 때 평균적으로 지출하는 금액</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매 빈도 (회)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={purchaseFrequency || ''}
                  onChange={(e) => setPurchaseFrequency(Number(e.target.value))}
                  placeholder="예: 4.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">고객이 평생 동안 구매하는 횟수</p>
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              계산하기
            </button>

            {ltv !== null && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">고객 생애 가치 (LTV)</p>
                  <p className="text-4xl font-bold text-blue-600 mb-4">
                    {formatNumber(ltv)}원
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>평균 주문액:</strong> {formatNumber(orderValue)}원
                    </p>
                    <p>
                      <strong>구매 빈도:</strong> {purchaseFrequency.toFixed(1)}회
                    </p>
                    <p>
                      <strong>LTV:</strong> {formatNumber(ltv)}원
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>해석:</strong> 한 고객이 평생 동안 당신의 비즈니스에 기여하는 총 가치입니다.
                    이 값이 높을수록 고객의 장기적 가치가 크다는 의미입니다.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
              <p className="text-gray-700">
                <strong>LTV (고객 생애 가치)</strong> = 평균 주문액 × 구매 빈도
              </p>
              <p className="text-sm text-gray-600 mt-2">
                LTV는 한 고객이 평생 동안 비즈니스에 기여하는 총 가치를 나타냅니다.
                이 값을 통해 고객 획득에 투자할 수 있는 최대 비용을 판단할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

