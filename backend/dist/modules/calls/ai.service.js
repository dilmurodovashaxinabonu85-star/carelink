"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let AiService = class AiService {
    constructor() {
        this.HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
        this.HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    }
    async predictRisk(patientData) {
        const prompt = `[INST] You are a medical AI assistant. Analyze this patient and return ONLY a JSON object with riskLevel (HIGH/MEDIUM/LOW), reason (string), and recommendations (array of strings).

Patient diagnosis: ${patientData.diagnosis}
${patientData.age ? `Age: ${patientData.age}` : ''}
${patientData.additionalInfo || ''}

Return only valid JSON, no explanation. [/INST]`;
        try {
            const response = await axios_1.default.post(this.HF_API_URL, { inputs: prompt, parameters: { max_new_tokens: 200, return_full_text: false } }, { headers: { Authorization: `Bearer ${this.HF_API_KEY}`, 'Content-Type': 'application/json' } });
            const text = response.data[0]?.generated_text || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.error('AI prediction error:', error.message);
        }
        return {
            riskLevel: 'MEDIUM',
            reason: 'AI tahlil qila olmadi, standart daraja belgilandi',
            recommendations: ['Shifokor ko\'rigi tavsiya etiladi'],
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map