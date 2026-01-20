"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe('Basic API Tests', () => {
    test('헬스체크 엔드포인트', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });
    test('차량 목록 조회 (공개 엔드포인트)', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('vehicles');
        expect(Array.isArray(response.body.vehicles)).toBe(true);
    });
    test('지역별 통계 조회', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles/stats/region');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    test('차종별 통계 조회', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles/stats/type');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    test('인증되지 않은 차량 등록 시도', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/vehicles')
            .send({
            vehicleNumber: '12가3456',
            vehicleType: '1톤 트럭',
            region: '서울',
            tonnage: '1톤',
            yearModel: 2020,
            monthlyFee: 500000,
            insuranceRate: 5,
            description: '테스트 차량',
            phone: '010-1234-5678'
        });
        expect(response.status).toBe(401);
    });
    test('인증되지 않은 내 차량 목록 조회 시도', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles/my');
        expect(response.status).toBe(401);
    });
});
