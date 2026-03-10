const { MongoClient } = require("mongodb")

const uri = process.env.MONGO_URI

exports.handler = async function(event) {

  const body = JSON.parse(event.body)

  const client = new MongoClient(uri)

  await client.connect()

  const db = client.db("remotecontrol")
  const commands = db.collection("commands")

  await commands.updateOne(
    { _id: "remote" },
    {
      $set: {
        command: body.command,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  )

  await client.close()

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  }
}