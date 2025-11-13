import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            마케팅 도구 모음
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            다양한 마케팅 도구를 한 곳에서 편리하게 사용하세요
          </p>
          <p className="text-lg text-gray-500">
            효율적인 마케팅 전략 수립을 위한 전문 도구들을 제공합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">광고 성과 계산 도구</h2>
              <p className="text-lg text-gray-600 mb-6">
                상품별 광고 성과를 비교하고 최적의 광고 전략을 찾아보세요
              </p>
              <ul className="text-left space-y-2 text-gray-700 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI 기반 상품 정보 자동 추정
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  여러 상품 동시 비교 분석
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ROAS, ROI 자동 계산
                </li>
              </ul>
            </div>
            <Link
              href="/tools/ad-performance"
              className="inline-block w-full text-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              광고 성과 계산 도구 사용하기 →
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="mb-6">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">전환율 최적화(CRO) 계산 도구</h2>
              <p className="text-lg text-gray-600 mb-6">
                전환율 개선이 비즈니스에 미치는 영향을 실시간으로 계산하고 분석하세요
              </p>
              <ul className="text-left space-y-2 text-gray-700 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  실시간 계산 및 분석
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  월간/연간 매출 증가액 예측
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  A/B 테스트 비즈니스 임팩트 분석
                </li>
              </ul>
            </div>
            <Link
              href="/tools/conversion-optimization"
              className="inline-block w-full text-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              전환율 최적화 도구 사용하기 →
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">비즈니스 수익성 진단 도구 세트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">1단계: 목표 CPA 계산기</h3>
              <p className="text-sm text-gray-600 mb-4">
                판매가와 원가를 기반으로 1회 전환당 최대 광고비를 계산합니다
              </p>
              <Link
                href="/tools/target-cpa"
                className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                사용하기 →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2단계: LTV 계산기</h3>
              <p className="text-sm text-gray-600 mb-4">
                주문액과 구매 빈도로 고객 생애 가치를 계산합니다
              </p>
              <Link
                href="/tools/ltv-calculator"
                className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                사용하기 →
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">3단계: LTV:CAC 비율 계산기</h3>
              <p className="text-sm text-gray-600 mb-4">
                LTV와 CAC를 입력받아 마케팅 건전성을 판정합니다
              </p>
              <Link
                href="/tools/ltv-cac-ratio"
                className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                사용하기 →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">사업 운영 도구</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-5xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">손익분기점 계산기</h3>
              <p className="text-sm text-gray-600 mb-4">
                고정비, 변동비, 판매가를 입력하여 본전을 달성하기 위한 최소 판매 수량을 계산합니다
              </p>
              <Link
                href="/tools/break-even"
                className="inline-block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                사용하기 →
              </Link>
            </div>
          </div>
        </div>

        <div className="text-gray-500 text-sm">
          <p>더 많은 마케팅 도구가 곧 추가될 예정입니다</p>
        </div>
      </div>
    </div>
  );
}
