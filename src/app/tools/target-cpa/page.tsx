'use client';

import { useState } from 'react';

interface ProductData {
  productName: string;
  sellingPrice: number;
  cost: number;
  targetCPA: number;
}

export default function TargetCPAPage() {
  const [productName, setProductName] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [targetCPA, setTargetCPA] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [loadingAllAI, setLoadingAllAI] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

  const calculate = () => {
    if (sellingPrice <= 0 || cost < 0) {
      alert('판매가와 원가를 올바르게 입력해주세요.');
      return;
    }

    if (cost >= sellingPrice) {
      alert('원가는 판매가보다 작아야 합니다.');
      return;
    }

    // 목표 CPA = 판매가 - 원가 (순이익)
    const calculatedCPA = sellingPrice - cost;
    setTargetCPA(calculatedCPA);
    console.log('목표 CPA 계산 완료:', { sellingPrice, cost, targetCPA: calculatedCPA });
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
        body: JSON.stringify({ productName: productName, metricType: 'cpa' }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
        const errorDetails = result.details ? `\n상세: ${result.details}` : '';
        const errorHint = result.hint ? `\n힌트: ${result.hint}` : '';
        throw new Error(errorMessage + errorDetails + errorHint);
      }

      if (result.success && result.data) {
        setSellingPrice(result.data.sellingPrice);
        setCost(result.data.cost);
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
    // 상품명을 쉼표로 구분하여 파싱
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
      // 모든 상품을 병렬로 분석
      const promises = productNames.map(async (name) => {
        try {
          const response = await fetch('/api/estimate-business-metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productName: name, metricType: 'cpa' }),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
            throw new Error(`${name}: ${errorMessage}`);
          }

          if (result.success && result.data) {
            const calculatedCPA = result.data.sellingPrice - result.data.cost;
            return {
              success: true,
              productName: name,
              sellingPrice: result.data.sellingPrice,
              cost: result.data.cost,
              targetCPA: calculatedCPA,
            };
          }
          return { success: false, productName: name, error: '응답 데이터가 없습니다.' };
        } catch (error: any) {
          console.error(`${name} AI 분석 오류:`, error);
          return { success: false, productName: name, error: error.message };
        }
      });

      const results = await Promise.allSettled(promises);

      // 성공한 상품들만 필터링
      const successfulProducts: ProductData[] = [];
      const failedProducts: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          // 타입 가드: success가 true일 때만 해당 필드에 접근
          const product = result.value as {
            success: true;
            productName: string;
            sellingPrice: number;
            cost: number;
            targetCPA: number;
          };
          successfulProducts.push({
            productName: product.productName,
            sellingPrice: product.sellingPrice,
            cost: product.cost,
            targetCPA: product.targetCPA,
          });
        } else {
          failedProducts.push(productNames[index]);
        }
      });

      setAllProducts(successfulProducts);

      // 결과 메시지 표시
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">1단계: 목표 CPA 계산기</h1>
            <p className="text-gray-600">
              판매가와 원가를 기반으로 1회 전환당 최대 광고비를 계산합니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (AI 자동 입력) - 여러 상품은 쉼표로 구분
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 갤럭시 S24, 노트북"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productName.trim()) {
                      estimateProductInfo();
                    }
                  }}
                />
                <button
                  onClick={estimateProductInfo}
                  disabled={!productName.trim() || loadingAI}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                  title="AI로 판매가와 원가 자동 추정 (첫 번째 상품만)"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
              <button
                onClick={estimateAllProducts}
                disabled={!productName.trim() || loadingAllAI}
                className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
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
                  판매가 (원)
                </label>
                <input
                  type="number"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  placeholder="예: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  원가 (원)
                </label>
                <input
                  type="number"
                  value={cost || ''}
                  onChange={(e) => setCost(Number(e.target.value))}
                  placeholder="예: 30000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md"
            >
              계산하기
            </button>

            {allProducts.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 전체 상품 분석 결과</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-purple-600 text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left">상품명</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">판매가</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">원가</th>
                        <th className="border border-gray-300 px-4 py-3 text-right">목표 CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{product.productName}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(product.sellingPrice)}원</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">{formatNumber(product.cost)}원</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold text-purple-600">{formatNumber(product.targetCPA)}원</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>해석:</strong> 목표 CPA가 높을수록 광고비 여유가 큽니다. 목표 CPA 이하의 광고비로 고객을 획득해야 수익성이 보장됩니다.
                  </p>
                </div>
              </div>
            )}

            {targetCPA !== null && allProducts.length === 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">1회 전환당 최대 광고비 (목표 CPA)</p>
                  <p className="text-4xl font-bold text-purple-600 mb-4">
                    {formatNumber(targetCPA)}원
                  </p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>판매가:</strong> {formatNumber(sellingPrice)}원
                    </p>
                    <p>
                      <strong>원가:</strong> {formatNumber(cost)}원
                    </p>
                    <p>
                      <strong>순이익:</strong> {formatNumber(targetCPA)}원
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>해석:</strong> 이 금액을 초과하는 광고비로 고객을 획득하면 손해가 발생합니다.
                    목표 CPA 이하의 광고비로 고객을 획득해야 수익성이 보장됩니다.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
              <p className="text-gray-700">
                <strong>목표 CPA</strong> = 판매가 - 원가
              </p>
              <p className="text-sm text-gray-600 mt-2">
                목표 CPA는 1회 전환당 지불할 수 있는 최대 광고비를 의미합니다.
                이 금액을 초과하면 손해가 발생하므로, 이 값 이하로 고객을 획득해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

