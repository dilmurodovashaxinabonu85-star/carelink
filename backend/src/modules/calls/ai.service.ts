import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
  private readonly HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  async predictRisk(patientData: {
    diagnosis: string;
    age?: number;
    additionalInfo?: string;
  }): Promise<{ riskLevel: string; reason: string; recommendations: string[] }> {
    const prompt = `[INST] You are a medical AI assistant. Analyze this patient and return ONLY a JSON object with riskLevel (HIGH/MEDIUM/LOW), reason (string), and recommendations (array of strings).

Patient diagnosis: ${patientData.diagnosis}
${patientData.age ? `Age: ${patientData.age}` : ''}
${patientData.additionalInfo || ''}

Return only valid JSON, no explanation. [/INST]`;

    try {
      const response = await axios.post(
        this.HF_API_URL,
        { inputs: prompt, parameters: { max_new_tokens: 200, return_full_text: false } },
        { headers: { Authorization: `Bearer ${this.HF_API_KEY}`, 'Content-Type': 'application/json' } }
      );

      const text = response.data[0]?.generated_text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI prediction error:', error.message);
    }

    return {
      riskLevel: 'MEDIUM',
      reason: 'AI tahlil qila olmadi, standart daraja belgilandi',
      recommendations: ['Shifokor ko\'rigi tavsiya etiladi'],
    };
  }
}
