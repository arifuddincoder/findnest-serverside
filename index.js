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
		const userCollection = db.collection("users");

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

		app.post("/api/users", async (req, res) => {
			const { email, displayName, photoURL, creationTime, lastSignInTime } = req.body;

			if (!email) {
				return res.status(400).send({ error: true, message: "Email is required" });
			}

			const existingUser = await userCollection.findOne({ email });

			if (existingUser) {
				return res.status(200).send({ status: "existing", user: existingUser });
			}

			const result = await userCollection.insertOne({
				email,
				displayName,
				photoURL,
				creationTime,
				lastSignInTime,
			});

			res.status(201).send({ status: "new", insertedId: result.insertedId });
		});

		app.get("/api/stats/total-users", async (req, res) => {
			const total = await userCollection.estimatedDocumentCount();
			res.send({ total });
		});

		app.get("/api/stats/total-listings", async (req, res) => {
			const total = await roommateListingsCollection.estimatedDocumentCount();
			res.send({ total });
		});

		app.get("/api/stats/my-listings", async (req, res) => {
			const authHeader = req.headers.authorization || "";
			const token = authHeader.replace("Bearer ", "");

			try {
				const decoded = await admin.auth().verifyIdToken(token);
				const email = decoded.email;

				const total = await roommateListingsCollection.countDocuments({ email });
				res.send({ total });
			} catch (error) {
				console.error(error);
				res.status(401).send({ error: "Unauthorized" });
			}
		});

		app.get("/api/stats/user-change", async (req, res) => {
			const now = new Date();
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const current = await userCollection.countDocuments({
				createdAt: { $gte: yesterday, $lte: now },
			});

			const previous = await userCollection.countDocuments({
				createdAt: { $lt: yesterday },
			});

			const percentage = previous === 0 ? 100 : ((current - previous) / previous) * 100;

			res.send({ percentage: percentage.toFixed(1) });
		});

		app.get("/api/stats/percentage/listings", async (req, res) => {
			try {
				const now = new Date();
				const yesterday = new Date();
				yesterday.setDate(now.getDate() - 1);

				const dayBeforeYesterday = new Date();
				dayBeforeYesterday.setDate(now.getDate() - 2);

				const current = await roommateListingsCollection.countDocuments({
					createdAt: { $gte: yesterday, $lt: now },
				});

				const previous = await roommateListingsCollection.countDocuments({
					createdAt: { $gte: dayBeforeYesterday, $lt: yesterday },
				});

				const percentage = previous === 0 ? 100 : ((current - previous) / previous) * 100;

				res.send({ percentage: Number(percentage.toFixed(1)) });
			} catch (err) {
				console.error("Error in listings percentage API:", err);
				res.status(500).send({ error: "Internal Server Error" });
			}
		});

		app.get("/api/stats/percentage/my-listings", async (req, res) => {
			const token = req.headers.authorization?.replace("Bearer ", "");

			try {
				const decoded = await admin.auth().verifyIdToken(token);
				const email = decoded.email;

				const now = new Date();
				const yesterday = new Date();
				yesterday.setDate(now.getDate() - 1);

				const dayBeforeYesterday = new Date();
				dayBeforeYesterday.setDate(now.getDate() - 2);

				const current = await roommateListingsCollection.countDocuments({
					email,
					createdAt: { $gte: yesterday, $lt: now },
				});

				const previous = await roommateListingsCollection.countDocuments({
					email,
					createdAt: { $gte: dayBeforeYesterday, $lt: yesterday },
				});

				const percentage = previous === 0 ? 100 : ((current - previous) / previous) * 100;

				res.send({ percentage: Number(percentage.toFixed(1)) });
			} catch (err) {
				console.error("Error in my listings percentage API:", err);
				res.status(401).send({ error: "Unauthorized or Invalid Token" });
			}
		});
	} finally {
	}
}
run().catch(console.dir);

module.exports = app;
