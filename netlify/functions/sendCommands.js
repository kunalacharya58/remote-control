const { MongoClient } = require("mongodb")
const crypto = require("crypto")

const uri = process.env.MONGO_URI
const PASS_HASH = process.env.PASSPHRASE_HASH

exports.handler = async function(event){

  const body = JSON.parse(event.body)

  let authenticated = false

  // check passphrase
  if(body.passphrase){

    const hash = crypto
      .createHash("sha256")
      .update(body.passphrase)
      .digest("hex")

    if(hash === PASS_HASH){
      authenticated = true
    }
  }

  // check token
  if(body.token){
    if(body.token === PASS_HASH){
      authenticated = true
    }
  }

  if(!authenticated){
    return {
      statusCode: 401,
      body: "Invalid passphrase"
    }
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db("remotecontrol")
  const commands = db.collection("commands")

  await commands.updateOne(
    { _id: "remote" },
    {
      $set:{
        command: body.command,
        updatedAt: new Date()
      }
    },
    { upsert:true }
  )

  await client.close()

  return {
    statusCode: 200,
    body: JSON.stringify({ token: PASS_HASH })
  }
}