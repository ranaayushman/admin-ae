import apiClient from "./lib/services/api.client";
import { testService } from "./lib/services/test.service";
import { tokenManager } from "./lib/utils/tokenManager";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  // Try passing a test token if possible or just rely on API directly.
  try {
    const testsResponse = await testService.getTests({ limit: 1 });
    if (!testsResponse.data.length) {
      console.log("No tests found to fetch details for");
      return;
    }
    const testId = testsResponse.data[0]._id;
    console.log("Fetching test:", testId);
    
    // Bypass interceptors just to see what the server responds with
    const rawResponse = await apiClient.get(`/tests/${testId}`);
    console.log("RAW RESPONSE:", JSON.stringify(rawResponse.data, null, 2));

  } catch (err: any) {
    console.error("Error fetching", err.message);
  }
}
run();
