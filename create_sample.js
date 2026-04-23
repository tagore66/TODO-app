require('dotenv').config();
const mongoose = require('mongoose');
const Todo = require('./server/models/Todo');
const User = require('./server/models/User');

async function createEncryptedTask() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne();
        if (!user) throw new Error("No user found");

        const newTodo = new Todo({
            task: "PROTECTED TASK EXAMPLE",
            deadline: new Date(),
            userId: user._id
        });

        await newTodo.save();
        console.log("Successfully created an encrypted task in the database.");
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
createEncryptedTask();
