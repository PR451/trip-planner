import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("tripPlanner");

  switch (req.method) {
    case 'GET':
      const data = await db.collection("planner").findOne({});
      res.json(data || { users: [], availability: {} });
      break;
    case 'POST':
      const { users, availability } = req.body;
      await db.collection("planner").updateOne(
        {},
        { $set: { users, availability } },
        { upsert: true }
      );
      res.json({ message: 'Data updated successfully' });
      break;
    default:
      res.status(405).end(); //Method Not Allowed
  }
}