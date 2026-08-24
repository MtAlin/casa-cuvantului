const API_URL = 'http://localhost:5000/api';

async function testFlow() {
  try {
    console.log('--- TEST 1: Login as Admin ---');
    let res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@casacuvantului.ro', password: 'admin12345' })
    });
    if (!res.ok) throw new Error(`Admin login failed: ${await res.text()}`);
    let data = await res.json();
    const adminToken = data.token;
    console.log('Admin login successful. Token received.');

    console.log('\n--- TEST 2: Create Study Plan ---');
    const newPlan = {
      title: 'Plan de Test: Evanghelia dupa Ioan',
      description: 'Acesta este un test automat',
      year: 2026,
      isActive: true,
      books: [
        {
          bookName: 'Ioan',
          chapterGroups: [
            {
              title: 'Cuvantul s-a facut trup',
              startChapter: 1,
              endChapter: 3,
              questions: [
                { text: 'Ce semnifica lumina in capitolul 1?' },
                { text: 'Ce minune face Isus in Cana Galileii?' },
                { text: 'Cine a fost Nicodim?' },
                { text: 'Ce inseamna sa te nasti din nou?' },
                { text: 'Care este versetul central din Ioan 3?' }
              ]
            }
          ]
        }
      ]
    };
    
    res = await fetch(`${API_URL}/study-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(newPlan)
    });
    if (!res.ok) throw new Error(`Create plan failed: ${await res.text()}`);
    data = await res.json();
    console.log('Study Plan created successfully. ID:', data._id);
    const planId = data._id;

    console.log('\n--- TEST 3: Login as Member ---');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@casacuvantului.ro', password: 'member12345' })
    });
    if (!res.ok) throw new Error(`Member login failed: ${await res.text()}`);
    data = await res.json();
    const memberToken = data.token;
    console.log('Member login successful. Token received.');

    console.log('\n--- TEST 4: Member fetches active plan ---');
    res = await fetch(`${API_URL}/study-plans/active`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    if (!res.ok) throw new Error(`Fetch plan failed: ${await res.text()}`);
    data = await res.json();
    console.log('Active plan fetched successfully. Title:', data.title);
    console.log('Books included:', data.books.map((b: any) => b.bookName));
    console.log('Questions in first group:', data.books[0].chapterGroups[0].questions.length);

    console.log('\n--- TEST 5: Clean up (Admin deletes plan) ---');
    res = await fetch(`${API_URL}/study-plans/${planId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`Delete plan failed: ${await res.text()}`);
    console.log('Plan deleted successfully.');

    console.log('\nALL TESTS PASSED! ✅');

  } catch (error: any) {
    console.error('TEST FAILED ❌');
    console.error(error.message);
  }
}

testFlow();
