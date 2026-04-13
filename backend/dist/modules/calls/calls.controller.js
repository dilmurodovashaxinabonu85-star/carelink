"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calls_service_1 = require("./calls.service");
const ai_service_1 = require("./ai.service");
let CallsController = class CallsController {
    constructor(callsService, aiService) {
        this.callsService = callsService;
        this.aiService = aiService;
    }
    async findAll() {
        return this.callsService.findAll();
    }
    async updateStatus(id, body) {
        return this.callsService.updateStatus(id, body.status);
    }
    async analyzeRisk(body) {
        return this.aiService.predictRisk({ diagnosis: body.diagnosis });
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active calls' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of active calls' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update call status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'AI risk prediction for a patient' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI risk analysis result' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { diagnosis: { type: 'string' }, patientname: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "analyzeRisk", null);
exports.CallsController = CallsController = __decorate([
    (0, swagger_1.ApiTags)('Calls'),
    (0, common_1.Controller)('calls'),
    __metadata("design:paramtypes", [calls_service_1.CallsService,
        ai_service_1.AiService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map