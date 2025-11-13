'use client';

import { useState, useEffect } from 'react';

interface ConversionData {
  monthlyVisitors: number; // 월간 방문자 수
  currentConversionRate: number; // 현재 전환율 (%)
  improvedConversionRate: number; // 개선된 전환율 (%)
  averageOrderValue: number; // 평균 주문 금액
}

interface CalculationResult {
  currentConversions: number; // 현재 전환수
  improvedConversions: number; // 개선된 전환수
  additionalConversions: number; // 추가 확보 전환수
  monthlyRevenueIncrease: number; // 월간 예상 매출 증가액
  annualRevenueIncrease: number; // 연간 예상 매출 증가액
  conversionRateImprovement: number; // 전환율 개선율 (%)
}

export default function ConversionOptimizationPage() {
  const [data, setData] = useState<ConversionData>({
    monthlyVisitors: 0,
    currentConversionRate: 0,
    improvedConversionRate: 0,
    averageOrderValue: 0,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  // 실시간 계산
  useEffect(() => {
    if (
      data.monthlyVisitors > 0 &&
      data.currentConversionRate >= 0 &&
      data.improvedConversionRate >= 0 &&
      data.averageOrderValue >= 0 &&
      data.improvedConversionRate >= data.currentConversionRate
    ) {
      const currentConversions = (data.monthlyVisitors * data.currentConversionRate) / 100;
      const improvedConversions = (data.monthlyVisitors * data.improvedConversionRate) / 100;
      const additionalConversions = improvedConversions - currentConversions;
      const monthlyRevenueIncrease = additionalConversions * data.averageOrderValue;
      const annualRevenueIncrease = monthlyRevenueIncrease * 12;
      const conversionRateImprovement =
        data.currentConversionRate > 0
          ? ((data.improvedConversionRate - data.currentConversionRate) / data.currentConversionRate) * 100
          : 0;

      const calculationResult: CalculationResult = {
        currentConversions: Math.round(currentConversions * 100) / 100,
        improvedConversions: Math.round(improvedConversions * 100) / 100,
        additionalConversions: Math.round(additionalConversions * 100) / 100,
        monthlyRevenueIncrease: Math.round(monthlyRevenueIncrease),
        annualRevenueIncrease: Math.round(annualRevenueIncrease),
        conversionRateImprovement: Math.round(conversionRateImprovement * 100) / 100,
      };

      setResult(calculationResult);
      console.log('전환율 최적화 계산 완료:', calculationResult);
    } else {
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.monthlyVisitors, data.currentConversionRate, data.improvedConversionRate, data.averageOrderValue]);

  const updateData = (field: keyof ConversionData, value: number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  const formatDecimal = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">전환율 최적화(CRO) 계산 도구</h1>
          <p className="text-gray-600 mb-6">
            전환율 개선이 비즈니스에 미치는 영향을 실시간으로 계산하고 분석하세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월간 방문자 수
                </label>
                <input
                  type="number"
                  value={data.monthlyVisitors || ''}
                  onChange={(e) => updateData('monthlyVisitors', Number(e.target.value))}
                  placeholder="예: 10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 전환율 (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.currentConversionRate || ''}
                  onChange={(e) => updateData('currentConversionRate', Number(e.target.value))}
                  placeholder="예: 2.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개선된 전환율 (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.improvedConversionRate || ''}
                  onChange={(e) => updateData('improvedConversionRate', Number(e.target.value))}
                  placeholder="예: 3.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {data.improvedConversionRate < data.currentConversionRate && (
                  <p className="text-red-500 text-sm mt-1">
                    개선된 전환율은 현재 전환율보다 높아야 합니다.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평균 주문 금액 (원)
                </label>
                <input
                  type="number"
                  value={data.averageOrderValue || ''}
                  onChange={(e) => updateData('averageOrderValue', Number(e.target.value))}
                  placeholder="예: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {result && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">현재 전환수</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatDecimal(result.currentConversions)}건
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">개선된 전환수</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatDecimal(result.improvedConversions)}건
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">추가 확보 전환수</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{formatDecimal(result.additionalConversions)}건
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">전환율 개선율</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{formatDecimal(result.conversionRateImprovement)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 예상 매출 증가액</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">월간 예상 매출 증가액</p>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {formatNumber(result.monthlyRevenueIncrease)}원
                    </p>
                    <p className="text-xs text-gray-500">
                      추가 전환수 {formatDecimal(result.additionalConversions)}건 × 평균 주문 금액
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-sm text-gray-600 mb-2">연간 예상 매출 증가액</p>
                    <p className="text-3xl font-bold text-indigo-600 mb-2">
                      {formatNumber(result.annualRevenueIncrease)}원
                    </p>
                    <p className="text-xs text-gray-500">월간 증가액 × 12개월</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h2 className="text-xl font-bold text-gray-800 mb-3">💡 결과 해석</h2>
                <div className="space-y-3 text-gray-700">
                  <p className="leading-relaxed">
                    현재 <strong className="text-gray-800">{formatDecimal(data.currentConversionRate)}%</strong>의
                    전환율을 <strong className="text-purple-600">{formatDecimal(data.improvedConversionRate)}%</strong>
                    로 개선하면, 월간 <strong className="text-blue-600">{formatNumber(data.monthlyVisitors)}명</strong>의
                    방문자 중 <strong className="text-green-600">+{formatDecimal(result.additionalConversions)}건</strong>의
                    추가 전환이 발생합니다.
                  </p>
                  <p className="leading-relaxed">
                    이를 통해 <strong className="text-blue-600">월 {formatNumber(result.monthlyRevenueIncrease)}원</strong>,
                    <strong className="text-indigo-600"> 연 {formatNumber(result.annualRevenueIncrease)}원</strong>의
                    매출 증가가 예상됩니다.
                  </p>
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <p className="font-semibold text-gray-800 mb-2">🎯 A/B 테스트 권장사항:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>
                        전환율이 <strong>{formatDecimal(result.conversionRateImprovement)}%</strong> 개선되면
                        연간 <strong>{formatNumber(result.annualRevenueIncrease)}원</strong>의 추가 수익이 예상됩니다.
                      </li>
                      <li>
                        A/B 테스트를 통해 전환율 개선 효과를 검증하고, 성공적인 변형을 전체 적용하세요.
                      </li>
                      <li>
                        전환율 최적화는 광고비 증가 없이도 매출을 늘릴 수 있는 가장 효율적인 방법입니다.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                위의 입력 필드를 모두 채우면 실시간으로 계산 결과가 표시됩니다.
              </p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>
                <strong>현재 전환수</strong> = 월간 방문자 수 × (현재 전환율 ÷ 100)
              </li>
              <li>
                <strong>개선된 전환수</strong> = 월간 방문자 수 × (개선된 전환율 ÷ 100)
              </li>
              <li>
                <strong>추가 확보 전환수</strong> = 개선된 전환수 - 현재 전환수
              </li>
              <li>
                <strong>월간 매출 증가액</strong> = 추가 확보 전환수 × 평균 주문 금액
              </li>
              <li>
                <strong>연간 매출 증가액</strong> = 월간 매출 증가액 × 12
              </li>
              <li>
                <strong>전환율 개선율</strong> = ((개선된 전환율 - 현재 전환율) ÷ 현재 전환율) × 100
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

