require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

var admin = require("firebase-admin");
var serviceAccount = require("./b11a10-findnest-firebase-adminsdk-fbsvc-a6f30a287d.json");
if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

var express = require("express");
var cors = require("cors");
var app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mljuhsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const db = client.db("findnest");
		const roommateListingsCollection = db.collection("roommateListings");

		app.get("/api/roommates", async (req, res) => {
			const result = await roommateListingsCollection.find().toArray();
			res.send(result);
		});

		app.post("/api/roommates", async (req, res) => {
			const listing = req.body;
			const result = await roommateListingsCollection.insertOne(listing);
			res.send(result);
		});

		app.get("/api/roommates/available", async (req, res) => {
			try {
				const result = await roommateListingsCollection.find({ availability: "Available" }).limit(6).toArray();

				res.send(result);
			} catch (err) {
				res.status(500).send({ error: "Failed to fetch available listings" });
			}
		});

		app.get("/api/roommates/:id", async (req, res) => {
			const id = req.params.id;
			const query = {
				_id: new ObjectId(id),
			};
			const result = await roommateListingsCollection.findOne(query);
			res.send(result);
		});

		app.get("/api/my-roommates", async (req, res) => {
			const authHeader = req.headers.authorization || "";
			const token = authHeader.replace("Bearer ", "");

			try {
				const decodedToken = await admin.auth().verifyIdToken(token);
				const email = decodedToken.email;

				const result = await roommateListingsCollection.find({ email }).toArray();
				res.send(result);
			} catch (error) {
				console.error("Auth failed:", error);
				res.status(401).send({ error: "Unauthorized access" });
			}
		});

		app.put("/api/my-roommates/:id", async (req, res) => {
			const authHeader = req.headers.authorization || "";
			const token = authHeader.replace("Bearer ", "");

			try {
				const decoded = await admin.auth().verifyIdToken(token);
				const userEmail = decoded.email;
				const id = req.params.id;
				const updatedData = req.body;

				const existing = await roommateListingsCollection.findOne({ _id: new ObjectId(id) });

				if (!existing) {
					return res.status(404).send({ error: "Listing not found" });
				}

				if (existing.email !== userEmail) {
					return res.status(403).send({ error: "Unauthorized: You cannot update this listing" });
				}

				const result = await roommateListingsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

				res.send(result);
			} catch (err) {
				res.status(401).send({ error: "Invalid or expired token" });
			}
		});

		app.delete("/api/my-roommates/:id", async (req, res) => {
			const authHeader = req.headers.authorization || "";
			const token = authHeader.replace("Bearer ", "");

			try {
				const decoded = await admin.auth().verifyIdToken(token);
				const userEmail = decoded.email;

				const id = req.params.id;

				const item = await roommateListingsCollection.findOne({ _id: new ObjectId(id) });

				if (!item) {
					return res.status(404).send({ error: "Listing not found" });
				}

				if (item.email !== userEmail) {
					return res.status(403).send({ error: "Unauthorized: You cannot delete this listing" });
				}

				const result = await roommateListingsCollection.deleteOne({ _id: new ObjectId(id) });
				res.send(result);
			} catch (err) {
				console.error(err);
				res.status(401).send({ error: "Invalid or expired token" });
			}
		});

		app.patch("/api/roommates/:id/like", async (req, res) => {
			const token = req.headers.authorization?.replace("Bearer ", "");

			try {
				const decoded = await admin.auth().verifyIdToken(token);
				const userEmail = decoded.email;
				const id = req.params.id;

				const listing = await roommateListingsCollection.findOne({ _id: new ObjectId(id) });

				if (!listing) {
					return res.status(404).send({ error: "Listing not found" });
				}

				if (listing.email === userEmail) {
					return res.status(403).send({ error: "You cannot like your own listing" });
				}

				const result = await roommateListingsCollection.updateOne(
					{ _id: new ObjectId(id) },
					{
						$inc: { likeCount: 1 },
						$addToSet: { likedUsers: userEmail },
					}
				);

				res.send({ success: true });
			} catch (err) {
				console.error("Like error:", err);
				res.status(401).send({ error: "Unauthorized" });
			}
		});
	} finally {
	}
}
run().catch(console.dir);

module.exports = app;
