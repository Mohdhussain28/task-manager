const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();
const db = admin.firestore();
router.use(bodyParser.json());

router.post("/tasks", async (req, res) => {
    try {
        const taskData = req?.body;
        const result = await db.collection("tasks").add(taskData);
        res.status(201).json({ id: result.id, data: taskData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/tasks", async (req, res) => {
    try {
        const snapshot = await db.collection("tasks").get();
        const tasks = [];
        snapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/tasks/:taskId", async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const doc = await db.collection("tasks").doc(taskId).get();
        if (!doc.exists) {
            res.status(404).json({ error: "Task not found" });
        } else {
            res.status(200).json({ id: doc.id, ...doc.data() });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/tasks/:taskId", async (req, res) => {
    try {
        const taskId = req?.params?.taskId;
        const updatedData = req?.body;
        await db.collection("tasks").doc(taskId).update(updatedData);
        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/tasks/:taskId", async (req, res) => {
    try {
        const taskId = req?.params?.taskId;
        await db.collection("tasks").doc(taskId).delete();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
