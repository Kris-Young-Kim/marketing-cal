'use client';

import { useState } from 'react';

interface ProductData {
  productName: string;
  ltv: number;
  cac: number;
  ratio: number;
  healthStatus: string;
  healthColor: string;
}

export default function LTVCACRatioPage() {
  const [productName, setProductName] = useState<string>('');
  const [ltv, setLTV] = useState<number>(0);
  const [cac, setCAC] = useState<number>(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [healthColor, setHealthColor] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [loadingAllAI, setLoadingAllAI] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

  const calculate = () => {
    if (ltv <= 0 || cac <= 0) {
      alert('LTV와 CAC를 올바르게 입력해주세요.');
      return;
    }

    // LTV:CAC 비율 계산
    const calculatedRatio = ltv / cac;
    setRatio(calculatedRatio);

    // 마케팅 건전성 판정
    let status = '';
    let color = '';

    if (calculatedRatio >= 3) {
      status = '건강함 (3:1 이상)';
      color = 'green';
    } else if (calculatedRatio >= 2) {
      status = '양호함 (2:1 이상)';
      color = 'blue';
    } else if (calculatedRatio >= 1) {
      status = '주의 필요 (1:1 이상)';
      color = 'yellow';
    } else {
      status = '위험함 (1:1 미만)';
      color = 'red';
    }

    setHealthStatus(status);
    setHealthColor(color);
    console.log('LTV:CAC 비율 계산 완료:', { ltv, cac, ratio: calculatedRatio, status });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  const formatRatio = (num: number): string => {
    return num.toFixed(2);
  };

  // AI로 LTV와 CAC 추정 (단일)
  const estimateMetrics = async () => {
    if (!productName.trim()) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }

    setLoadingAI(true);
    console.log('AI 지표 추정 시작:', productName);

    try {
      // LTV 추정
      const ltvResponse = await fetch('/api/estimate-business-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: productName, metricType: 'ltv' }),
      });

      const ltvResult = await ltvResponse.json();

      if (!ltvResponse.ok) {
        throw new Error(ltvResult.error || 'LTV 추정에 실패했습니다.');
      }

      // CAC 추정
      const cacResponse = await fetch('/api/estimate-business-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: productName, metricType: 'cac' }),
      });

      const cacResult = await cacResponse.json();

      if (!cacResponse.ok) {
        throw new Error(cacResult.error || 'CAC 추정에 실패했습니다.');
      }

      if (ltvResult.success && ltvResult.data && cacResult.success && cacResult.data) {
        // LTV 계산: 주문액 × 구매 빈도
        const calculatedLTV = ltvResult.data.orderValue * ltvResult.data.purchaseFrequency;
        setLTV(Math.round(calculatedLTV));
        setCAC(cacResult.data.cac);
        console.log('AI 지표 추정 완료:', { ltv: calculatedLTV, cac: cacResult.data.cac });
      }
    } catch (error: any) {
      console.error('AI 지표 추정 오류:', error);
      alert(error.message || '지표 추정 중 오류가 발생했습니다.');
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
          // LTV와 CAC를 병렬로 추정
          const [ltvResponse, cacResponse] = await Promise.all([
            fetch('/api/estimate-business-metrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productName: name, metricType: 'ltv' }),
            }),
            fetch('/api/estimate-business-metrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productName: name, metricType: 'cac' }),
            }),
          ]);

          const ltvResult = await ltvResponse.json();
          const cacResult = await cacResponse.json();

          if (!ltvResponse.ok || !cacResponse.ok) {
            throw new Error(`${name}: ${ltvResult.error || cacResult.error || '지표 추정에 실패했습니다.'}`);
          }

          if (ltvResult.success && ltvResult.data && cacResult.success && cacResult.data) {
            const calculatedLTV = ltvResult.data.orderValue * ltvResult.data.purchaseFrequency;
            const calculatedRatio = calculatedLTV / cacResult.data.cac;

            let status = '';
            let color = '';
            if (calculatedRatio >= 3) {
              status = '건강함 (3:1 이상)';
              color = 'green';
            } else if (calculatedRatio >= 2) {
              status = '양호함 (2:1 이상)';
              color = 'blue';
            } else if (calculatedRatio >= 1) {
              status = '주의 필요 (1:1 이상)';
              color = 'yellow';
            } else {
              status = '위험함 (1:1 미만)';
              color = 'red';
            }

            return {
              success: true,
              productName: name,
              ltv: Math.round(calculatedLTV),
              cac: cacResult.data.cac,
              ratio: calculatedRatio,
              healthStatus: status,
              healthColor: color,
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
            ltv: number;
            cac: number;
            ratio: number;
            healthStatus: string;
            healthColor: string;
          };
          successfulProducts.push({
            productName: product.productName,
            ltv: product.ltv,
            cac: product.cac,
            ratio: product.ratio,
            healthStatus: product.healthStatus,
            healthColor: product.healthColor,
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

  const getHealthColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'blue':
        return 'bg-blue-50 border-blue-500 text-blue-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'red':
        return 'bg-red-50 border-red-500 text-red-800';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">3단계: LTV:CAC 비율 계산기</h1>
            <p className="text-gray-600">
              LTV와 CAC를 입력받아 마케팅 건전성을 판정하고 광고 예산 최적화를 도와줍니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (AI 자동 입력) - 여러 상품은 쉼표로 구분
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 갤럭시 S24, 노트북"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productName.trim()) {
                      estimateMetrics();
                    }
                  }}
                />
                <button
                  onClick={estimateMetrics}
                  disabled={!productName.trim() || loadingAI}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                  title="AI로 LTV와 CAC 자동 추정 (첫 번째 상품만)"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
              <button
                onClick={estimateAllProducts}
                disabled={!productName.trim() || loadingAllAI}
                className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
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
                  LTV (고객 생애 가치, 원)
                </label>
                <input
                  type="number"
                  value={ltv || ''}
                  onChange={(e) => setLTV(Number(e.target.value))}
                  placeholder="예: 200000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">2단계에서 계산한 LTV 값을 입력하세요</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAC (고객 획득 비용, 원)
                </label>
                <input
                  type="number"
                  value={cac || ''}
                  onChange={(e) => setCAC(Number(e.target.value))}
                  placeholder="예: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">고객 1명을 획득하는 데 드는 총 비용</p>
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              계산하기
            </button>

            {allProducts.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 전체 상품 분석 결과</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left">상품명</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">LTV</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">CAC</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">비율</th>
                        <th className="border border-gray-300 px-4 py-3 text-center">건전성</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{product.productName}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(product.ltv)}원</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(product.cac)}원</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold text-green-600">{formatRatio(product.ratio)}:1</td>
                          <td className={`border border-gray-300 px-4 py-2 text-center ${getHealthColorClass(product.healthColor)}`}>
                            {product.healthStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>해석:</strong> 비율이 3:1 이상이면 건강한 상태입니다. 광고 예산을 늘려도 안전합니다.
                  </p>
                </div>
              </div>
            )}

            {ratio !== null && allProducts.length === 0 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
                  <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                    <p className="text-sm text-gray-600 mb-2">LTV:CAC 비율</p>
                    <p className="text-4xl font-bold text-green-600 mb-4">
                      {formatRatio(ratio)}:1
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>LTV:</strong> {formatNumber(ltv)}원
                      </p>
                      <p>
                        <strong>CAC:</strong> {formatNumber(cac)}원
                      </p>
                    </div>
                  </div>
                  
                  <div className={`rounded-lg p-5 border-l-4 ${getHealthColorClass(healthColor)}`}>
                    <h3 className="text-xl font-bold mb-2">🏥 마케팅 건전성 판정</h3>
                    <p className="text-2xl font-semibold mb-3">{healthStatus}</p>
                    <div className="text-sm space-y-2">
                      {ratio >= 3 && (
                        <p>
                          ✅ <strong>건강함:</strong> LTV가 CAC의 3배 이상이므로 마케팅이 매우 효율적입니다.
                          광고 예산을 늘려도 안전합니다.
                        </p>
                      )}
                      {ratio >= 2 && ratio < 3 && (
                        <p>
                          ✅ <strong>양호함:</strong> LTV가 CAC의 2배 이상입니다. 마케팅이 효율적으로 진행되고 있습니다.
                          광고 예산을 점진적으로 늘릴 수 있습니다.
                        </p>
                      )}
                      {ratio >= 1 && ratio < 2 && (
                        <p>
                          ⚠️ <strong>주의 필요:</strong> LTV가 CAC보다 크지만 여유가 적습니다.
                          광고 효율을 개선하거나 LTV를 높이는 전략이 필요합니다.
                        </p>
                      )}
                      {ratio < 1 && (
                        <p>
                          ❌ <strong>위험함:</strong> CAC가 LTV보다 큽니다. 즉시 광고 전략을 재검토해야 합니다.
                          광고비를 줄이거나 LTV를 높이는 것이 시급합니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="font-semibold text-gray-800 mb-2">💡 광고 예산 최적화 가이드</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>3:1 이상:</strong> 광고 예산을 늘려도 안전합니다. 성장 기회를 놓치지 마세요.</li>
                    <li>• <strong>2:1 ~ 3:1:</strong> 광고 예산을 점진적으로 늘리면서 모니터링하세요.</li>
                    <li>• <strong>1:1 ~ 2:1:</strong> 광고 효율 개선에 집중하세요. LTV 향상 전략을 고려하세요.</li>
                    <li>• <strong>1:1 미만:</strong> 즉시 광고비를 줄이거나 광고 전략을 전면 재검토하세요.</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
              <p className="text-gray-700">
                <strong>LTV:CAC 비율</strong> = LTV ÷ CAC
              </p>
              <p className="text-sm text-gray-600 mt-2">
                이 비율은 마케팅의 건강성을 나타내는 핵심 지표입니다.
                일반적으로 3:1 이상이면 건강한 상태로 간주되며, 광고 예산을 늘려도 안전합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

