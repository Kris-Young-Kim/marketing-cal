'use client';

import { useState } from 'react';

interface ProductData {
  productName: string;
  orderValue: number;
  purchaseFrequency: number;
  ltv: number;
}

export default function LTVCalculatorPage() {
  const [productName, setProductName] = useState<string>('');
  const [orderValue, setOrderValue] = useState<number>(0);
  const [purchaseFrequency, setPurchaseFrequency] = useState<number>(0);
  const [ltv, setLTV] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [loadingAllAI, setLoadingAllAI] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

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

  // AI로 상품 정보 추정 (단일)
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

  // 전체 상품 AI 분석
  const estimateAllProducts = async () => {
    const productNames = productName
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (productNames.length === 0) {
      alert('분석할 상품명을 입력해주세요. (쉼표로 구분)');
      return;
    }

    setLoadingAllAI(true);
    console.log('전체 AI 분석 시작:', productNames.length, '개 상품');

    try {
      const promises = productNames.map(async (name) => {
        try {
          const response = await fetch('/api/estimate-business-metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productName: name, metricType: 'ltv' }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(`${name}: ${result.error || '상품 정보 추정에 실패했습니다.'}`);
          }

          if (result.success && result.data) {
            const calculatedLTV = result.data.orderValue * result.data.purchaseFrequency;
            return {
              success: true,
              productName: name,
              orderValue: result.data.orderValue,
              purchaseFrequency: result.data.purchaseFrequency,
              ltv: calculatedLTV,
            };
          }
          return { success: false, productName: name, error: '응답 데이터가 없습니다.' };
        } catch (error: any) {
          console.error(`${name} AI 분석 오류:`, error);
          return { success: false, productName: name, error: error.message };
        }
      });

      const results = await Promise.allSettled(promises);

      const successfulProducts: ProductData[] = [];
      const failedProducts: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          // 타입 가드: success가 true일 때만 해당 필드에 접근
          const product = result.value as {
            success: true;
            productName: string;
            orderValue: number;
            purchaseFrequency: number;
            ltv: number;
          };
          successfulProducts.push({
            productName: product.productName,
            orderValue: product.orderValue,
            purchaseFrequency: product.purchaseFrequency,
            ltv: product.ltv,
          });
        } else {
          failedProducts.push(productNames[index]);
        }
      });

      setAllProducts(successfulProducts);

      if (failedProducts.length === 0) {
        alert(`✅ 전체 ${successfulProducts.length}개 상품 분석이 완료되었습니다!`);
      } else {
        alert(`⚠️ ${successfulProducts.length}개 상품 분석 완료, ${failedProducts.length}개 실패\n\n실패한 상품: ${failedProducts.join(', ')}`);
      }

      console.log('전체 AI 분석 완료:', { successfulProducts, failedProducts });
    } catch (error: any) {
      console.error('전체 AI 분석 오류:', error);
      alert('전체 분석 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoadingAllAI(false);
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
                상품명 (AI 자동 입력) - 여러 상품은 쉼표로 구분
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 갤럭시 S24, 노트북"
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
                  title="AI로 주문액과 구매 빈도 자동 추정 (첫 번째 상품만)"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
              <button
                onClick={estimateAllProducts}
                disabled={!productName.trim() || loadingAllAI}
                className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                title="모든 상품을 한 번에 AI 분석"
              >
                {loadingAllAI ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>전체 AI 분석 중...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>전체 AI 분석</span>
                  </>
                )}
              </button>
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

            {allProducts.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 전체 상품 분석 결과</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left">상품명</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">평균 주문액</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">구매 빈도</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">LTV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{product.productName}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(product.orderValue)}원</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{product.purchaseFrequency.toFixed(1)}회</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold text-blue-600">{formatNumber(product.ltv)}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>해석:</strong> LTV가 높을수록 고객의 장기적 가치가 큽니다. 이 값을 통해 고객 획득에 투자할 수 있는 최대 비용을 판단할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {ltv !== null && allProducts.length === 0 && (
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
