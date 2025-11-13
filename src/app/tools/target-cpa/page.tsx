'use client';

import { useState } from 'react';

export default function TargetCPAPage() {
  const [productName, setProductName] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [targetCPA, setTargetCPA] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

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
                상품명 (AI 자동 입력)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 노트북"
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
                  title="AI로 판매가와 원가 자동 추정"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
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

            {targetCPA !== null && (
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

