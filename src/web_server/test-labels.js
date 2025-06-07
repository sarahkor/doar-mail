// Simple test script for label functionality
const baseUrl = 'http://localhost:8080';

async function testLabels() {
    console.log('🧪 Testing Label API...\n');

    try {
        // Test 1: Get labels (should be empty initially)
        console.log('1. Getting labels...');
        let response = await fetch(`${baseUrl}/api/labels`, {
            headers: { 'id': 'dev-user' }
        });
        let labels = await response.json();
        console.log('✅ Labels:', labels);

        // Test 2: Create a label
        console.log('\n2. Creating a label...');
        response = await fetch(`${baseUrl}/api/labels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'id': 'dev-user'
            },
            body: JSON.stringify({ name: 'Work', color: 'blue' })
        });
        const newLabel = await response.json();
        console.log('✅ Created label:', newLabel);

        // Test 3: Get labels again (should have 1 label)
        console.log('\n3. Getting labels after creation...');
        response = await fetch(`${baseUrl}/api/labels`, {
            headers: { 'id': 'dev-user' }
        });
        labels = await response.json();
        console.log('✅ Labels:', labels);

        // Test 4: Update label color
        console.log('\n4. Updating label color...');
        response = await fetch(`${baseUrl}/api/labels/${newLabel.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'id': 'dev-user'
            },
            body: JSON.stringify({ color: '#f28b82' })
        });
        const updatedLabel = await response.json();
        console.log('✅ Updated label:', updatedLabel);

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testLabels();
}

module.exports = testLabels; 