import "dotenv/config";
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys";

const flowBienvenida = addKeyword("hola").addAnswer("¡Buenas! Bienvenido");

const main = async () => {
    const provider = createProvider(BaileysProvider);
    provider.initHttpServer(3002);

    provider.http.server.post('/send-message', handleCtx(async (bot, req, res) => {
        const { number, message, mediaUrl } = req.body;

        if (!number || !message) {
            res.end(JSON.stringify({ error: "El número y el mensaje son obligatorios." })); 
            return;
        }

        try {
            await bot.sendMessage(number, message, {
                media: mediaUrl || undefined,
            });
            res.end(JSON.stringify({ success: true, message: "Mensaje enviado correctamente." }));
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            res.end(JSON.stringify({ error: "Error al enviar el mensaje." }));
        }
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();
