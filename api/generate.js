const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, mood } = req.body || {};

  if (!mood || !latitude || !longitude) {
    return res.status(400).json({ error: '위치 정보와 기분을 모두 입력해주세요.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 실시간 검색 도구(googleSearch) 옵션 추가
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite',
      tools: [{ googleSearch: {} }] 
    });

    const prompt = `
현재 위치 정보: 위도 ${latitude}, 경도 ${longitude}
사용자 기분/원하는 분위기: "${mood}"

[요청 사항]
1. 구글 검색을 활용하여 위 위도/경도 근처에서 **현재 정상 영업 중인 실제 음식점 3곳**을 찾으세요.
2. **폐업했거나 영업을 중단한 식당은 절대로 포함하지 마세요.**
3. 검증된 실제 매장명과 대표 메뉴, 그리고 사용자의 기분에 왜 잘 맞는지 이유를 작성해주세요.

[응답 형식]
- 공감 문구 1줄
- 📍 **[가게 이름 1]**
  - 대표 메뉴: 
  - 추천 이유: 
- 📍 **[가게 이름 2]**
  - 대표 메뉴: 
  - 추천 이유: 
- 📍 **[가게 이름 3]**
  - 대표 메뉴: 
  - 추천 이유: 
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({ result: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: `AI 추천 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}` 
    });
  }
};
