import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json();

    if (!productName || productName.trim() === '') {
      return NextResponse.json(
        { error: '상품명이 필요합니다.' },
        { status: 400 }
      );
    }

    // 환경변수 로드 (여러 소스에서 시도)
    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      null;

    if (!apiKey) {
      console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
      console.error('환경변수 확인:', {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
        NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '설정됨' : '없음',
        VERCEL: process.env.VERCEL ? 'Vercel 환경' : '로컬 환경',
      });
      return NextResponse.json(
        { 
          error: 'API 키가 설정되지 않았습니다.',
          hint: process.env.VERCEL 
            ? 'Vercel 대시보드 > 프로젝트 설정 > Environment Variables에서 GEMINI_API_KEY를 추가하고 재배포하세요.'
            : '.env.local 파일에 GEMINI_API_KEY를 설정하고 서버를 재시작하세요.'
        },
        { status: 500 }
      );
    }

    console.log('API 키 로드 성공 (길이:', apiKey.length, ')');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // gemini-1.5-flash 모델 사용 (무료 티어에서 안정적으로 작동)
    // gemini-2.0-flash-exp는 무료 티어 할당량이 0이므로 사용 불가
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log('모델 로드 성공:', modelName);

    const prompt = `당신은 전자상거래 마케팅 전문가입니다. 주어진 상품명을 기반으로 다음과 같은 정보를 추정해주세요:

상품명: ${productName}

다음 정보를 JSON 형식으로만 응답해주세요 (설명 없이 JSON만):
{
  "price": 판매가(원, 숫자만),
  "profitPerUnit": 개당 순이익(원, 숫자만),
  "adCost": 예상 광고비(원, 숫자만),
  "conversions": 예상 전환수(숫자만)
}

참고사항:
- 판매가는 시장 가격을 기준으로 현실적인 금액을 추정
- 개당 순이익은 판매가의 20-40% 정도로 추정
- 광고비는 판매가의 5-15% 정도로 추정
- 전환수는 월간 기준으로 현실적인 숫자 추정 (10-1000 사이)
- 모든 값은 숫자만 반환 (천 단위 구분 기호 없이)`;

    console.log('Gemini API 호출 시작:', productName, '모델:', modelName);

    let result;
    let response;
    let text;
    
    // 재시도 로직 (429 에러 시 최대 3회 재시도)
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: any = null;
    
    while (retryCount <= maxRetries) {
      try {
        result = await model.generateContent(prompt);
        response = await result.response;
        text = response.text();
        console.log('Gemini API 응답 수신 성공, 길이:', text.length);
        console.log('Gemini API 응답 내용:', text.substring(0, 500));
        break; // 성공 시 루프 종료
      } catch (apiError: any) {
        lastError = apiError;
        const errorMessage = apiError.message || '';
        
        // 429 에러 (할당량 초과)이고 재시도 가능한 경우
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded')) {
          if (retryCount < maxRetries) {
            retryCount++;
            // 재시도 지연 시간 추출 (기본 5초)
            const retryDelay = errorMessage.match(/retry in ([\d.]+)s/i)?.[1] || '5';
            const delayMs = Math.ceil(parseFloat(retryDelay) * 1000);
            
            console.warn(`할당량 초과로 인한 재시도 ${retryCount}/${maxRetries} (${delayMs}ms 대기)`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue; // 재시도
          } else {
            // 최대 재시도 횟수 초과
            throw new Error('API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요. (무료 티어 제한)');
          }
        } else {
          // 429가 아닌 다른 에러는 즉시 throw
          throw apiError;
        }
      }
    }
    
    if (!text) {
      throw lastError || new Error('API 호출에 실패했습니다.');
    }

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(jsonText);
      console.log('JSON 파싱 성공:', data);
    } catch (parseError: any) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('파싱 시도한 텍스트:', jsonText);
      throw new Error(`JSON 파싱 실패: ${parseError.message}. 응답의 처음 200자: ${jsonText.substring(0, 200)}`);
    }

    // 데이터 검증
    if (
      typeof data.price !== 'number' ||
      typeof data.profitPerUnit !== 'number' ||
      typeof data.adCost !== 'number' ||
      typeof data.conversions !== 'number'
    ) {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.');
    }

    console.log('상품 정보 추정 완료:', data);

    return NextResponse.json({
      success: true,
      data: {
        price: Math.round(data.price),
        profitPerUnit: Math.round(data.profitPerUnit),
        adCost: Math.round(data.adCost),
        conversions: Math.round(data.conversions),
      },
    });
  } catch (error: any) {
    console.error('상품 정보 추정 오류:', error);
    console.error('오류 타입:', error?.constructor?.name);
    console.error('오류 메시지:', error?.message);
    console.error('오류 스택:', error?.stack);
    
    // 더 자세한 에러 정보 반환
    const errorResponse: any = {
      error: '상품 정보 추정 중 오류가 발생했습니다.',
      details: error.message || '알 수 없는 오류',
    };
    
    // 개발 환경에서만 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      errorResponse.errorType = error?.constructor?.name;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

