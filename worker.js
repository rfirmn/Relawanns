// Local Worker Script
// Run this in a separate terminal to process queue jobs from Redis
// Usage: node worker.js

require('dotenv').config();
const { dequeueRegistration, moveToFailedQueue } = require('./api/lib/queue');
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000/api/process-registration';
const POLL_INTERVAL = 2000; // 2 seconds

console.log('👷 Local Worker Started');
console.log(`📡 Connecting to API: ${API_URL}`);
console.log('🔄 Polling Redis for jobs...');

async function processJob(job) {
    try {
        console.log(`\n⚙️ Processing Job #${job.id}...`);

        // Forward job to the API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                registrationData: job.registrationData,
                files: job.files
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'API processing failed');
        }

        console.log(`✅ Job #${job.id} Completed!`);

    } catch (error) {
        console.error(`❌ Job #${job.id} Failed:`, error.message);
        await moveToFailedQueue(job, error);
    }
}

async function startWorker() {
    let isRunning = true;

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping worker...');
        isRunning = false;
        process.exit();
    });

    while (isRunning) {
        try {
            const job = await dequeueRegistration(2); // Wait 2s for job

            if (job) {
                await processJob(job);
            } else {
                // No job, wait a bit
                // dequeueRegistration is already blocking for 2s, but if it returns null immediately (error?), we wait.
                // If using brpop, it waits. If using non-blocking, we need sleep.
                // Our dequeueRegistration sends timeout=2 to brpop, so it handles waiting.
                process.stdout.write('.'); // Heartbeat
            }
        } catch (error) {
            console.error('Worker loop error:', error.message);
            await new Promise(r => setTimeout(r, 5000)); // Backoff on error
        }
    }
}

startWorker();
