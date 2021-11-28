async function handler(event, context) {
    console.log("Ambiente", JSON.stringify(process.env, null))
    console.log("Evento...", JSON.stringify(event, null,))
    return {
        message: "Hey Jude"
    }
}

module.exports = { handler };