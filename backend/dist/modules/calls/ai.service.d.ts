export declare class AiService {
    private readonly HF_API_URL;
    private readonly HF_API_KEY;
    predictRisk(patientData: {
        diagnosis: string;
        age?: number;
        additionalInfo?: string;
    }): Promise<{
        riskLevel: string;
        reason: string;
        recommendations: string[];
    }>;
}
