'use client';

import { useState } from 'react';

export default function BreakEvenPage() {
  const [productName, setProductName] = useState<string>('');
  const [fixedCost, setFixedCost] = useState<number>(0); // 총 고정비
  const [variableCost, setVariableCost] = useState<number>(0); // 제품 1개당 변동비
  const [sellingPrice, setSellingPrice] = useState<number>(0); // 1개당 판매가
  const [breakEvenQuantity, setBreakEvenQuantity] = useState<number | null>(null);
  const [contributionMargin, setContributionMargin] = useState<number | null>(null); // 공헌이익
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  const calculate = () => {
    if (fixedCost <= 0 || variableCost < 0 || sellingPrice <= 0) {
      alert('모든 값을 올바르게 입력해주세요.');
      return;
    }

    if (variableCost >= sellingPrice) {
      alert('변동비는 판매가보다 작아야 합니다.');
      return;
    }

    // 공헌이익 = 판매가 - 변동비
    const margin = sellingPrice - variableCost;
    setContributionMargin(margin);

    // 손익분기점 = 고정비 / 공헌이익
    const quantity = fixedCost / margin;
    setBreakEvenQuantity(Math.ceil(quantity)); // 올림 처리
    console.log('손익분기점 계산 완료:', { fixedCost, variableCost, sellingPrice, breakEvenQuantity: Math.ceil(quantity) });
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
        body: JSON.stringify({ productName: productName, metricType: 'break-even' }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
        const errorDetails = result.details ? `\n상세: ${result.details}` : '';
        const errorHint = result.hint ? `\n힌트: ${result.hint}` : '';
        throw new Error(errorMessage + errorDetails + errorHint);
      }

      if (result.success && result.data) {
        setFixedCost(result.data.fixedCost);
        setVariableCost(result.data.variableCost);
        setSellingPrice(result.data.sellingPrice);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">손익분기점 계산기</h1>
            <p className="text-gray-600">
              고정비, 변동비, 판매가를 입력하여 본전을 달성하기 위한 최소 판매 수량을 계산합니다
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명 (AI 자동 입력)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="예: 아이폰 15, 노트북"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && productName.trim()) {
                      estimateProductInfo();
                    }
                  }}
                />
                <button
                  onClick={estimateProductInfo}
                  disabled={!productName.trim() || loadingAI}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
                  title="AI로 고정비, 변동비, 판매가 자동 추정"
                >
                  {loadingAI ? 'AI 분석 중...' : '🤖 AI'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  총 고정비 (원/월)
                </label>
                <input
                  type="number"
                  value={fixedCost || ''}
                  onChange={(e) => setFixedCost(Number(e.target.value))}
                  placeholder="예: 5000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">월세, 인건비, 관리비 등</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품 1개당 변동비 (원)
                </label>
                <input
                  type="number"
                  value={variableCost || ''}
                  onChange={(e) => setVariableCost(Number(e.target.value))}
                  placeholder="예: 30000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">원가, 재료비 등</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1개당 판매가 (원)
                </label>
                <input
                  type="number"
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  placeholder="예: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">제품 판매 가격</p>
              </div>
            </div>

            <button
              onClick={calculate}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md"
            >
              계산하기
            </button>

            {breakEvenQuantity !== null && contributionMargin !== null && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border-l-4 border-orange-500">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
                  <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                    <p className="text-sm text-gray-600 mb-2">손익분기점 (최소 판매 수량)</p>
                    <p className="text-4xl font-bold text-orange-600 mb-4">
                      {formatNumber(breakEvenQuantity)}개
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>총 고정비:</strong> {formatNumber(fixedCost)}원/월
                      </p>
                      <p>
                        <strong>1개당 공헌이익:</strong> {formatNumber(contributionMargin)}원
                      </p>
                      <p>
                        <strong>1개당 판매가:</strong> {formatNumber(sellingPrice)}원
                      </p>
                      <p>
                        <strong>1개당 변동비:</strong> {formatNumber(variableCost)}원
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 목표 제시</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      <strong className="text-blue-600">손익분기점을 넘기려면 매월 <span className="text-2xl font-bold">{formatNumber(breakEvenQuantity)}개</span>의 제품을 판매해야 합니다.</strong>
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>• 이 수량을 달성하면 수익이 0원이 되어 본전을 회수합니다.</p>
                      <p>• 이 수량보다 많이 판매하면 이익이 발생합니다.</p>
                      <p>• 이 수량보다 적게 판매하면 손해가 발생합니다.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-800 mb-2">✅ 이 수량을 달성하면</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 총 수익 = 총 비용 (본전)</li>
                      <li>• 손익 없음 (수익 0원)</li>
                      <li>• 고정비 회수 완료</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-800 mb-2">📈 이 수량을 초과하면</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 추가 판매분만큼 이익 발생</li>
                      <li>• 1개당 {formatNumber(contributionMargin)}원의 순이익</li>
                      <li>• 사업 성장 가능</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>공헌이익</strong> = 판매가 - 변동비
                </p>
                <p>
                  <strong>손익분기점 (수량)</strong> = 총 고정비 ÷ 공헌이익
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  손익분기점은 총 수익과 총 비용이 같아지는 지점입니다. 이 수량을 판매하면 
                  고정비를 모두 회수할 수 있으며, 그 이후 판매분부터 순이익이 발생합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

