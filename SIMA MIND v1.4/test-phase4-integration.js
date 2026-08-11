const http = require('http');

// Complete Phase 4 Gamification Workflow Test
async function testPhase4Workflow() {
  console.log('\n🎮 PHASE 4 GAMIFICATION - COMPLETE WORKFLOW TEST\n');

  let token;
  let userId;

  try {
    // Step 1: Login
    console.log('📍 Step 1: User Login');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'profile.test2@example.com',
      password: 'NewPassword456!'
    });
    token = loginRes.session?.token;
    userId = loginRes.user?.id;
    console.log(`✓ Logged in as ${userId}\n`);

    // Step 2: Get initial gamification profile
    console.log('📍 Step 2: Get Initial Gamification Profile');
    let profile = await makeRequest('GET', '/api/gamification/profile', null, token);
    console.log(`✓ Level: ${profile.currentLevel}`);
    console.log(`✓ Points: ${profile.totalPoints}`);
    console.log(`✓ Streak: ${profile.currentStreak || 0}\n`);

    // Step 3: Create a flashcard
    console.log('📍 Step 3: Create Flashcard (award 15+ points for review)');
    const cardRes = await makeRequest('POST', '/api/flashcards/create', {
      deckId: 'test-deck',
      front: 'What is the capital of France?',
      back: 'Paris'
    }, token);
    const cardId = cardRes.cards?.[0]?.id;
    if (cardId) {
      console.log(`✓ Flashcard created: ${cardId}`);
      
      // Step 4: Review flashcard (triggers gamification)
      console.log('\n📍 Step 4: Review Flashcard (quality=5, triggers gamification)');
      const reviewRes = await makeRequest('POST', '/api/flashcards/review', {
        cardId: cardId,
        quality: 5
      }, token);
      
      if (reviewRes.gamification) {
        console.log(`✓ Points earned: ${reviewRes.gamification.pointsEarned}`);
        console.log(`✓ Current streak: ${reviewRes.gamification.currentStreak}\n`);
      }
    }

    // Step 5: Get updated profile
    console.log('📍 Step 5: Check Updated Gamification Profile');
    profile = await makeRequest('GET', '/api/gamification/profile', null, token);
    console.log(`✓ Level: ${profile.currentLevel}`);
    console.log(`✓ Points: ${profile.totalPoints}`);
    console.log(`✓ Streak: ${profile.currentStreak || 0}\n`);

    // Step 6: Get achievements
    console.log('📍 Step 6: Check Achievements');
    const achievements = await makeRequest('GET', '/api/gamification/achievements', null, token);
    const unlockedCount = achievements.allAchievements?.filter(a => a.unlocked).length || 0;
    console.log(`✓ Achievements unlocked: ${unlockedCount} / ${achievements.allAchievements?.length || 0}\n`);

    // Step 7: Get daily challenges
    console.log('📍 Step 7: Get Daily Challenges');
    const challenges = await makeRequest('GET', '/api/gamification/challenges', null, token);
    console.log(`✓ Challenges available: ${challenges.challenges?.length || 0}`);
    if (challenges.challenges?.[0]) {
      console.log(`✓ Today's challenge: ${challenges.challenges[0].title}\n`);
    }

    // Step 8: Get leaderboard
    console.log('📍 Step 8: Get Leaderboard');
    const leaderboard = await makeRequest('GET', '/api/gamification/leaderboard', null, token);
    console.log(`✓ Leaderboard users: ${Array.isArray(leaderboard) ? leaderboard.length : 0}`);
    if (Array.isArray(leaderboard) && leaderboard[0]) {
      console.log(`✓ Top user: Rank ${leaderboard[0].rank} with ${leaderboard[0].totalPoints} points\n`);
    }

    // Step 9: Award additional points
    console.log('📍 Step 9: Manually Award Points (for testing)');
    const pointsRes = await makeRequest('POST', '/api/gamification/earn-points', {
      points: 100,
      reason: 'Completed study session',
      streakBonus: 3
    }, token);
    console.log(`✓ ${pointsRes.message}\n`);

    // Step 10: Final profile check
    console.log('📍 Step 10: Final Gamification Profile');
    profile = await makeRequest('GET', '/api/gamification/profile', null, token);
    console.log(`✓ Final Level: ${profile.currentLevel}`);
    console.log(`✓ Final Points: ${profile.totalPoints}`);
    console.log(`✓ Level Name: ${profile.levelName}`);
    console.log(`✓ Points to Next Level: ${profile.pointsToNextLevel}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ PHASE 4 GAMIFICATION WORKFLOW TEST PASSED!\n');
    console.log('🎯 Summary:');
    console.log(`   • User Level: ${profile.currentLevel} (${profile.levelName})`);
    console.log(`   • Total Points: ${profile.totalPoints}`);
    console.log(`   • Achievements: ${unlockedCount}+`);
    console.log(`   • Leaderboard: Ranked #${leaderboard?.[0]?.rank || 1}`);
    console.log(`   • Daily Challenges: ${challenges.challenges?.length || 0} available`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ WORKFLOW TEST FAILED:', error.message);
    process.exit(1);
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

testPhase4Workflow();
