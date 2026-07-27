import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, mood } = req.body;

  if (!mood || !latitude || !longitude) {
    return res.status(400).json({ error: '위치 정보와 기분을 모두 입력해주세요.' });
  }

  // 환경변수에서 API 키 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
현재 사용자의 위치: 위도 ${latitude}, 경도 ${longitude}
현재 사용자의 기분/분위기: "${mood}"

역할: 당신은 감성적이고 전문적인 맛집 큐레이터입니다.
상황: 사용자의 현재 기분과 위치를 고려하여, 기분에 딱 맞는 메뉴 종류와 주변 맛집 스타일 3곳을 추천해주세요.

응답 형식:
1. 사용자의 기분에 대한 공감 한 줄
2. 추천 음식 카테고리/분위기
3. 추천 맛집 스타일 3가지 (이유와 함께 간결하고 인상적인 설명)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'AI 추천을 가져오는 중 오류가 발생했습니다.' });
  }
}