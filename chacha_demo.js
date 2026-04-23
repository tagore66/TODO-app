

require('dotenv').config();
const { encrypt, decrypt } = require('./server/utils/encryption');


const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

function runDemo() {
    console.log(`\n${BOLD}${CYAN}=== ChaCha20-Poly1305 Security Demonstration ===${RESET}\n`);


    const originalTask = "Buy groceries for dinner tonight";
    console.log(`${BOLD}1. Original Task (Raw):${RESET}`);
    console.log(`   "${originalTask}"`);
    console.log(`   ${YELLOW}(This is what the user types in the UI)${RESET}\n`);


    console.log(`${BOLD}2. Encrypting with ChaCha20...${RESET}`);
    const encryptedData = encrypt(originalTask);
    

    const [iv, authTag, ciphertext] = encryptedData.split(':');
    
    console.log(`   Full Database String: ${MAGENTA}${encryptedData}${RESET}`);
    console.log(`   ${YELLOW}--------------------------------------------------${RESET}`);
    console.log(`   Breakdown:`);
    console.log(`   - IV (Nonce): ${CYAN}${iv}${RESET} (Unique per task)`);
    console.log(`   - Auth Tag:   ${GREEN}${authTag}${RESET} (Prevents tampering)`);
    console.log(`   - Ciphertext: ${MAGENTA}${ciphertext}${RESET} (The actual secret data)`);
    console.log(`   ${YELLOW}--------------------------------------------------${RESET}\n`);


    console.log(`${BOLD}3. What the Database Admin sees:${RESET}`);
    console.log(`   Task: "${MAGENTA}${encryptedData}${RESET}"`);
    console.log(`   ${YELLOW}(Even if the database is leaked, the task is unreadable without the secret key)${RESET}\n`);


    console.log(`${BOLD}4. Decrypting for UI Display...${RESET}`);
    const decryptedTask = decrypt(encryptedData);
    console.log(`   Decrypted Result: "${GREEN}${decryptedTask}${RESET}"`);
    console.log(`   ${YELLOW}(Successful match: ${decryptedTask === originalTask ? '✅ YES' : '❌ NO'})${RESET}\n`);
    
    console.log(`${BOLD}${CYAN}===============================================${RESET}\n`);
}


if (!process.env.ENCRYPTION_KEY) {
    console.error("\x1b[31mError: ENCRYPTION_KEY not found in .env file!\x1b[0m");
} else {
    runDemo();
}
