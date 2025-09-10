const { GoogleGenAI } = require("@google/genai");

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async analyzeSpendingPatterns(userId, transactions, period) {
    try {
      const prompt = `
        Analyze the following spending patterns for user ${userId}:
        
        Transactions: ${JSON.stringify(transactions)}
        Period: ${period}
        
        Provide insights on:
        1. Spending trends and categories with unusual activity
        2. Comparison with previous periods
        3. Potential savings opportunities
        4. Budget optimization suggestions
        5. Financial health assessment
        
        Format response as JSON with:
        - insights: array of strings
        - recommendations: array of strings
        - riskFactors: array of strings
        - confidenceScore: number (0-1)
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      });

      return this.parseResponse(response.text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Financial analysis failed");
    }
  }

  async generateFinancialAdvice(userData, goals, marketConditions) {
    const prompt = `
      Generate personalized financial advice based on:
      User Data: ${JSON.stringify(userData)}
      Financial Goals: ${JSON.stringify(goals)}
      Market Conditions: ${JSON.stringify(marketConditions || {})}
      
      Provide comprehensive advice covering:
      1. Investment strategies
      2. Debt management
      3. Savings optimization
      4. Risk assessment
      5. Short-term and long-term planning
      
      Format as JSON with detailed sections.
    `;

    // Implementation similar to analyzeSpendingPatterns
  }

  parseResponse(responseText) {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Invalid response format");
    } catch (error) {
      return {
        insights: ["Analysis completed. Review your spending patterns."],
        recommendations: ["Consider consulting with a financial advisor."],
        riskFactors: [],
        confidenceScore: 0.5
      };
    }
  }
}

module.exports = new GeminiService();