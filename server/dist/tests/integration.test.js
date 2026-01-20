"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Integration Tests - Complete User Flow', () => {
    let companyToken;
    let userToken;
    let companyId;
    let userId;
    let vehicleId;
    let paymentId;
    const companyBusinessNumber = '222-22-22222';
    const companyPhone = '010-5555-1001';
    const userPhone = '010-5555-1002';
    const companyEmail = 'integration+company@company.com';
    const userEmail = 'integration+user@user.com';
    beforeAll(async () => {
        // 사업자등록번호 인증 시뮬레이션 (회사 회원가입 전 선행)
        await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/verify-business')
            .send({ businessNumber: companyBusinessNumber });
        // 회사 계정 생성
        const companyResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register/company')
            .send({
            businessNumber: companyBusinessNumber,
            companyName: '통합테스트 회사',
            representative: '홍길동',
            address: '서울시 강남구',
            contactPerson: '홍길동',
            phone: companyPhone,
            email: companyEmail,
            password: 'testpassword123'
        });
        if (companyResponse.status === 201) {
            companyToken = companyResponse.body.token;
            companyId = companyResponse.body.user.id;
        }
        else {
            // 이미 존재하는 경우 로그인 시도
            const loginResponse = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                phone: companyPhone,
                password: 'testpassword123',
                userType: 'company'
            });
            if (loginResponse.status === 200) {
                companyToken = loginResponse.body.token;
                companyId = loginResponse.body.user.id;
            }
        }
        // 개인 사용자 계정 생성
        const userResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register/user')
            .send({
            name: '개인사용자',
            phone: userPhone,
            email: userEmail,
            password: 'testpassword123'
        });
        if (userResponse.status === 201) {
            userToken = userResponse.body.token;
            userId = userResponse.body.user.id;
        }
        else {
            // 이미 존재하는 경우 로그인 시도
            const loginResponse = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                phone: userPhone,
                password: 'testpassword123',
                userType: 'user'
            });
            if (loginResponse.status === 200) {
                userToken = loginResponse.body.token;
                userId = loginResponse.body.user.id;
            }
        }
    });
    afterAll(async () => {
        // 테스트 데이터 정리
        if (vehicleId) {
            await prisma.payment.deleteMany({ where: { vehicleId } });
            await prisma.vehicle.deleteMany({ where: { id: vehicleId } });
        }
        if (companyId) {
            await prisma.company.deleteMany({ where: { id: companyId } });
        }
        if (userId) {
            await prisma.payment.deleteMany({ where: { userId } });
            await prisma.user.deleteMany({ where: { id: userId } });
        }
        await prisma.$disconnect();
    });
    test('완전한 사용자 플로우 테스트', async () => {
        // 1. 회사가 차량 등록
        const vehicleData = {
            vehicleNumber: '12가3456',
            vehicleType: '1톤 트럭',
            region: '서울',
            tonnage: '1톤',
            yearModel: 2020,
            monthlyFee: 500000,
            insuranceRate: 5,
            description: '통합테스트 차량',
            phone: companyPhone
        };
        const vehicleResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${companyToken}`)
            .send(vehicleData);
        expect(vehicleResponse.status).toBe(201);
        vehicleId = vehicleResponse.body.id;
        // 2. 개인 사용자가 차량 검색
        const searchResponse = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles')
            .query({ region: '서울', vehicleType: '1톤 트럭' });
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.body.vehicles.length).toBeGreaterThan(0);
        // 3. 개인 사용자가 결제 요청
        const paymentResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/payments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            vehicleId: vehicleId,
            amount: 10000
        });
        expect(paymentResponse.status).toBe(201);
        paymentId = paymentResponse.body.id;
        // 4. 결제 상태 확인
        const statusResponse = await (0, supertest_1.default)(app_1.default)
            .get(`/api/payments/status/${vehicleId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(statusResponse.status).toBe(200);
        expect(statusResponse.body.hasPaid).toBe(true);
        // 5. 연락처 조회
        const contactResponse = await (0, supertest_1.default)(app_1.default)
            .get(`/api/payments/contact/${vehicleId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(contactResponse.status).toBe(200);
        expect(contactResponse.body.company.phone).toBe(companyPhone);
        // 6. 회사가 내 차량 목록 확인
        const myVehiclesResponse = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles/my')
            .set('Authorization', `Bearer ${companyToken}`);
        expect(myVehiclesResponse.status).toBe(200);
        expect(myVehiclesResponse.body.length).toBeGreaterThan(0);
        // 7. 통계 확인
        const regionStatsResponse = await (0, supertest_1.default)(app_1.default)
            .get('/api/vehicles/stats/region');
        expect(regionStatsResponse.status).toBe(200);
        expect(Array.isArray(regionStatsResponse.body)).toBe(true);
    });
});
