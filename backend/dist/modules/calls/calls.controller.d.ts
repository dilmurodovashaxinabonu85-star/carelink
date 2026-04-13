import { CallsService } from './calls.service';
import { AiService } from './ai.service';
export declare class CallsController {
    private readonly callsService;
    private readonly aiService;
    constructor(callsService: CallsService, aiService: AiService);
    findAll(): Promise<any>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
        success: boolean;
    }>;
    analyzeRisk(body: {
        diagnosis: string;
        patientname: string;
    }): Promise<{
        riskLevel: string;
        reason: string;
        recommendations: string[];
    }>;
}
