const http = require('http');

// Test gamification endpoints
async function testGamificationAPI() {
  console.log('🎮 Testing Phase 4 Gamification API\n');

  // Test 1: Login
  console.log('Test 1: Login');
  try {
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'profile.test2@example.com',
      password: 'NewPassword456!'
    });
    const token = loginRes.session?.token;
    if (!token) {
      console.log('Login response:', JSON.stringify(loginRes, null, 2));
      throw new Error('No token in login response');
    }
    console.log('✓ Login successful');
    console.log(`✓ Token: ${token.substring(0, 20)}...\n`);

    // Test 2: Get gamification profile
    console.log('Test 2: Get Gamification Profile');
    const profileRes = await makeRequest('GET', '/api/gamification/profile', null, token);
    console.log('✓ Gamification profile retrieved');
    console.log(`✓ Response:`, JSON.stringify(profileRes, null, 2).substring(0, 300) + '\n');

    // Test 3: Get achievements
    console.log('Test 3: Get Achievements');
    const achRes = await makeRequest('GET', '/api/gamification/achievements', null, token);
    console.log('✓ Achievements retrieved');
    console.log(`✓ Total achievements: ${achRes.allAchievements?.length || 0}\n`);

    // Test 4: Get challenges
    console.log('Test 4: Get Daily Challenges');
    const chalRes = await makeRequest('GET', '/api/gamification/challenges', null, token);
    console.log('✓ Challenges retrieved');
    console.log(`✓ Total challenges: ${chalRes.challenges?.length || 0}\n`);

    // Test 5: Award points
    console.log('Test 5: Award Points');
    const pointsRes = await makeRequest('POST', '/api/gamification/earn-points', {
      points: 50,
      reason: 'Completed flashcard review',
      streakBonus: 0
    }, token);
    console.log('✓ Points awarded');
    console.log(`✓ Response:`, pointsRes.message, '\n');

    // Test 6: Get leaderboard
    console.log('Test 6: Get Leaderboard');
    const leadRes = await makeRequest('GET', '/api/gamification/leaderboard', null, token);
    console.log('✓ Leaderboard retrieved');
    console.log(`✓ Top users: ${Array.isArray(leadRes) ? leadRes.length : 0}\n`);

    console.log('✅ All gamification API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function makeRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

testGamificationAPI();
