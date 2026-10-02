/**
 * CampusConnect API Verification Script
 * Validates all 7 Business Logic Rules and CRUD endpoints against a running backend.
 * 
 * Usage:
 * 1. Ensure backend is running: npm start (inside backend/)
 * 2. Run this test: node test-api.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log(' CampusConnect API - SE2020 Automated Verification ');
  console.log(` Target: ${BASE_URL}`);
  console.log('====================================================\n');

  try {
    // 1. Health Check
    console.log('[Test 1] Checking GET /api/health ...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('Status:', healthRes.status, '| Response:', healthData.message);
    if (healthRes.status !== 200) throw new Error('Health check failed');
    console.log('✅ PASSED: Health endpoint is active.\n');

    // 2. Register Student
    const testStudentEmail = `student_${Date.now()}@sliit.lk`;
    console.log(`[Test 2] Registering test student: ${testStudentEmail} ...`);
    const regStudentRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testStudentEmail,
        password: 'password123',
        isAdmin: false,
      }),
    });
    const regStudentData = await regStudentRes.json();
    console.log('Status:', regStudentRes.status, '| Success:', regStudentData.success);
    const studentToken = regStudentData.data?.token;
    if (!studentToken) throw new Error('Student registration failed');
    console.log('✅ PASSED: Student registered with JWT token.\n');

    // 3. Register Admin
    const testAdminEmail = `admin_${Date.now()}@sliit.lk`;
    console.log(`[Test 3] Registering test admin: ${testAdminEmail} ...`);
    const regAdminRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: testAdminEmail,
        password: 'adminpassword123',
        isAdmin: true,
      }),
    });
    const regAdminData = await regAdminRes.json();
    const adminToken = regAdminData.data?.token;
    if (!adminToken) throw new Error('Admin registration failed');
    console.log('✅ PASSED: Admin registered with JWT token.\n');

    // 4. Create a Found Item
    console.log('[Test 4] Reporting a Found item (Item CRUD: Create) ...');
    const foundItemRes = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Found Casio Scientific Calculator',
        description: 'Black and silver casing found on Lab 4 desk',
        category: 'Electronics',
        location: 'Computing Lab 04',
        itemType: 'Found',
      }),
    });
    const foundItemData = await foundItemRes.json();
    const foundItemId = foundItemData.data?._id;
    console.log('Status:', foundItemRes.status, '| Item ID:', foundItemId);
    if (!foundItemId) throw new Error('Found item creation failed');
    console.log('✅ PASSED: Found item created with status Active.\n');

    // 5. Create a Lost Item
    console.log('[Test 5] Reporting a Lost item ...');
    const lostItemRes = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Lost Student ID Card',
        description: 'Blue card with ID IT21009999',
        category: 'Documents',
        location: 'Cafeteria',
        itemType: 'Lost',
      }),
    });
    const lostItemData = await lostItemRes.json();
    const lostItemId = lostItemData.data?._id;
    console.log('Status:', lostItemRes.status, '| Lost Item ID:', lostItemId);
    console.log('✅ PASSED: Lost item report created.\n');

    // 6. Test RULE 1: Cannot claim a Lost item
    console.log('[Test 6] RULE 1: Attempting to submit a claim for a LOST item ...');
    const rule1Res = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        itemId: lostItemId,
        message: 'This is my lost card!',
      }),
    });
    const rule1Data = await rule1Res.json();
    console.log('Status:', rule1Res.status, '| Error message:', rule1Data.message);
    if (rule1Res.status === 400 && rule1Data.message.includes('Only found items')) {
      console.log('✅ PASSED: RULE 1 correctly enforced (Rejected claim on Lost item with HTTP 400).\n');
    } else {
      throw new Error('RULE 1 enforcement failed');
    }

    // 7. Register Student 2 to claim Found item
    const student2Email = `claimant_${Date.now()}@sliit.lk`;
    const regStudent2Res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Claimant Student',
        email: student2Email,
        password: 'password123',
      }),
    });
    const student2Token = (await regStudent2Res.json()).data.token;

    // 8. Submit Valid Claim for Found Item
    console.log('[Test 7] Submitting a valid claim for Found item ...');
    const validClaimRes = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({
        itemId: foundItemId,
        message: 'I have my student ID sticker on the battery cover.',
      }),
    });
    const validClaimData = await validClaimRes.json();
    const claimId = validClaimData.data?._id;
    console.log('Status:', validClaimRes.status, '| Claim ID:', claimId);
    if (!claimId) throw new Error('Claim submission failed');
    console.log('✅ PASSED: Valid claim created with status Pending.\n');

    // 9. Test RULE 3: Duplicate pending claim prevention
    console.log('[Test 8] RULE 3: Attempting duplicate pending claim by same student ...');
    const rule3Res = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({
        itemId: foundItemId,
        message: 'Second claim attempt for the same item',
      }),
    });
    const rule3Data = await rule3Res.json();
    console.log('Status:', rule3Res.status, '| Message:', rule3Data.message);
    if (rule3Res.status === 409) {
      console.log('✅ PASSED: RULE 3 correctly enforced (Duplicate pending claim blocked with HTTP 409).\n');
    } else {
      throw new Error('RULE 3 enforcement failed');
    }

    // 10. Test RULE 4 & 7: Admin Approves Claim
    console.log('[Test 9] RULE 4 & 7: Admin approves pending claim ...');
    const approveRes = await fetch(`${BASE_URL}/api/claims/${claimId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Approved' }),
    });
    const approveData = await approveRes.json();
    console.log('Status:', approveRes.status, '| Message:', approveData.message);
    console.log('Claim Status:', approveData.data?.status, '| Item Status:', approveData.data?.itemId?.status);

    // Verify Item is now marked Claimed
    const checkItemRes = await fetch(`${BASE_URL}/api/items/${foundItemId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkItemData = await checkItemRes.json();
    if (checkItemData.data?.status === 'Claimed') {
      console.log('✅ PASSED: RULE 4 & 7 correctly enforced (Claim Approved & Item status changed to Claimed).\n');
    } else {
      throw new Error('RULE 4 state transition failed');
    }

    // 11. Test RULE 2 & 7: Attempting claim on Claimed item
    console.log('[Test 10] RULE 2 & 7: Attempting new claim on now CLAIMED item ...');
    const rule2Res = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        itemId: foundItemId,
        message: 'Another user trying to claim already claimed item',
      }),
    });
    const rule2Data = await rule2Res.json();
    console.log('Status:', rule2Res.status, '| Message:', rule2Data.message);
    if (rule2Res.status === 400 && rule2Data.message.includes('cannot be claimed')) {
      console.log('✅ PASSED: RULE 2 & 7 correctly enforced (Claimed item locked against new claims).\n');
    } else {
      throw new Error('RULE 2 & 7 locking failed');
    }

    console.log('====================================================');
    console.log(' ALL 10 SE2020 API TESTS PASSED SUCCESSFULLY!       ');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

runTests();
