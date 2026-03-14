const { MongoClient } = require("mongodb")

const uri = process.env.MONGO_URI

exports.handler = async function(event){
  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db("remotecontrol")
  const commands = db.collection("commands")

  const doc = await commands.findOne({ _id: "laptop" })

  await client.close()

  if(!doc || !doc.agentUpdatedAt){
    return {
      statusCode: 200,
      body: JSON.stringify({
        online: false,
        battery: null,
        charging: false
      })
    }
  }

  const updatedAt = new Date(doc.agentUpdatedAt)
  const now = new Date()
  const ageMs = now - updatedAt

  // Consider online if updated within last 90 seconds
  const online = ageMs < 90_000

  return {
    statusCode: 200,
    body: JSON.stringify({
      online,
      battery: doc.battery ?? null,
      charging: !!doc.charging
    })
  }
}
