'use client';

import { useState } from 'react';

interface ProductRow {
  id: string;
  productName: string;
  price: number; // 판매가
  profitPerUnit: number; // 개당 순이익
  adCost: number; // 광고비
  conversions: number; // 전환수
}

interface CalculatedResult {
  revenue: number; // 매출
  roas: number; // ROAS
  roi: number; // ROI
  netProfit: number; // 순이익
}

export default function AdPerformancePage() {
  const [rows, setRows] = useState<ProductRow[]>([
    {
      id: '1',
      productName: '',
      price: 0,
      profitPerUnit: 0,
      adCost: 0,
      conversions: 0,
    },
  ]);
  const [calculatedResults, setCalculatedResults] = useState<Map<string, CalculatedResult>>(new Map());
  const [highestProfitId, setHighestProfitId] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [loadingAI, setLoadingAI] = useState<Map<string, boolean>>(new Map());
  const [loadingAllAI, setLoadingAllAI] = useState<boolean>(false);

  // 행 추가
  const addRow = () => {
    const newRow: ProductRow = {
      id: Date.now().toString(),
      productName: '',
      price: 0,
      profitPerUnit: 0,
      adCost: 0,
      conversions: 0,
    };
    setRows([...rows, newRow]);
    console.log('행 추가됨:', newRow.id);
  };

  // 행 삭제
  const removeRow = (id: string) => {
    if (rows.length === 1) {
      alert('최소 1개의 행은 유지해야 합니다.');
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
    const newResults = new Map(calculatedResults);
    newResults.delete(id);
    setCalculatedResults(newResults);
    console.log('행 삭제됨:', id);
  };

  // 입력값 업데이트
  const updateRow = (id: string, field: keyof ProductRow, value: string | number) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // 계산 함수
  const calculate = () => {
    const results = new Map<string, CalculatedResult>();
    let maxProfit = -Infinity;
    let maxProfitId: string | null = null;

    rows.forEach((row) => {
      const revenue = row.price * row.conversions; // 매출 = 판매가 × 전환수
      const netProfit = row.profitPerUnit * row.conversions - row.adCost; // 순이익 = (개당 순이익 × 전환수) - 광고비
      const roas = row.adCost > 0 ? revenue / row.adCost : 0; // ROAS = 매출 / 광고비
      const roi = row.adCost > 0 ? (netProfit / row.adCost) * 100 : 0; // ROI = (순이익 / 광고비) × 100

      results.set(row.id, {
        revenue,
        roas,
        roi,
        netProfit,
      });

      // 가장 높은 순이익 찾기
      if (netProfit > maxProfit) {
        maxProfit = netProfit;
        maxProfitId = row.id;
      }

      console.log(`상품 ${row.id} 계산 완료:`, { revenue, roas, roi, netProfit });
    });

    setCalculatedResults(results);
    setHighestProfitId(maxProfitId);
    setIsCalculated(true);
    console.log('가장 높은 순이익 상품:', maxProfitId, '순이익:', maxProfit);
  };

  // AI로 상품 정보 추정 (단일)
  const estimateProductInfo = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row || !row.productName.trim()) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }

    setLoadingAI(new Map(loadingAI.set(id, true)));
    console.log('AI 상품 정보 추정 시작:', row.productName);

    try {
      const response = await fetch('/api/estimate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName: row.productName }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
        const errorDetails = result.details ? `\n상세: ${result.details}` : '';
        const errorHint = result.hint ? `\n힌트: ${result.hint}` : '';
        throw new Error(errorMessage + errorDetails + errorHint);
      }

      if (result.success && result.data) {
        updateRow(id, 'price', result.data.price);
        updateRow(id, 'profitPerUnit', result.data.profitPerUnit);
        updateRow(id, 'adCost', result.data.adCost);
        updateRow(id, 'conversions', result.data.conversions);
        console.log('AI 상품 정보 추정 완료:', result.data);
      }
    } catch (error: any) {
      console.error('AI 상품 정보 추정 오류:', error);
      console.error('에러 상세:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // 더 자세한 에러 메시지 표시
      const errorMessage = error.message || '상품 정보 추정 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      const newLoading = new Map(loadingAI);
      newLoading.set(id, false);
      setLoadingAI(newLoading);
    }
  };

  // 전체 상품 AI 분석
  const estimateAllProducts = async () => {
    // 상품명이 입력된 행들만 필터링
    const rowsWithProductName = rows.filter((row) => row.productName.trim());
    
    if (rowsWithProductName.length === 0) {
      alert('분석할 상품명이 없습니다. 상품명을 입력해주세요.');
      return;
    }

    setLoadingAllAI(true);
    console.log('전체 AI 분석 시작:', rowsWithProductName.length, '개 상품');

    // 모든 행에 로딩 상태 설정
    const newLoading = new Map<string, boolean>();
    rowsWithProductName.forEach((row) => {
      newLoading.set(row.id, true);
    });
    setLoadingAI(newLoading);

    try {
      // 모든 상품을 병렬로 분석
      const promises = rowsWithProductName.map(async (row) => {
        try {
          const response = await fetch('/api/estimate-product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productName: row.productName }),
          });

          const result = await response.json();

          if (!response.ok) {
            const errorMessage = result.error || '상품 정보 추정에 실패했습니다.';
            const errorDetails = result.details ? `\n상세: ${result.details}` : '';
            const errorHint = result.hint ? `\n힌트: ${result.hint}` : '';
            throw new Error(`${row.productName}: ${errorMessage}${errorDetails}${errorHint}`);
          }

          if (result.success && result.data) {
            updateRow(row.id, 'price', result.data.price);
            updateRow(row.id, 'profitPerUnit', result.data.profitPerUnit);
            updateRow(row.id, 'adCost', result.data.adCost);
            updateRow(row.id, 'conversions', result.data.conversions);
            console.log(`${row.productName} AI 분석 완료:`, result.data);
            return { success: true, productName: row.productName };
          }
          return { success: false, productName: row.productName, error: '응답 데이터가 없습니다.' };
        } catch (error: any) {
          console.error(`${row.productName} AI 분석 오류:`, error);
          return { success: false, productName: row.productName, error: error.message };
        }
      });

      const results = await Promise.allSettled(promises);
      
      // 성공/실패 결과 정리
      const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const failedProducts: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.success) {
          failedProducts.push(result.value.productName);
        } else if (result.status === 'rejected') {
          failedProducts.push(rowsWithProductName[index].productName);
        }
      });

      // 결과 메시지 표시
      if (failedProducts.length === 0) {
        alert(`✅ 전체 ${successCount}개 상품 분석이 완료되었습니다!`);
      } else {
        alert(`⚠️ ${successCount}개 상품 분석 완료, ${failedProducts.length}개 실패\n\n실패한 상품: ${failedProducts.join(', ')}`);
      }

      console.log('전체 AI 분석 완료:', { successCount, failedProducts });
    } catch (error: any) {
      console.error('전체 AI 분석 오류:', error);
      alert('전체 분석 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      // 모든 로딩 상태 해제
      const finalLoading = new Map<string, boolean>();
      setLoadingAI(finalLoading);
      setLoadingAllAI(false);
    }
  };

  // 숫자 포맷팅 함수
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">광고 성과 계산 도구</h1>
          <p className="text-gray-600 mb-6">상품별 광고 성과를 비교하고 최적의 광고 전략을 찾아보세요</p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">상품명</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">판매가 (원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">개당 순이익 (원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">광고비 (원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">전환수</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">매출 (원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">ROAS</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">ROI (%)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">순이익 (원)</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">삭제</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const result = calculatedResults.get(row.id);
                  const isHighlighted = isCalculated && highestProfitId === row.id;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isHighlighted
                          ? 'bg-yellow-100 border-2 border-yellow-400 font-semibold'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={row.productName}
                            onChange={(e) => updateRow(row.id, 'productName', e.target.value)}
                            placeholder="상품명 입력"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && row.productName.trim()) {
                                estimateProductInfo(row.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => estimateProductInfo(row.id)}
                            disabled={!row.productName.trim() || loadingAI.get(row.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold whitespace-nowrap"
                            title="AI로 상품 정보 자동 입력"
                          >
                            {loadingAI.get(row.id) ? 'AI 분석 중...' : '🤖 AI'}
                          </button>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.price || ''}
                          onChange={(e) => updateRow(row.id, 'price', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.profitPerUnit || ''}
                          onChange={(e) => updateRow(row.id, 'profitPerUnit', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.adCost || ''}
                          onChange={(e) => updateRow(row.id, 'adCost', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.conversions || ''}
                          onChange={(e) => updateRow(row.id, 'conversions', Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {result ? formatNumber(result.revenue) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {result ? result.roas.toFixed(2) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {result ? result.roi.toFixed(2) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {result ? formatNumber(result.netProfit) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={addRow}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md"
            >
              + 행 추가
            </button>
            <button
              onClick={estimateAllProducts}
              disabled={loadingAllAI}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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
            <button
              onClick={calculate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              계산하기
            </button>
          </div>

          {isCalculated && highestProfitId && (() => {
            const bestProduct = rows.find((row) => row.id === highestProfitId);
            const bestResult = calculatedResults.get(highestProfitId);
            const productName = bestProduct?.productName || '상품';
            const netProfit = bestResult?.netProfit || 0;
            const roi = bestResult?.roi || 0;

            return (
              <div className="mt-6 space-y-4">
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 결과 해석</h2>
                  <div className="bg-white rounded-lg p-5 shadow-sm">
                    <p className="text-xl text-gray-800 leading-relaxed">
                      <span className="font-bold text-indigo-700 text-2xl">
                        {productName || '상품'}
                        {!productName && <span className="text-base font-normal text-gray-500">(상품명 미입력)</span>}
                      </span>
                      <span className="mx-2">이</span>
                      <span className="font-bold text-green-600 text-2xl">{formatNumber(netProfit)}원</span>
                      <span className="mx-1">의 순이익</span>
                      {roi !== 0 && (
                        <>
                          <span className="mx-1">(</span>
                          <span className="font-bold text-blue-600">ROI: {roi.toFixed(2)}%</span>
                          <span className="mx-1">)</span>
                        </>
                      )}
                      <span className="mx-2">으로 가장 성과가 좋습니다.</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-lg font-semibold text-gray-800">
                    🏆 최적의 광고 성과 상품이 하이라이트되었습니다!
                  </p>
                  <p className="text-gray-600 mt-2">
                    가장 높은 순이익을 보이는 상품이 노란색으로 표시되었습니다.
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">계산 공식</h2>
            <ul className="space-y-2 text-gray-700">
              <li>
                <strong>매출</strong> = 판매가 × 전환수
              </li>
              <li>
                <strong>순이익</strong> = (개당 순이익 × 전환수) - 광고비
              </li>
              <li>
                <strong>ROAS</strong> = 매출 ÷ 광고비
              </li>
              <li>
                <strong>ROI</strong> = (순이익 ÷ 광고비) × 100
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

