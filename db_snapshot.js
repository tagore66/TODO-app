

require('dotenv').config();
const mongoose = require('mongoose');

async function showDbRecord() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        

        const rawTask = await mongoose.connection.db.collection('todos').findOne({}, { sort: { _id: -1 } });

        console.log("\n" + "=".repeat(50));
        console.log("   DATA AS STORED IN YOUR MONGODB DATABASE");
        console.log("=".repeat(50));
        
        if (rawTask) {
            console.log(`\nDocument ID: ${rawTask._id}`);
            console.log(`Encrypted Task: \x1b[35m${rawTask.task}\x1b[0m`);
            console.log(`\n\x1b[33mNotice how the task is completely unreadable!\x1b[0m`);
        } else {
            console.log("No tasks found. Add a task in the app first!");
        }
        
        console.log("=".repeat(50) + "\n");
        process.exit(0);
    } catch (err) {
        console.error("Connection error:", err.message);
        process.exit(1);
    }
}

showDbRecord();
